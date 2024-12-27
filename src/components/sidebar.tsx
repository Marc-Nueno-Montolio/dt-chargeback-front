"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Menu,
  BarChart,
  Shield,
  Server,
  AppWindow,
  Activity,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const menuItems = [
  { name: "Reports", icon: BarChart, href: "/" },
  { name: "DGs", icon: Shield, href: "/dgs" },
  { name: "Hosts", icon: Server, href: "/hosts" },
  { name: "Applications", icon: AppWindow, href: "/applications" },
  { name: "Synthetics", icon: Activity, href: "/synthetics" },

]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex flex-col h-full border-r transition-all",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b flex-shrink-0">
          {!collapsed && <span className="text-lg font-semibold">DPS Chargeback</span>}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "ml-auto" : ""}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* Navigation wrapper with scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scrollable navigation area */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer - always at bottom */}
          <div className={cn(
            "border-t p-4 flex-shrink-0 bg-background",
            collapsed ? "flex justify-center" : "flex flex-col items-center gap-4"
          )}>
            <Image 
              src="/ec-logo.png"
              alt="European Commission Logo"
              width={collapsed ? 40 : 100}
              height={collapsed ? 40 : 100}
              className="transition-all"
            />
          </div>
        </div>
      </div>
    </>
  )
}