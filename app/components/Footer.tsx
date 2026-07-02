import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#030712] px-4 py-10 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/images/logo.png" alt="Pippinway" className="h-12 w-12 object-contain" loading="lazy" />
            <div>
              <p className="text-lg font-black text-white">Pippinway</p>
              <p className="text-xs text-slate-500">Buy. Sell. Everywhere.</p>
            </div>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6">
            A global marketplace for vehicles, property, electronics, jobs, services and more.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-black text-white">Marketplace</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/add-listing" className="hover:text-white">Post an Ad</Link>
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black text-white">Account</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/profile" className="hover:text-white">Profile</Link>
            <Link href="/messages" className="hover:text-white">Messages</Link>
            <Link href="/chat" className="hover:text-white">Chat</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black text-white">Follow</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <a
              href="https://www.facebook.com/profile.php?id=61589186823471"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        © 2026 Pippinway. All rights reserved.
      </div>
    </footer>
  );
}
