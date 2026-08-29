import { NextResponse } from "next/server";
import { firebaseConfig } from "@/app/firebase";
import { fetchGa4Report } from "@/lib/ga4Server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LookupResponse = {
  users?: Array<{ localId?: string }>;
};

type FirestoreUserDoc = {
  fields?: {
    role?: { stringValue?: string };
  };
};

async function requireAdmin(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return false;

  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    }
  );
  if (!lookup.ok) return false;

  const data = (await lookup.json()) as LookupResponse;
  const uid = data.users?.[0]?.localId;
  if (!uid) return false;

  const userDoc = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!userDoc.ok) return false;

  const doc = (await userDoc.json()) as FirestoreUserDoc;
  return doc.fields?.role?.stringValue === "admin";
}

export async function GET(request: Request) {
  const isAdmin = await requireAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await fetchGa4Report();
  return NextResponse.json(report);
}
