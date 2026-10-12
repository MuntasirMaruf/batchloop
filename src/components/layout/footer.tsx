import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 gap-4">
        <p>&copy; {new Date().getFullYear()} BatchLoop. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
