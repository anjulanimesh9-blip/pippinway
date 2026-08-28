"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";

const DEFAULT_RETURN = "/profile";

export function safeAuthReturnUrl(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_RETURN;

  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    value = raw;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN;
  }
  if (value.startsWith("/login") || value.startsWith("/register")) {
    return DEFAULT_RETURN;
  }

  return value;
}

export function authLoginHref(returnUrl: string) {
  return `/login?returnUrl=${encodeURIComponent(safeAuthReturnUrl(returnUrl))}`;
}

export function authRegisterHref(returnUrl: string) {
  return `/register?returnUrl=${encodeURIComponent(safeAuthReturnUrl(returnUrl))}`;
}

type GuestAuthContextValue = {
  requireAuth: (destination: string) => void;
  interceptGuestNav: (
    event: MouseEvent<HTMLAnchorElement>,
    destination: string
  ) => void;
};

const GuestAuthContext = createContext<GuestAuthContextValue | null>(null);

export function useGuestAuthPrompt() {
  const ctx = useContext(GuestAuthContext);
  if (!ctx) {
    throw new Error("useGuestAuthPrompt must be used within GuestAuthProvider");
  }
  return ctx;
}

function GuestAuthModal({
  open,
  returnUrl,
  onClose,
}: {
  open: boolean;
  returnUrl: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-auth-title"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[30px] border border-white/10 bg-[#0f172a] p-6 text-center shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          ×
        </button>

        <h2
          id="guest-auth-title"
          className="pr-8 text-2xl font-bold text-white"
        >
          Sign in to continue
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
          You need to log in or create an account to use this feature.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href={authLoginHref(returnUrl)}
            onClick={onClose}
            className="rounded-2xl bg-black py-3.5 text-center font-semibold text-white transition hover:bg-gray-900"
          >
            Login
          </Link>

          <Link
            href={authRegisterHref(returnUrl)}
            onClick={onClose}
            className="rounded-2xl border border-gray-700 bg-[#111827] py-3.5 text-center font-semibold text-white transition hover:bg-[#1f2937]"
          >
            Create Account
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-400 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState(DEFAULT_RETURN);
  const pendingRef = useRef<string | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const promptGuest = useCallback((destination: string) => {
    setReturnUrl(safeAuthReturnUrl(destination));
    setOpen(true);
  }, []);

  useEffect(() => {
    if (loading || !pendingRef.current) return;

    const destination = pendingRef.current;
    pendingRef.current = null;

    if (user) {
      router.push(destination);
      return;
    }

    promptGuest(destination);
  }, [loading, user, router, promptGuest]);

  useEffect(() => {
    if (!loading && user && open) {
      setOpen(false);
    }
  }, [loading, user, open]);

  const requireAuth = useCallback(
    (destination: string) => {
      if (loading) {
        pendingRef.current = destination;
        return;
      }

      if (user) {
        router.push(destination);
        return;
      }

      promptGuest(destination);
    },
    [loading, user, router, promptGuest]
  );

  const interceptGuestNav = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, destination: string) => {
      if (loading) {
        event.preventDefault();
        pendingRef.current = destination;
        return;
      }

      if (!user) {
        event.preventDefault();
        promptGuest(destination);
      }
    },
    [loading, user, promptGuest]
  );

  return (
    <GuestAuthContext.Provider value={{ requireAuth, interceptGuestNav }}>
      {children}
      <GuestAuthModal open={open} returnUrl={returnUrl} onClose={close} />
    </GuestAuthContext.Provider>
  );
}

type GuestAuthLinkProps = ComponentProps<typeof Link> & {
  href: string;
};

export function GuestAuthLink({
  href,
  onClick,
  ...props
}: GuestAuthLinkProps) {
  const { interceptGuestNav } = useGuestAuthPrompt();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        interceptGuestNav(event, href);
      }}
    />
  );
}
