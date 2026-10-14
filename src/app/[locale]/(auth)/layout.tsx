import { AuthHeader } from "@/components/layout/auth-header";
import { Footer } from "@/components/layout/footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-md p-5 sm:p-6 bg-card text-card-foreground rounded-xl shadow-xs border border-border text-center">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
