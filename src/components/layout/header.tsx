import Link from "next/link";

export function Header() {
  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          BatchLoop
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/login"
            className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 px-3.5 py-2 text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
