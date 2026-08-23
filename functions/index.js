"use strict";

const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functionsV1 = require("firebase-functions/v1");
const crypto = require("crypto");

setGlobalOptions({ region: "us-central1", maxInstances: 20 });

// Do not initializeApp / onInit at import time. Firebase CLI loads this file
// to discover exports and times out after 10s on Windows if credentials I/O runs.
let db;
let bucket;
let FieldValue;
let Timestamp;

const LISTING_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EXPIRY_GRACE_MS = 60 * 60 * 1000;
const CLEANUP_BATCH_LIMIT = 200;

function initAdmin() {
  if (db) return db;
  const { initializeApp, getApp } = require("firebase-admin/app");
  const firestore = require("firebase-admin/firestore");
  FieldValue = firestore.FieldValue;
  Timestamp = firestore.Timestamp;
  try {
    getApp();
  } catch {
    initializeApp();
  }
  db = firestore.getFirestore();
  return db;
}

function getDb() {
  return db || initAdmin();
}

function getBucket() {
  initAdmin();
  if (!bucket) {
    const { getStorage } = require("firebase-admin/storage");
    bucket = getStorage().bucket();
  }
  return bucket;
}

const NORMAL_CYCLE = 3;
const MEGA_CYCLE = 10;
const FEATURED_CREDIT_DAYS = 7;

const STATUS_COMPLETED = "Completed";
const STATUS_PAYMENT_DETAILS_REQUIRED = "Payment Details Required";
const STATUS_PAYMENT_DETAILS_SUBMITTED = "Payment Details Submitted";
const STATUS_PAYMENT_PROCESSING = "Payment Processing";
const STATUS_PAID = "Paid";
const LEGACY_CASH_PENDING = "Pending";

const PAYMENT_METHODS = ["paypal", "bank_transfer", "wise", "other"];

const NORMAL_PRIZES = [
  { key: "try_again", label: "Try Again", chance: 45, featuredCredits: 0, cashAmount: 0, bonusSpin: false },
  { key: "featured_1", label: "1 Featured Ad", chance: 30, featuredCredits: 1, cashAmount: 0, bonusSpin: false },
  { key: "featured_3", label: "3 Featured Ads", chance: 15, featuredCredits: 3, cashAmount: 0, bonusSpin: false },
  { key: "free_spin", label: "1 Free Spin", chance: 9, featuredCredits: 0, cashAmount: 0, bonusSpin: true },
  { key: "cash_5", label: "$5 Cash", chance: 1, featuredCredits: 0, cashAmount: 5, bonusSpin: false },
];

const MEGA_PRIZES = [
  { key: "try_again", label: "Try Again", chance: 35, featuredCredits: 0, cashAmount: 0, bonusSpin: false },
  { key: "featured_3", label: "3 Featured Ads", chance: 30, featuredCredits: 3, cashAmount: 0, bonusSpin: false },
  { key: "featured_5", label: "5 Featured Ads", chance: 20, featuredCredits: 5, cashAmount: 0, bonusSpin: false },
  { key: "bonus_spin", label: "Bonus Spin", chance: 10, featuredCredits: 0, cashAmount: 0, bonusSpin: true },
  { key: "cash_10", label: "$10 Cash", chance: 4, featuredCredits: 0, cashAmount: 10, bonusSpin: false },
  { key: "cash_25", label: "$25 Cash", chance: 1, featuredCredits: 0, cashAmount: 25, bonusSpin: false },
];

function assertPrizeTable(prizes) {
  const total = prizes.reduce((sum, prize) => sum + prize.chance, 0);
  if (total !== 100) {
    throw new Error(`Prize chances must sum to 100, got ${total}`);
  }
}

assertPrizeTable(NORMAL_PRIZES);
assertPrizeTable(MEGA_PRIZES);

function pickPrize(prizes) {
  const roll = crypto.randomInt(100);
  let acc = 0;
  for (const prize of prizes) {
    acc += prize.chance;
    if (roll < acc) return prize;
  }
  return prizes[prizes.length - 1];
}

function historyStatusForPrize(prize) {
  if (prize.cashAmount > 0) return STATUS_PAYMENT_DETAILS_REQUIRED;
  return STATUS_COMPLETED;
}

function rewardTypeForPrize(prize) {
  if (prize.cashAmount > 0) return "cash";
  if (prize.featuredCredits > 0) return "featured";
  if (prize.bonusSpin) return "bonus_spin";
  return "try_again";
}

function rewardValueForPrize(prize) {
  if (prize.cashAmount > 0) return prize.cashAmount;
  if (prize.featuredCredits > 0) return prize.featuredCredits;
  if (prize.bonusSpin) return 1;
  return 0;
}

function clipString(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function userDisplayName(user) {
  return clipString(user.displayName || user.name || user.fullName || "", 80);
}

async function assertAdmin(uid) {
  const snap = await getDb().collection("users").doc(uid).get();
  if (!snap.exists || snap.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Admin only.");
  }
}

async function notifyUser(userEmail, title, message, type) {
  if (!userEmail) return;
  await getDb().collection("notifications").add({
    userEmail,
    title,
    message,
    type,
    isRead: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function sanitizePaymentDetails(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpsError("invalid-argument", "Payment details are required.");
  }

  const method = clipString(input.method, 40).toLowerCase();
  if (!PAYMENT_METHODS.includes(method)) {
    throw new HttpsError("invalid-argument", "Choose a valid payment method.");
  }

  const fullName = clipString(input.fullName, 80);
  if (!fullName) {
    throw new HttpsError("invalid-argument", "Account holder name is required.");
  }

  const email = clipString(input.email, 120).toLowerCase();
  const accountIdentifier = clipString(input.accountIdentifier, 120);
  const bankName = clipString(input.bankName, 80);
  const notes = clipString(input.notes, 400);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Enter a valid payout email.");
  }

  if (method === "paypal" || method === "wise") {
    if (!email) {
      throw new HttpsError("invalid-argument", "Payout email is required.");
    }
  } else if (method === "bank_transfer") {
    if (!bankName || !accountIdentifier) {
      throw new HttpsError(
        "invalid-argument",
        "Bank name and account number are required."
      );
    }
  } else if (!email && !accountIdentifier && !notes) {
    throw new HttpsError(
      "invalid-argument",
      "Add an email, account number, or notes so we can pay you."
    );
  }

  return {
    method,
    fullName,
    email: email || null,
    accountIdentifier: accountIdentifier || null,
    bankName: bankName || null,
    notes: notes || null,
  };
}

function isEligiblePublishedListing(data) {
  if (!data) return false;
  if (data.approved !== true) return false;
  if (data.rejected === true) return false;
  if (data.draft === true) return false;
  if (data.expired === true) return false;
  const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
  if (status === "draft" || status === "rejected" || status === "expired") return false;
  return true;
}

/**
 * Count a published listing toward normal (3) and mega (10) spin cycles.
 * First publish: create with approved:true, or admin flip false→true.
 * Same listing ID is never counted twice (rewardCounted + per-user ledger).
 * If a prior attempt never stamped rewardCounted, a later eligible write retries.
 */
async function countListingTowardRewards(beforeSnap, afterSnap, listingId) {
  if (!afterSnap?.exists) return;

  const after = afterSnap.data();
  if (!isEligiblePublishedListing(after)) return;
  if (after.rewardCounted === true) return;

  const ownerId = typeof after.ownerId === "string" ? after.ownerId : "";
  if (!ownerId) {
    console.warn("Reward count skipped: listing has no ownerId", listingId);
    return;
  }

  const listingRef = getDb().collection("listings").doc(listingId);
  const userRef = getDb().collection("users").doc(ownerId);
  const countedRef = userRef.collection("rewardCountedListings").doc(listingId);

  await getDb().runTransaction(async (transaction) => {
    const [listingFresh, countedSnap, userSnap] = await Promise.all([
      transaction.get(listingRef),
      transaction.get(countedRef),
      transaction.get(userRef),
    ]);

    if (!listingFresh.exists) return;
    const listing = listingFresh.data();
    if (!isEligiblePublishedListing(listing)) return;
    if (listing.rewardCounted === true) return;
    if (countedSnap.exists) {
      transaction.update(listingRef, {
        rewardCounted: true,
        rewardCountedAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    const userData = userSnap.exists ? userSnap.data() : {};
    let normalProgress = Number(userData.rewardNormalProgress ?? 0) + 1;
    let megaProgress = Number(userData.rewardMegaProgress ?? 0) + 1;
    let availableSpins = Number(userData.availableSpins ?? 0);
    let availableMegaSpins = Number(userData.availableMegaSpins ?? 0);
    const rewardApprovedAdsCount = Number(userData.rewardApprovedAdsCount ?? 0) + 1;

    if (normalProgress >= NORMAL_CYCLE) {
      availableSpins += 1;
      normalProgress = 0;
    }
    if (megaProgress >= MEGA_CYCLE) {
      availableMegaSpins += 1;
      megaProgress = 0;
    }

    transaction.update(listingRef, {
      rewardCounted: true,
      rewardCountedAt: FieldValue.serverTimestamp(),
    });

    transaction.set(
      userRef,
      {
        availableSpins,
        availableMegaSpins,
        rewardNormalProgress: normalProgress,
        rewardMegaProgress: megaProgress,
        rewardApprovedAdsCount,
      },
      { merge: true }
    );

    transaction.set(countedRef, {
      listingId,
      countedAt: FieldValue.serverTimestamp(),
    });
  });
}

/**
 * 1st-gen Firestore onWrite (not Eventarc / 2nd-gen onDocumentWritten).
 * Count once when a listing is first published (create approved:true, or admin flip).
 */
exports.onListingWrittenForRewards = functionsV1
  .region("us-central1")
  .firestore.document("listings/{listingId}")
  .onWrite(async (change, context) => {
    await countListingTowardRewards(change.before, change.after, context.params.listingId);
  });

/**
 * Callable spin: client only sends type. Prize, credits, cash, and spin
 * deduction are decided here inside a transaction.
 */
exports.spinReward = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in to spin the prize wheel.");
  }

  const uid = request.auth.uid;
  const type = request.data?.type;
  const requestId =
    typeof request.data?.requestId === "string" ? request.data.requestId.trim() : "";

  if (type !== "normal" && type !== "mega") {
    throw new HttpsError("invalid-argument", "Spin type must be normal or mega.");
  }
  if (requestId && (requestId.length < 8 || requestId.length > 80)) {
    throw new HttpsError("invalid-argument", "Invalid spin request id.");
  }

  const prizes = type === "mega" ? MEGA_PRIZES : NORMAL_PRIZES;
  const userRef = getDb().collection("users").doc(uid);
  const historyRef = userRef.collection("rewardHistory").doc();
  const requestRef = requestId
    ? userRef.collection("rewardSpinRequests").doc(requestId)
    : null;

  const result = await getDb().runTransaction(async (transaction) => {
    const reads = [transaction.get(userRef)];
    if (requestRef) reads.push(transaction.get(requestRef));
    const [userSnap, requestSnap] = await Promise.all(reads);

    if (requestSnap?.exists) {
      return requestSnap.data().result;
    }

    if (!userSnap.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }

    const user = userSnap.data();
    let availableSpins = Number(user.availableSpins ?? 0);
    let availableMegaSpins = Number(user.availableMegaSpins ?? 0);

    if (type === "normal") {
      if (availableSpins < 1) {
        throw new HttpsError("failed-precondition", "NO_SPINS");
      }
      availableSpins -= 1;
    } else {
      if (availableMegaSpins < 1) {
        throw new HttpsError("failed-precondition", "NO_MEGA_SPINS");
      }
      availableMegaSpins -= 1;
    }

    const prize = pickPrize(prizes);
    const status = historyStatusForPrize(prize);
    const featuredCreditsAwarded = prize.featuredCredits;
    const cashAmount = prize.cashAmount;
    const bonusSpin = prize.bonusSpin === true;
    const rewardType = rewardTypeForPrize(prize);
    const rewardValue = rewardValueForPrize(prize);
    const userEmail = clipString(user.email || request.auth.token.email || "", 120);
    const userName = userDisplayName(user) || clipString(request.auth.token.name || "", 80);

    if (bonusSpin) {
      availableSpins += 1;
    }

    const updates = {
      availableSpins,
      availableMegaSpins,
    };

    if (featuredCreditsAwarded > 0) {
      const currentCredits = Number(user.featuredCredits ?? 0);
      const lots = Array.isArray(user.featuredCreditLots)
        ? user.featuredCreditLots.map((lot) => ({ ...lot }))
        : [];
      lots.push({
        purchaseId: `reward-${historyRef.id}`,
        packageId: "pippinway-rewards",
        durationDays: FEATURED_CREDIT_DAYS,
        remaining: featuredCreditsAwarded,
        total: featuredCreditsAwarded,
        createdAt: Timestamp.now(),
      });
      updates.featuredCredits = currentCredits + featuredCreditsAwarded;
      updates.featuredCreditLots = lots;
    }

    const historyDoc = {
      userId: uid,
      userEmail,
      userName,
      type,
      prizeKey: prize.key,
      prizeLabel: prize.label,
      rewardType,
      rewardValue,
      status,
      featuredCreditsAwarded,
      cashAmount,
      bonusSpin,
      requestId: requestId || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (cashAmount > 0) {
      historyDoc.paymentDetails = null;
      historyDoc.paymentStatus = STATUS_PAYMENT_DETAILS_REQUIRED;
      historyDoc.paidAt = null;
      historyDoc.paymentReference = null;
    }

    const payload = {
      type,
      prizeKey: prize.key,
      prizeLabel: prize.label,
      status,
      featuredCreditsAwarded,
      cashAmount,
      bonusSpin,
      historyId: historyRef.id,
      availableSpins,
      availableMegaSpins,
    };

    transaction.update(userRef, updates);
    transaction.set(historyRef, historyDoc);
    if (requestRef) {
      transaction.set(requestRef, {
        type,
        createdAt: FieldValue.serverTimestamp(),
        result: payload,
      });
    }

    return payload;
  });

  return result;
});

function cashHistoryRef(userId, historyId) {
  return getDb().collection("users").doc(userId).collection("rewardHistory").doc(historyId);
}

function isCashReward(data) {
  return Number(data?.cashAmount ?? 0) > 0;
}

function canSubmitPaymentDetails(data) {
  if (!isCashReward(data)) return false;
  const status = data.status;
  return (
    status === STATUS_PAYMENT_DETAILS_REQUIRED ||
    status === LEGACY_CASH_PENDING
  );
}

/**
 * Customer submits payout details for a cash win they own.
 * Only allowed while status is Payment Details Required.
 */
exports.submitRewardPaymentDetails = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in to submit payment details.");
  }

  const uid = request.auth.uid;
  const historyId =
    typeof request.data?.historyId === "string" ? request.data.historyId.trim() : "";
  if (!historyId || historyId.length > 80) {
    throw new HttpsError("invalid-argument", "Invalid reward id.");
  }

  const paymentDetails = sanitizePaymentDetails(request.data?.paymentDetails);
  const historyRef = cashHistoryRef(uid, historyId);

  await getDb().runTransaction(async (transaction) => {
    const snap = await transaction.get(historyRef);
    if (!snap.exists) {
      throw new HttpsError("not-found", "Reward not found.");
    }

    const data = snap.data();
    if (data.userId && data.userId !== uid) {
      throw new HttpsError("permission-denied", "This reward is not yours.");
    }
    if (!canSubmitPaymentDetails(data)) {
      throw new HttpsError(
        "failed-precondition",
        "Payment details can only be submitted once, while required."
      );
    }

    transaction.update(historyRef, {
      paymentDetails: {
        ...paymentDetails,
        submittedAt: FieldValue.serverTimestamp(),
      },
      status: STATUS_PAYMENT_DETAILS_SUBMITTED,
      paymentStatus: STATUS_PAYMENT_DETAILS_SUBMITTED,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return {
    historyId,
    status: STATUS_PAYMENT_DETAILS_SUBMITTED,
    paymentStatus: STATUS_PAYMENT_DETAILS_SUBMITTED,
  };
});

/**
 * Admin advances a cash reward: Submitted → Processing → Paid.
 * Notifies the customer when marked Paid. Does not send money.
 */
exports.updateCashRewardStatus = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in as admin.");
  }

  await assertAdmin(request.auth.uid);

  const userId =
    typeof request.data?.userId === "string" ? request.data.userId.trim() : "";
  const historyId =
    typeof request.data?.historyId === "string" ? request.data.historyId.trim() : "";
  const nextStatus =
    typeof request.data?.nextStatus === "string" ? request.data.nextStatus.trim() : "";
  const paymentReference = clipString(request.data?.paymentReference, 80);

  if (!userId || !historyId) {
    throw new HttpsError("invalid-argument", "Reward id is required.");
  }
  if (
    nextStatus !== STATUS_PAYMENT_PROCESSING &&
    nextStatus !== STATUS_PAID
  ) {
    throw new HttpsError("invalid-argument", "Invalid cash reward status.");
  }

  const historyRef = cashHistoryRef(userId, historyId);

  const updated = await getDb().runTransaction(async (transaction) => {
    const snap = await transaction.get(historyRef);
    if (!snap.exists) {
      throw new HttpsError("not-found", "Reward not found.");
    }

    const data = snap.data();
    if (!isCashReward(data)) {
      throw new HttpsError("failed-precondition", "This reward is not a cash prize.");
    }

    const current = data.status;
    const updates = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
    };

    if (nextStatus === STATUS_PAYMENT_PROCESSING) {
      if (current !== STATUS_PAYMENT_DETAILS_SUBMITTED) {
        throw new HttpsError(
          "failed-precondition",
          "Only submitted cash rewards can move to processing."
        );
      }
      updates.status = STATUS_PAYMENT_PROCESSING;
      updates.paymentStatus = STATUS_PAYMENT_PROCESSING;
    } else {
      if (current === STATUS_PAID) {
        return {
          alreadyPaid: true,
          status: STATUS_PAID,
          cashAmount: Number(data.cashAmount ?? 0),
          userEmail: data.userEmail || "",
        };
      }
      if (current !== STATUS_PAYMENT_PROCESSING) {
        throw new HttpsError(
          "failed-precondition",
          "Cash rewards must be processing before they can be marked paid."
        );
      }
      updates.status = STATUS_PAID;
      updates.paymentStatus = STATUS_PAID;
      updates.paidAt = FieldValue.serverTimestamp();
      updates.paidBy = request.auth.uid;
      if (paymentReference) {
        updates.paymentReference = paymentReference;
      }
    }

    transaction.update(historyRef, updates);

    return {
      alreadyPaid: false,
      status: updates.status,
      cashAmount: Number(data.cashAmount ?? 0),
      userEmail: data.userEmail || "",
      notifyPaid: nextStatus === STATUS_PAID,
    };
  });

  if (updated.notifyPaid && !updated.alreadyPaid) {
    let email = updated.userEmail;
    if (!email) {
      const userSnap = await getDb().collection("users").doc(userId).get();
      email = userSnap.exists ? clipString(userSnap.data().email || "", 120) : "";
    }
    const amount = Number(updated.cashAmount ?? 0);
    await notifyUser(
      email,
      "Reward payment processed",
      `Your $${amount} Pippinway reward payment has been processed. 🎉`,
      "reward"
    );
  }

  return {
    historyId,
    userId,
    status: updated.status,
    paymentStatus: updated.status,
  };
});

function toValidTimestamp(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") {
    const ms = value.toMillis();
    if (!Number.isFinite(ms) || ms <= 0) return null;
    return Timestamp.fromMillis(ms);
  }
  if (typeof value.seconds === "number" && Number.isFinite(value.seconds)) {
    const ms = value.seconds * 1000;
    if (ms <= 0) return null;
    return new Timestamp(value.seconds, value.nanoseconds || 0);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime()) && value.getTime() > 0) {
    return Timestamp.fromDate(value);
  }
  return null;
}

function listingStartTimestamp(data) {
  return toValidTimestamp(data?.publishedAt) || toValidTimestamp(data?.createdAt);
}

function computeExpiresAt(startTs) {
  return Timestamp.fromMillis(startTs.toMillis() + LISTING_TTL_MS);
}

/**
 * Server-computed 30-day expiry. Overwrites any client expiresAt hint.
 * Does not touch reward fields, so onListingWrittenForRewards stays a no-op.
 */
async function applyServerListingExpiry(listingRef, data) {
  initAdmin();
  const now = Timestamp.now();
  const start = listingStartTimestamp(data) || now;
  const updates = {
    expiresAt: computeExpiresAt(start),
    expired: false,
  };
  if (!toValidTimestamp(data?.createdAt)) {
    updates.createdAt = now;
  }
  await listingRef.update(updates);
}

/**
 * 1st-gen onCreate — sets expiresAt from createdAt/publishedAt + 30 days
 * using Admin/server time. Client expiresAt is only a hint.
 */
exports.onListingCreatedSetExpiry = functionsV1
  .region("us-central1")
  .firestore.document("listings/{listingId}")
  .onCreate(async (snap) => {
    initAdmin();
    await applyServerListingExpiry(snap.ref, snap.data() || {});
  });

function collectImageUrls(data) {
  const urls = [];
  if (Array.isArray(data?.imageUrls)) {
    for (const url of data.imageUrls) {
      if (typeof url === "string" && url) urls.push(url);
    }
  }
  if (typeof data?.imageUrl === "string" && data.imageUrl) {
    urls.push(data.imageUrl);
  }
  return [...new Set(urls)];
}

function storagePathFromUrl(url) {
  if (typeof url !== "string" || !url) return null;
  try {
    const gs = url.match(/^gs:\/\/[^/]+\/(.+)$/);
    if (gs) return decodeURIComponent(gs[1]);

    const encoded = url.match(/\/o\/([^?]+)/);
    if (encoded) return decodeURIComponent(encoded[1]);

    const hosted = url.match(/storage\.googleapis\.com\/(.+)$/);
    if (hosted) return decodeURIComponent(hosted[1].split("?")[0]);
  } catch (err) {
    console.warn("Could not parse storage path", url, err);
  }
  return null;
}

function isListingStoragePath(path) {
  return typeof path === "string" && path.startsWith("listings/");
}

async function deleteListingImages(data, listingId) {
  const paths = [
    ...new Set(
      collectImageUrls(data)
        .map(storagePathFromUrl)
        .filter(isListingStoragePath)
    ),
  ];
  if (paths.length === 0) return;

  const storageBucket = getBucket();
  await Promise.all(
    paths.map(async (path) => {
      try {
        await storageBucket.file(path).delete({ ignoreNotFound: true });
      } catch (err) {
        console.warn("Storage delete failed", listingId, path, err);
      }
    })
  );
}

async function deleteListingOnlySubdocs(listingRef) {
  const collections = await listingRef.listCollections();
  for (const col of collections) {
    const docs = await col.listDocuments();
    await Promise.all(docs.map((docRef) => docRef.delete()));
  }
}

function isSafeToPermanentlyDelete(data, nowMs) {
  const createdAt = toValidTimestamp(data?.createdAt);
  const publishedAt = toValidTimestamp(data?.publishedAt);
  const expiresAt = toValidTimestamp(data?.expiresAt);
  const start =
    publishedAt && createdAt && publishedAt.toMillis() > createdAt.toMillis()
      ? publishedAt
      : publishedAt || createdAt;
  if (start) {
    const ageMs = nowMs - start.toMillis();
    if (ageMs < LISTING_TTL_MS + EXPIRY_GRACE_MS) {
      return { ok: false, reason: "within_grace" };
    }
    return { ok: true };
  }
  if (expiresAt && nowMs > expiresAt.toMillis() + EXPIRY_GRACE_MS) {
    return { ok: true };
  }
  return { ok: false, reason: "missing_createdAt" };
}

async function loadExpiredListingCandidates(now) {
  const cutoff = Timestamp.fromMillis(now.toMillis() - LISTING_TTL_MS);
  const listingsRef = getDb().collection("listings");
  const [byExpiry, byCreated] = await Promise.all([
    listingsRef.where("expiresAt", "<=", now).limit(CLEANUP_BATCH_LIMIT).get(),
    listingsRef.where("createdAt", "<=", cutoff).limit(CLEANUP_BATCH_LIMIT).get(),
  ]);

  const byId = new Map();
  for (const snap of [...byExpiry.docs, ...byCreated.docs]) {
    byId.set(snap.id, snap);
  }
  return [...byId.values()];
}

async function permanentlyDeleteListing(snap) {
  const listingId = snap.id;
  const data = snap.data() || {};
  await deleteListingImages(data, listingId);
  await deleteListingOnlySubdocs(snap.ref);
  await snap.ref.delete();
}

/**
 * Scheduled every 6 hours (UTC). Finds listings past createdAt/publishedAt +
 * 30 days and permanently deletes the Firestore doc plus listing images.
 * Never deletes users, profiles, chats, notifications, or reward history.
 * Safe check: valid createdAt required; age must be >= 30 days + 1 hour grace.
 */
exports.cleanupExpiredListings = functionsV1
  .region("us-central1")
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .pubsub.schedule("every 6 hours")
  .timeZone("UTC")
  .onRun(async () => {
    initAdmin();
    const now = Timestamp.now();
    const nowMs = now.toMillis();
    const candidates = await loadExpiredListingCandidates(now);

    let deleted = 0;
    let skipped = 0;

    for (const snap of candidates) {
      const check = isSafeToPermanentlyDelete(snap.data() || {}, nowMs);
      if (!check.ok) {
        skipped += 1;
        if (check.reason === "missing_createdAt") {
          console.warn("Expiry cleanup skipped listing with no createdAt", snap.id);
        }
        continue;
      }
      try {
        await permanentlyDeleteListing(snap);
        deleted += 1;
      } catch (err) {
        console.error("Expiry cleanup failed for listing", snap.id, err);
      }
    }

    console.log(
      `cleanupExpiredListings: deleted=${deleted} skipped=${skipped} candidates=${candidates.length}`
    );
    return { deleted, skipped, candidates: candidates.length };
  });

function getFeaturedExpiryMs(data) {
  const explicit =
    toValidTimestamp(data?.featuredUntil) ||
    toValidTimestamp(data?.featuredExpiryDate) ||
    toValidTimestamp(data?.featuredExpiresAt);
  if (explicit) return explicit.toMillis();

  const start =
    toValidTimestamp(data?.featuredStartDate) || listingStartTimestamp(data);
  if (start) {
    return start.toMillis() + FEATURED_CREDIT_DAYS * 24 * 60 * 60 * 1000;
  }
  return null;
}

/**
 * Scheduled every 2 hours (UTC). Clears featured flags after featuredUntil /
 * featuredExpiryDate / featuredExpiresAt (or start + 7 days) is past server time.
 * The listing stays live as a normal approved ad. Does not delete listings
 * and does not touch 30-day listing expiry.
 */
exports.cleanupExpiredFeatured = functionsV1
  .region("us-central1")
  .runWith({ timeoutSeconds: 540, memory: "256MB" })
  .pubsub.schedule("every 2 hours")
  .timeZone("UTC")
  .onRun(async () => {
    initAdmin();
    const nowMs = Timestamp.now().toMillis();
    const featuredSnap = await getDb()
      .collection("listings")
      .where("featured", "==", true)
      .limit(CLEANUP_BATCH_LIMIT)
      .get();

    let cleared = 0;
    let skipped = 0;

    for (const snap of featuredSnap.docs) {
      const data = snap.data() || {};
      const expiryMs = getFeaturedExpiryMs(data);
      if (expiryMs == null || expiryMs > nowMs) {
        skipped += 1;
        continue;
      }

      try {
        await snap.ref.update({
          featured: false,
          adType: "free",
          featuredClearedAt: FieldValue.serverTimestamp(),
        });
        cleared += 1;
      } catch (err) {
        console.error("Featured expiry cleanup failed for listing", snap.id, err);
      }
    }

    console.log(
      `cleanupExpiredFeatured: cleared=${cleared} skipped=${skipped} candidates=${featuredSnap.size}`
    );
    return { cleared, skipped, candidates: featuredSnap.size };
  });

const LISTING_IMAGE_MAX_EDGE_PX = 1200;
const LISTING_IMAGE_JPEG_QUALITY = 65;
const LISTING_IMAGE_SKIP_UNDER_BYTES = 80 * 1024;
const COMPRESS_LISTING_BATCH = 20;
const COMPRESS_CURSOR_PATH = "_meta/listingImageCompress";

async function compressListingStorageFile(path) {
  const file = getBucket().file(path);
  const [exists] = await file.exists();
  if (!exists) return { changed: false, reason: "missing" };

  const [meta] = await file.getMetadata();
  if (meta.metadata?.pippinwayCompressed === "1") {
    return { changed: false, reason: "already_marked" };
  }

  const size = Number(meta.size || 0);
  if (size > 0 && size <= LISTING_IMAGE_SKIP_UNDER_BYTES) {
    await file.setMetadata({
      metadata: { ...(meta.metadata || {}), pippinwayCompressed: "1" },
    });
    return { changed: false, reason: "already_small", bytesBefore: size };
  }

  const [buf] = await file.download();
  const sharp = require("sharp");
  const image = sharp(buf, { failOn: "none" }).rotate();
  const info = await image.metadata();
  const width = info.width || 0;
  const height = info.height || 0;
  const maxEdge = Math.max(width, height);

  let pipeline = image;
  if (maxEdge > LISTING_IMAGE_MAX_EDGE_PX) {
    pipeline = pipeline.resize({
      width: width >= height ? LISTING_IMAGE_MAX_EDGE_PX : undefined,
      height: height > width ? LISTING_IMAGE_MAX_EDGE_PX : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const out = await pipeline
    .jpeg({ quality: LISTING_IMAGE_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  if (out.length >= size && maxEdge <= LISTING_IMAGE_MAX_EDGE_PX) {
    await file.setMetadata({
      metadata: { ...(meta.metadata || {}), pippinwayCompressed: "1" },
    });
    return { changed: false, reason: "no_gain", bytesBefore: size };
  }

  const token = meta.metadata?.firebaseStorageDownloadTokens;
  await file.save(out, {
    resumable: false,
    contentType: "image/jpeg",
    metadata: {
      cacheControl: "public,max-age=31536000",
      metadata: {
        ...(meta.metadata || {}),
        firebaseStorageDownloadTokens: token || crypto.randomUUID(),
        pippinwayCompressed: "1",
      },
    },
  });

  return {
    changed: true,
    bytesBefore: size,
    bytesAfter: out.length,
  };
}

async function compressImagesForListing(snap, nowMs) {
  const data = snap.data() || {};
  if (data.imagesCompressed === true) {
    return { listingId: snap.id, skipped: true, reason: "done" };
  }
  if (isSafeToPermanentlyDelete(data, nowMs).ok) {
    return { listingId: snap.id, skipped: true, reason: "expired" };
  }

  const results = [];
  for (const url of collectImageUrls(data)) {
    const path = storagePathFromUrl(url);
    if (!isListingStoragePath(path)) {
      results.push({ url, changed: false, reason: "not_listing_path" });
      continue;
    }
    try {
      results.push({ url, ...(await compressListingStorageFile(path)) });
    } catch (err) {
      console.warn("Listing image compress failed", snap.id, path, err);
      results.push({ url, changed: false, reason: "error" });
    }
  }

  const failed = results.some((r) => r.reason === "error");
  await snap.ref.update({
    imagesCompressed: !failed,
    imagesCompressedAt: FieldValue.serverTimestamp(),
  });

  return {
    listingId: snap.id,
    skipped: false,
    compressed: results.filter((r) => r.changed).length,
    failed,
  };
}

async function runListingImageCompressBatch() {
  initAdmin();
  const nowMs = Timestamp.now().toMillis();
  const cursorRef = getDb().doc(COMPRESS_CURSOR_PATH);
  const cursorSnap = await cursorRef.get();
  const lastId = cursorSnap.exists ? String(cursorSnap.data()?.lastId || "") : "";

  let q = getDb().collection("listings").orderBy("__name__").limit(COMPRESS_LISTING_BATCH);
  if (lastId) {
    q = q.startAfter(getDb().collection("listings").doc(lastId));
  }

  const page = await q.get();
  if (page.empty) {
    await cursorRef.set({ lastId: "", updatedAt: FieldValue.serverTimestamp() });
    return { processed: 0, compressed: 0, wrapped: true };
  }

  let compressed = 0;
  for (const snap of page.docs) {
    const result = await compressImagesForListing(snap, nowMs);
    compressed += Number(result.compressed || 0);
  }

  const nextId = page.docs[page.docs.length - 1].id;
  await cursorRef.set({
    lastId: page.size < COMPRESS_LISTING_BATCH ? "" : nextId,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    processed: page.size,
    compressed,
    wrapped: page.size < COMPRESS_LISTING_BATCH,
  };
}

/**
 * Hourly: rewrite oversized listing photos in Storage to 1200px JPEG q65
 * (ikman-like). Same Storage path + download token so listing URLs stay valid.
 * Skips files already ≤80KB or marked compressed. Does not touch users/chats.
 */
exports.compressExistingListingImages = functionsV1
  .region("us-central1")
  .runWith({ timeoutSeconds: 540, memory: "1GB" })
  .pubsub.schedule("every 1 hours")
  .timeZone("UTC")
  .onRun(async () => {
    const result = await runListingImageCompressBatch();
    console.log("compressExistingListingImages", result);
    return result;
  });

/** Admin can kick a compress batch immediately. */
exports.compressExistingListingImagesNow = onCall(
  { region: "us-central1", timeoutSeconds: 540, memory: "1GiB" },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in as admin.");
    }
    await assertAdmin(request.auth.uid);
    return runListingImageCompressBatch();
  }
);
