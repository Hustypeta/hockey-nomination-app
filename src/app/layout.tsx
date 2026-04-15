import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "LineUp",
    template: "%s | LineUp",
  },
  description:
    "LineUp — sestav si svou nominaci na MS v hokeji. Fanouškovský editor sestavy, soutěž a sdílení.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased min-h-screen bg-[#05080f] font-sans text-white">
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
