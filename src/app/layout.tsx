import type { Metadata } from "next";
import { cookies } from "next/headers";
import { siteConfig, cookieConfig } from "@/config";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
  keywords: [...siteConfig.metadata.keywords],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(cookieConfig.theme)?.value;
  const isDark = themeCookie === "dark";
  const localeCookie = cookieStore.get(cookieConfig.locale)?.value || "en";

  return (
    <html
      lang={localeCookie}
      className={isDark ? "dark" : ""}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider initialTheme={(themeCookie as any) || "system"}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
