import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "../actions";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return <OnboardingForm profile={profile} />;
}
