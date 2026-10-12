/**
 * ============================================================================
 * LOCALIZED NAVIGATION WRAPPERS (next-intl)
 * ============================================================================
 * HOW THIS WORKS:
 * 1. Re-exports drop-in replacements for standard Next.js navigation APIs:
 *    - Link: Localized version of 'next/link'.
 *    - useRouter: Localized version of 'next/navigation' useRouter.
 *    - usePathname: Localized version of 'next/navigation' usePathname.
 *    - redirect: Localized version of 'next/navigation' redirect.
 *
 * 2. Why use these instead of standard Next.js imports?
 *    - When a user is on Bengali ('/bn'), `<Link href="/login">` automatically
 *      renders `<a href="/bn/login">` without you having to manually prepend '/bn'.
 *    - When on English ('/'), `<Link href="/login">` renders `<a href="/login">`.
 *    - 'usePathname()' returns the clean path (e.g. '/login', not '/bn/login'),
 *      making route checks and active link styling consistent across all languages.
 * ============================================================================
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
