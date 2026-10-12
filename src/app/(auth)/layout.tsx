import { AuthHeader } from "@/components/layout/auth-header";
import { AuthFooter } from "@/components/layout/auth-footer";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100">
            <AuthHeader />

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-slate-200 dark:border-neutral-800 text-center">
                    {children}
                </div>
            </main>

            <AuthFooter />
        </div>
    );
}
