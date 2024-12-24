"use client"

import { useState, useEffect } from 'react'
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

interface RefreshStatus {
  status: 'idle' | 'running' | 'completed' | 'failed'
  details: {
    [key: string]: {
      status: string
      details?: any
      error?: string
    }
  }
  last_updated?: string
}

export function RefreshPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus | null>(null)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const { toast } = useToast()

  const startPolling = () => {
    // Check status immediately
    checkStatus().then(status => setRefreshStatus(status))

    const interval = setInterval(async () => {
      const status = await checkStatus()
      setRefreshStatus(status)

      // Stop polling if status is idle, completed or failed
      if (status.status === 'idle' || status.status === 'completed' || status.status === 'failed') {
        clearInterval(interval)
        setPollInterval(null)
        
        if (status.status === 'completed' || status.status === 'failed') {
          toast({
            title: status.status === 'completed' ? "Refresh Completed" : "Refresh Failed",
            description: status.status === 'completed' 
              ? "All data has been successfully updated."
              : "There was an error refreshing the data. Please try again.",
            variant: status.status === 'completed' ? "default" : "destructive",
          })
        }
      }
    }, 2000)
    
    setPollInterval(interval)
  }

  const checkStatus = async (): Promise<RefreshStatus> => {
    const response = await fetch('http://localhost:8000/refresh/status')
    return await response.json()
  }

  const handleRefresh = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to refresh.",
        variant: "destructive",
      })
      return
    }

    try {
      const refreshPromises = selectedItems.map(item => {
        switch(item) {
          case 'hosts':
            return fetch('http://localhost:8000/refresh/hosts', { method: 'POST' })
          case 'applications':
            return fetch('http://localhost:8000/refresh/applications', { method: 'POST' })
          case 'synthetics':
            return fetch('http://localhost:8000/refresh/synthetics', { method: 'POST' })
          case 'platform-extensions':
            return fetch('http://localhost:8000/refresh/platform-extensions', { method: 'POST' })
          case 'dgs':
            return fetch('http://localhost:8000/refresh/dgs', { method: 'POST' })
          case 'host-dg-links':
            return fetch('http://localhost:8000/refresh/topology-enrichment', { method: 'POST' })
          default:
            return Promise.reject(new Error(`Unknown endpoint: ${item}`))
        }
      })

      await Promise.all(refreshPromises)
      startPolling()
    } catch (error) {
      console.error('Error starting refresh:', error)
      toast({
        title: "Error",
        description: "Failed to start refresh. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [pollInterval])

  const getStatusIcon = (status?: string) => {
    if (!status || status === 'idle') return null
    if (status === 'running') return <RefreshCw className="h-4 w-4 animate-spin" />
    if (status === 'completed') return <Check className="h-4 w-4 text-green-500" />
    if (status === 'failed') return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${pollInterval ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Refresh Data</h4>
          <Separator />
          <div className="grid gap-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dgs"
                  checked={selectedItems.includes('dgs')}
                  onCheckedChange={() => toggleItem('dgs')}
                />
                <label htmlFor="dgs" className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  DGs {getStatusIcon(refreshStatus?.details?.dgs?.status)}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="host-dg-links"
                  checked={selectedItems.includes('host-dg-links')}
                  onCheckedChange={() => toggleItem('host-dg-links')}
                />
                <label htmlFor="host-dg-links" className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Topology Enrichment {getStatusIcon(refreshStatus?.details?.topology_enrichment?.status)}
                </label>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hosts"
                  checked={selectedItems.includes('hosts')}
                  onCheckedChange={() => toggleItem('hosts')}
                />
                <label htmlFor="hosts" className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Hosts {getStatusIcon(refreshStatus?.details?.hosts?.status)}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="applications"
                  checked={selectedItems.includes('applications')}
                  onCheckedChange={() => toggleItem('applications')}
                />
                <label htmlFor="applications" className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Applications {getStatusIcon(refreshStatus?.details?.applications?.status)}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="synthetics"
                  checked={selectedItems.includes('synthetics')}
                  onCheckedChange={() => toggleItem('synthetics')}
                />
                <label htmlFor="synthetics" className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Synthetics {getStatusIcon(refreshStatus?.details?.synthetics?.status)}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="platform-extensions"
                  checked={selectedItems.includes('platform-extensions')}
                  onCheckedChange={() => toggleItem('platform-extensions')}
                  disabled={true}
                />
                <label htmlFor="platform-extensions" className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Platform Extensions (DDUs) {getStatusIcon(refreshStatus?.details?.platform_extensions?.status)}
                </label>
              </div>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleRefresh}
            disabled={!!pollInterval || selectedItems.length === 0}
          >
            {pollInterval ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Selected'
            )}
          </Button>
          {refreshStatus?.last_updated && (
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(refreshStatus.last_updated).toLocaleString()}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}