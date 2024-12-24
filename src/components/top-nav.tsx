"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Play } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { RefreshPopover } from "@/components/refresh-popover"
import { ReportGeneratorPopover } from "@/components/report-generator-popover"

export function TopNav() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="ml-auto flex items-center space-x-4">
          {/* Run Report Button with Popover */}
          <ReportGeneratorPopover 
            isOpen={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
          />

          {/* Refresh Data Popover */}
          <RefreshPopover />
        </div>
      </div>
    </div>
  )
} 