import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-black text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pippinway</h1>

        <nav className="flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/">Listings</Link>
          <Link href="/add-listing">Add Listing</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </div>
    </header>
  );
}