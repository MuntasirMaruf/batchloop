import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "../actions";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

/**
 * Server Component: Protects the /onboarding route on the server.
 * Next.js reads the browser's incoming cookies BEFORE generating HTML:
 * - If user is logged in -> profile is returned -> renders the form.
 * - If user is NOT logged in (no cookies) -> immediately redirects to /login.
 */
export default async function OnboardingPage() {
    // [COOKIE USAGE - SERVER PAGE GUARD]:
    // Calls `getCurrentUserProfile()`, which reads the incoming `sb-<project-id>-auth-token`
    // HTTP-only cookie via `cookies()` and decrypts the JWT via `supabase.auth.getUser()`.
    const profile = await getCurrentUserProfile();

    if (!profile) {
        redirect("/login");
    }

    return <OnboardingForm profile={profile} />;
}
