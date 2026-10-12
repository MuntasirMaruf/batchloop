import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity"
        >
          BatchLoop
        </Link>
      </div>
    </header>
  );
}
