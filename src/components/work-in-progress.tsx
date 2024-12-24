"use client"

import { Construction } from "lucide-react"

export function WorkInProgress() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Construction className="h-16 w-16 animate-bounce text-yellow-500" />
      <h2 className="text-2xl font-semibold">Work in Progress</h2>
      <p className="text-muted-foreground">This page is under construction</p>
    </div>
  )
} 