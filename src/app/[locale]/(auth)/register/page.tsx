"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { signUpAction } from "../actions";
import { UserRole } from "@/types/auth";
import {
    Building2,
    Store,
    Mail,
    Lock,
    Phone,
    Briefcase,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Link as LinkIcon,
} from "lucide-react";

function RegisterForm() {
    const t = useTranslations("auth");
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("ref");
    const roleParam = searchParams.get("role")?.toLowerCase();

    // Determine initial role: locked to SHOP_OWNER if invite token exists,
    // or pre-selected from ?role= query parameter (e.g., from homepage cards).
    // Defaults to WHOLESALER if not specified.
    const resolveRole = (): UserRole => {
        if (inviteToken) return "SHOP_OWNER";
        if (roleParam === "shop_owner" || roleParam === "retail") return "SHOP_OWNER";
        return "WHOLESALER";
    };

    const [selectedRole, setSelectedRole] = useState<UserRole>(resolveRole);
    const [prevRoleParam, setPrevRoleParam] = useState(roleParam);

    // Sync state if navigation changes query parameter without remounting
    if (roleParam !== prevRoleParam) {
        setPrevRoleParam(roleParam);
        if (!inviteToken) {
            setSelectedRole(
                roleParam === "shop_owner" || roleParam === "retail"
                    ? "SHOP_OWNER"
                    : "WHOLESALER"
            );
        }
    }

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsExistingUser(false);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await signUpAction(formData);

            if (result.error) {
                setError(result.error);
                setIsExistingUser(result.errorCode === "USER_ALREADY_EXISTS");
                setIsLoading(false);
            } else if (result.redirectUrl) {
                router.push(result.redirectUrl);
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setIsExistingUser(false);
            setIsLoading(false);
        }
    }

    return (
        <div className="text-left">
            <div className="mb-5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {t("createAccount")}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t("joinNetwork")}
                </p>
            </div>

            {/* Scenario 1: Invite Link Notification Banner */}
            {inviteToken ? (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                    <LinkIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold block">{t("invitedByWholesaler")}</span>
                        {t("invitedNotice")}
                    </div>
                </div>
            ) : (
                /* Scenario 2: Role Selection Tabs */
                <div className="mb-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                        {t("selectBusinessType")}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => setSelectedRole("WHOLESALER")}
                            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${selectedRole === "WHOLESALER"
                                ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900/5 dark:bg-white/5 ring-1 ring-neutral-900 dark:ring-neutral-100"
                                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                }`}
                        >
                            <Building2
                                className={`w-5 h-5 ${selectedRole === "WHOLESALER"
                                    ? "text-neutral-900 dark:text-neutral-100"
                                    : "text-neutral-400"
                                    }`}
                            />
                            <div>
                                <span className="text-xs font-bold block text-neutral-900 dark:text-neutral-100">
                                    Wholesaler
                                </span>
                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                    {t("supplierSubtitle")}
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole("SHOP_OWNER")}
                            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${selectedRole === "SHOP_OWNER"
                                ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900/5 dark:bg-white/5 ring-1 ring-neutral-900 dark:ring-neutral-100"
                                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                }`}
                        >
                            <Store
                                className={`w-5 h-5 ${selectedRole === "SHOP_OWNER"
                                    ? "text-neutral-900 dark:text-neutral-100"
                                    : "text-neutral-400"
                                    }`}
                            />
                            <div>
                                <span className="text-xs font-bold block text-neutral-900 dark:text-neutral-100">
                                    Shop Owner
                                </span>
                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                    {t("retailerSubtitle")}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {error && isExistingUser ? (
                <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1 text-left">
                        <span className="font-semibold block text-sm">Account already exists</span>
                        <p className="text-neutral-700 dark:text-neutral-300">
                            An account with this email is already registered. If you haven&apos;t finished onboarding, your credentials are saved.
                        </p>
                        <div className="pt-1">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1 font-bold text-neutral-900 dark:text-neutral-100 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 px-2.5 py-1 rounded text-xs transition-colors"
                            >
                                Sign in to continue onboarding &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2.5 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Hidden role and invite token inputs */}
                <input
                    type="hidden"
                    name="role"
                    value={inviteToken ? "SHOP_OWNER" : selectedRole}
                />
                {inviteToken && (
                    <input type="hidden" name="invite_token" value={inviteToken} />
                )}

                <div>
                    <label
                        htmlFor="business_name"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        {t("businessName")}
                    </label>
                    <div className="relative">
                        <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="business_name"
                            name="business_name"
                            type="text"
                            required
                            placeholder={
                                selectedRole === "WHOLESALER"
                                    ? t("businessNamePlaceholderWholesaler")
                                    : t("businessNamePlaceholderRetailer")
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="phone_number"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        {t("phone")}
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="phone_number"
                            name="phone_number"
                            type="tel"
                            required
                            placeholder={t("phonePlaceholder")}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        {t("email")}
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder={t("emailPlaceholder")}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1"
                    >
                        {t("password")}
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            minLength={6}
                            placeholder={t("passwordPlaceholder")}
                            className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 text-neutral-900 dark:text-neutral-100"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-3 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t("creatingAccount")}</span>
                        </>
                    ) : (
                        <span>{t("createAccountBtn")}</span>
                    )}
                </button>
            </form>

            <div className="mt-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {t("alreadyHaveAccount")}{" "}
                <Link
                    href="/login"
                    className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline"
                >
                    {t("signInBtn")}
                </Link>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="py-8 flex items-center justify-center text-sm text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading registration form...
                </div>
            }
        >
            <RegisterForm />
        </Suspense>
    );
}
