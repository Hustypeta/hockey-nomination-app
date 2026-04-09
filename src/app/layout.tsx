import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "MS 2026 | Nominace",
    template: "%s | MS 2026",
  },
  description: "Sestav si nominaci české reprezentace na MS v hokeji 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-[#0a0a0a] font-sans text-white">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "border border-white/10 bg-[#141414] text-white",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
