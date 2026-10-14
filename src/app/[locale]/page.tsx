import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUserProfile } from "@/app/[locale]/(auth)/actions";
import { Building2, Store, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { HomeHeader } from "@/components/layout/home-header";
import { Footer } from "@/components/layout/footer";
import { routes } from "@/config";

/**
 * ============================================================================
 * BATCHLOOP LOCALIZED HOMEPAGE
 * ============================================================================
 * Supports English, Bengali, and Japanese with next-intl server translations.
 * Fully driven by centralized design tokens matching BatchLoop's core aesthetic.
 * ============================================================================
 */
export default async function Home() {
  const t = await getTranslations("home");
  const profile = await getCurrentUserProfile();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <HomeHeader profile={profile} />

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 flex flex-col items-center justify-center text-center">
        {/* Top Product Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground/80 mb-6 border border-border/50">
          <Zap className="w-3.5 h-3.5 text-wholesaler" />
          {t("badge")}
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight">
          {t("title")}
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl">
          {t("subtitle")}
        </p>

        {/* Action Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full mt-8 sm:mt-12 text-left">
          <Link
            href={`${routes.auth.register}?role=wholesaler`}
            className="p-5 sm:p-6 rounded-2xl border border-border bg-card hover:border-border-hover transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-wholesaler-subtle text-wholesaler-text dark:text-wholesaler w-fit mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-foreground flex items-center justify-between">
              <span>{t("wholesalerCardTitle")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-xs text-muted-subtle dark:text-muted-foreground mt-1">
              {t("wholesalerCardDesc")}
            </p>
          </Link>

          <Link
            href={`${routes.auth.register}?role=retailer`}
            className="p-5 sm:p-6 rounded-2xl border border-border bg-card hover:border-border-hover transition-all shadow-xs group"
          >
            <div className="p-3 rounded-xl bg-retailer-subtle text-retailer-text dark:text-retailer w-fit mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-foreground flex items-center justify-between">
              <span>{t("retailerCardTitle")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-xs text-muted-subtle dark:text-muted-foreground mt-1">
              {t("retailerCardDesc")}
            </p>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-muted-subtle dark:text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-retailer" />
            {t("verifiedSuppliers")}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-wholesaler" />
            {t("instantInvite")}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-accent-purple" />
            {t("paymentTerms")}
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
