import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "API Latency Tracker",
  description: "Monitor, visualize, and analyze API endpoint performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
