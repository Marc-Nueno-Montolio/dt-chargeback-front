import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

interface DG {
  id: number;
  name: string;
  last_updated: string;
}

interface ReportGeneratorPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportGeneratorPopover({ isOpen, onOpenChange }: ReportGeneratorPopoverProps) {
  const [date, setDate] = useState<DateRange | undefined>()
  const [reportName, setReportName] = useState<string>("")
  const [selectedDG, setSelectedDG] = useState<string>("all")
  const [isRunning, setIsRunning] = useState(false)
  const [dgs, setDgs] = useState<DG[]>([])

  useEffect(() => {
    const fetchDGs = async () => {
      try {
        const response = await fetch('http://localhost:8000/dgs?page=1&limit=100')
        if (!response.ok) {
          throw new Error('Failed to fetch DGs')
        }
        const data = await response.json()
        setDgs(data.items)
      } catch (error) {
        console.error("Error fetching DGs:", error)
      }
    }

    fetchDGs()
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/status')
          const data = await response.json()
          
          if (data.status === 'idle') {
            setIsRunning(false)
            clearInterval(intervalId)
          }
        } catch (error) {
          console.error("Error checking report status:", error)
          setIsRunning(false)
          clearInterval(intervalId)
        }
      }, 2000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning])

  const handleRunReport = async () => {
    if (!date?.from || !date?.to || !reportName.trim()) {
      alert("Please select dates and enter a report name")
      return
    }
    
    setIsRunning(true)
    onOpenChange(false)
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          name: reportName,
          from_date: date.from.toISOString(),
          to_date: date.to.toISOString(),
          dg_ids: selectedDG === 'all' ? dgs.map(dg => dg.id) : [parseInt(selectedDG)],
          report_format: "json"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
    } catch (error) {
      console.error("Error running report:", error)
      setIsRunning(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isRunning ? "Processing..." : "Run Report"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Report Name</Label>
            <Input
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>DG Selection</Label>
            <Select value={selectedDG} onValueChange={setSelectedDG}>
              <SelectTrigger>
                <SelectValue placeholder="Select DG" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DGs</SelectItem>
                {dgs.map(dg => (
                  <SelectItem key={dg.id} value={dg.id.toString()}>
                    {dg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="rounded-md border">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </div>
            <Button 
              onClick={handleRunReport}
              disabled={isRunning || !date?.from || !date?.to || !reportName.trim()}
            >
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}