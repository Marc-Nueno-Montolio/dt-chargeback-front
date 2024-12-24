import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { cn } from "@/lib/utils";
import { RefreshPopover } from "@/components/refresh-popover"
import { Toaster } from "@/components/ui/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EC DPS Chargeback",
  description: "Management Dashboard",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <div className="flex h-screen relative">
          {/* Background Logo */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center"
            style={{
              zIndex: 0,
            }}
          >
            <img 
              src="/logo.png" 
              alt="DT Logo"
              className="w-[40%] max-w-[400px] grayscale brightness-95 contrast-50"
            />
          </div>
          
          {/* Content */}
          <div className="flex w-full h-full relative z-10">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-auto">
              <TopNav />
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
