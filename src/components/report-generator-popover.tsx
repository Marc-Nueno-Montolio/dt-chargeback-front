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
import { format, subDays } from "date-fns"
import { useToast } from "@/hooks/use-toast"

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
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)
  const [date, setDate] = useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: today
  })
  const [reportName, setReportName] = useState<string>("")
  const [selectedDGs, setSelectedDGs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [dgs, setDgs] = useState<DG[]>([])
  const { toast } = useToast()

  // Check status regularly when running
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/status')
        const data = await response.json()
        
        if (data.status === 'processing') {
          setIsRunning(true)
        } else {
          // Any status other than processing, stop checking
          setIsRunning(false)
          clearInterval(intervalId)

          // Handle different status cases
          if (data.status === 'idle') {
            toast({
              title: "Report Generation Complete",
              description: "Your report has been generated successfully.",
            })
          } else {
            // Any other status is treated as an error
            toast({
              title: "Report Generation Failed",
              description: `Unexpected status: ${data.status}`,
              variant: "destructive"
            })
          }
        }
      } catch (error) {
        console.error("Error checking status:", error)
        setIsRunning(false)
        clearInterval(intervalId)
        toast({
          title: "Status Check Failed",
          description: "Failed to check report generation status.",
          variant: "destructive"
        })
      }
    }

    if (isRunning) {
      // Check immediately on mount
      checkStatus()
      // Then check every 2 seconds
      intervalId = setInterval(checkStatus, 2000)
      return () => clearInterval(intervalId)
    }
  }, [isRunning, toast])

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

  const handleRunReport = async () => {
    if (!date?.from || !date?.to || !reportName.trim() || selectedDGs.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select dates, enter a report name, and select at least one DG",
        variant: "destructive"
      })
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
          dg_ids: selectedDGs.map(id => parseInt(id)),
          report_format: "json"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      toast({
        title: "Report Generation Started",
        description: "Your report is being generated...",
      })

    } catch (error) {
      console.error("Error running report:", error)
      setIsRunning(false)
      toast({
        title: "Generation Failed",
        description: "Failed to start report generation.",
        variant: "destructive"
      })
    }
  }

  const handleDGSelection = (value: string) => {
    if (value === 'all') {
      // Toggle between all DGs selected and none selected
      if (selectedDGs.length === dgs.length) {
        setSelectedDGs([])
      } else {
        setSelectedDGs(dgs.map(dg => dg.id.toString()))
      }
      return
    }
    
    if (selectedDGs.includes(value)) {
      setSelectedDGs(selectedDGs.filter(dg => dg !== value))
    } else {
      setSelectedDGs([...selectedDGs, value])
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
            <Label>DG Selection ({selectedDGs.length} selected)</Label>
            <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="all"
                  checked={selectedDGs.length === dgs.length}
                  onChange={() => handleDGSelection('all')}
                  className="rounded border-gray-300"
                />
                <label htmlFor="all">Select All</label>
              </div>
              {dgs.map(dg => (
                <div key={dg.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={dg.id.toString()}
                    checked={selectedDGs.includes(dg.id.toString())}
                    onChange={() => handleDGSelection(dg.id.toString())}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={dg.id.toString()}>{dg.name}</label>
                </div>
              ))}
            </div>
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
              disabled={isRunning || !date?.from || !date?.to || !reportName.trim() || selectedDGs.length === 0}
            >
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}