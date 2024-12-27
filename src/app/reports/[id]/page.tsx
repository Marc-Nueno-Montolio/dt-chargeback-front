'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Network, Server, Globe, Layers, FileJson, FileSpreadsheet, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Usage {
  fullstack: number
  infra: number
  rum: number
  rum_with_sr: number
  browser_monitor: number
  http_monitor: number
  '3rd_party_monitor': number
}

interface Host {
  id: number
  name: string
  dt_id: string
  usage: Usage
}

interface Entities {
  hosts: number
  applications: number
  synthetics: number
}

interface InformationSystem {
  name: string
  data: {
    id: number
    entities: {
      hosts: Host[]
      applications: any[]
      synthetics: any[]
    }
    usage: Usage
    managed_hosts: number
  }
}

interface DG {
  name: string
  data: {
    information_systems: InformationSystem[]
    totals: {
      usage: Usage
      entities: Entities
      managed_hosts: number
    }
    unassigned_entities: {
      hosts: Host[]
      applications: any[]
      synthetics: any[]
    }
  }
}

interface Report {
  id: number
  name: string
  status: string
  from_date: string
  to_date: string
  last_updated: string
  data: {
    dgs: DG[]
    totals: {
      usage: Usage
      entities: Entities
      managed_hosts: number
    }
  }
}

const ReportPage: React.FC = () => {
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDGs, setExpandedDGs] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:8000/reports/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch report')
        const data = await response.json()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params.id])

  const downloadJson = async () => {
    if (!report) return
    try {
      const response = await fetch(`http://localhost:8000/reports/${report.id}/download/json`)
      if (!response.ok) throw new Error('Failed to download JSON')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${report.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading JSON:', err)
      alert('Failed to download JSON report')
    }
  }

  const downloadExcel = async () => {
    if (!report) return
    try {
      const response = await fetch(`http://localhost:8000/reports/${report.id}/download/csv`)
      if (!response.ok) throw new Error('Failed to download CSV')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${report.id}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading CSV:', err)
      alert('Failed to download CSV report') 
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>
  if (!report) return <div className="text-gray-500 p-4">No data available</div>

  const formatBytes = (gibibytes: number | undefined) => {
    if (gibibytes === undefined) return '0 B'
    
    const units = ['MiB', 'GiB', 'TiB', 'PiB']
    let value = gibibytes * 1024 // Convert to MiB first
    let unitIndex = 0

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex++
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`
  }

  const formatCount = (count: number | undefined) => {
    if (count === undefined) return '0'
    
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count/1000).toFixed(1)}k`
    if (count < 1000000000) return `${(count/1000000).toFixed(1)}M`
    return `${(count/1000000000).toFixed(1)}B`
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()

  const toggleDG = (dgName: string) => {
    setExpandedDGs(prev => ({
      ...prev,
      [dgName]: !prev[dgName]
    }))
  }

  const renderNonZeroUsage = (usage: Usage) => {
    const nonZeroEntries = Object.entries(usage).filter(([_, value]) => value > 0)
    if (nonZeroEntries.length === 0) return "No usage"
    
    return nonZeroEntries.map(([key, value]) => {
      const formattedValue = key.includes('monitor') ? formatCount(value) : formatBytes(value)
      return `${key}: ${formattedValue}`
    }).join(', ')
  }

  const renderUsageDetails = (usage: Usage) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <div className="col-span-2 pb-2 flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Host Monitoring</h3>
        </div>
        <div className="flex justify-between">
          <span>Fullstack:</span>
          <span className="font-medium">{formatBytes(usage?.fullstack)}</span>
        </div>
        <div className="flex justify-between">
          <span>Infrastructure:</span>
          <span className="font-medium">{formatBytes(usage?.infra)}</span>
        </div>
        
        <div className="col-span-2 pb-2 mt-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Real User Monitoring</h3>
        </div>
        <div className="flex justify-between">
          <span>RUM Basic:</span>
          <span className="font-medium">{formatCount(usage?.rum)}</span>
        </div>
        <div className="flex justify-between">
          <span>RUM with Session Replay:</span>
          <span className="font-medium">{formatCount(usage?.rum_with_sr)}</span>
        </div>

        <div className="col-span-2 pb-2 mt-4 flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">Synthetic Monitoring</h3>
        </div>
        <div className="flex justify-between">
          <span>Browser Monitor:</span>
          <span className="font-medium">{formatCount(usage?.browser_monitor)}</span>
        </div>
        <div className="flex justify-between">
          <span>HTTP Monitor:</span>
          <span className="font-medium">{formatCount(usage?.http_monitor)}</span>
        </div>
        <div className="flex justify-between">
          <span>3rd Party Monitor:</span>
          <span className="font-medium">{formatCount(usage?.['3rd_party_monitor'])}</span>
        </div>
      </div>
    </div>
  )

  const renderISContent = (is: InformationSystem) => (
    <div className="space-y-6">
      {/* Summary Section */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          Usage Summary
        </h3>
        <div className="pl-4">
          {renderUsageDetails(is.data.usage)}
        </div>
      </div>

      <div className="border-t border-slate-200 my-4"></div>
      
      {/* Entities Section */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          Entity Details
        </h3>

        <div className="pl-4">
          {/* Hosts */}
          {is.data.entities.hosts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Hosts ({is.data.entities.hosts.length})
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow> 
                </TableHeader>
                <TableBody>
                  {is.data.entities.hosts.map((host) => (
                    <TableRow key={host.id}>
                      <TableCell>{host.name}</TableCell>
                      <TableCell>{host.dt_id}</TableCell>
                      <TableCell>{renderNonZeroUsage(host.usage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Applications */}
          {is.data.entities.applications.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Applications ({is.data.entities.applications.length})
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {is.data.entities.applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.dt_id}</TableCell>
                      <TableCell>{renderNonZeroUsage(app.usage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Synthetics */}
          {is.data.entities.synthetics.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium flex items-center gap-2">
                <Network className="h-4 w-4" />
                Synthetics ({is.data.entities.synthetics.length})
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {is.data.entities.synthetics.map((synthetic) => (
                    <TableRow key={synthetic.id}>
                      <TableCell>{synthetic.name}</TableCell>
                      <TableCell>{synthetic.dt_id}</TableCell>
                      <TableCell>{renderNonZeroUsage(synthetic.usage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Chargeback Report {report.name}</h2>
            <div className="text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-4">
                <span>Status: {report.status}</span>
                <span>Period: {formatDate(report.from_date)} - {formatDate(report.to_date)}</span>
                <span>Updated: {new Date(report.last_updated).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadJson}>
              <FileJson className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={downloadExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex gap-4">
        {/* Left Column - Summary */}
        <div className="w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Hosts</div>
                  <div className="text-2xl font-medium">{report.data.totals.entities.hosts}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Applications</div>
                  <div className="text-2xl font-medium">{report.data.totals.entities.applications}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Synthetics</div>
                  <div className="text-2xl font-medium">{report.data.totals.entities.synthetics}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total DGs</div>
                  <div className="text-2xl font-medium">{report.data.dgs.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {renderUsageDetails(report.data.totals.usage)}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tree Explorer */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>DG Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-8">
                {report.data.dgs.map((dg) => (
                  <div key={dg.name} className="space-y-4 relative">
                    <div 
                      className={`flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors bg-white ${expandedDGs[dg.name] ? 'sticky top-0 z-10 border-b' : ''}`}
                      onClick={() => toggleDG(dg.name)}
                    >
                      {expandedDGs[dg.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-lg">DG {dg.name}</span>
                    </div>

                    {expandedDGs[dg.name] && (
                      <div className="ml-8 space-y-6 border-l-2 border-slate-200 pl-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Hosts</div>
                            <div className="text-2xl font-medium">{dg.data.totals.entities.hosts}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Applications</div>
                            <div className="text-2xl font-medium">{dg.data.totals.entities.applications}</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Synthetics</div>
                            <div className="text-2xl font-medium">{dg.data.totals.entities.synthetics}</div>
                          </div>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>DG {dg.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {renderUsageDetails(dg.data.totals.usage)}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>DG Usage Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Tabs defaultValue="assigned" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="assigned">By IS</TabsTrigger>
                                <TabsTrigger value="unassigned">For Entities not Assigned to IS</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="assigned">
                                <Card>
                                  <CardContent className="pt-6">
                                    {dg.data.information_systems.length === 0 ? (
                                      <div className="text-center text-muted-foreground py-4">
                                        No information systems found
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <Accordion type="single" collapsible className="w-full pr-4">
                                          {dg.data.information_systems.map((is) => (
                                            <AccordionItem 
                                              key={is.name} 
                                              value={is.name} 
                                              className="pl-6 mb-6"
                                            >
                                              <AccordionTrigger className="hover:no-underline hover:bg-slate-50 rounded-lg ">
                                                <div className="flex items-center gap-2 w-full">
                                                  <div className="flex items-center gap-2 flex-1">
                                                    <Layers className="h-5 w-5 text-green-600" />
                                                    <h3 className="text-lg font-semibold tracking-tight">IS: {is.name}</h3>
                                                    
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    {is.data.managed_hosts > 1 && (
                                                      <Badge variant="secondary">Managed</Badge>
                                                    )}
                                                    
                                                  </div>
                                                </div>
                                              </AccordionTrigger>
                                              <AccordionContent className="pt-4 px-4">
                                                {renderISContent(is)}
                                              </AccordionContent>
                                            </AccordionItem>
                                          ))}
                                        </Accordion>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="unassigned">
                                <Card>
                                  <CardContent className="pt-6">
                                    {!dg.data.unassigned_entities.hosts?.length && 
                                     !dg.data.unassigned_entities.applications?.length && 
                                     !dg.data.unassigned_entities.synthetics?.length ? (
                                      <div className="text-center text-muted-foreground py-4">
                                        No unassigned entities found
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        {/* Unassigned Hosts */}
                                        {dg.data.unassigned_entities.hosts?.length > 0 && (
                                          <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                              <Server className="h-4 w-4" />
                                              Hosts ({dg.data.unassigned_entities.hosts.length})
                                            </h4>
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Name</TableHead>
                                                  <TableHead>ID</TableHead>
                                                  <TableHead>Usage</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {dg.data.unassigned_entities.hosts.map((host) => (
                                                  <TableRow key={host.dt_id}>
                                                    <TableCell>{host.name || 'N/A'}</TableCell>
                                                    <TableCell>{host.dt_id}</TableCell>
                                                    <TableCell>{renderNonZeroUsage(host.usage)}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        )}

                                        {/* Unassigned Applications */}
                                        {dg.data.unassigned_entities.applications?.length > 0 && (
                                          <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                              <Globe className="h-4 w-4" />
                                              Applications ({dg.data.unassigned_entities.applications.length})
                                            </h4>
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Name</TableHead>
                                                  <TableHead>ID</TableHead>
                                                  <TableHead>Usage</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {dg.data.unassigned_entities.applications.map((app) => (
                                                  <TableRow key={app.dt_id}>
                                                    <TableCell>{app.name || 'N/A'}</TableCell>
                                                    <TableCell>{app.dt_id}</TableCell>
                                                    <TableCell>{renderNonZeroUsage(app.usage)}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        )}

                                        {/* Unassigned Synthetics */}
                                        {dg.data.unassigned_entities.synthetics?.length > 0 && (
                                          <div className="space-y-2">
                                            <h4 className="font-medium flex items-center gap-2">
                                              <Network className="h-4 w-4" />
                                              Synthetics ({dg.data.unassigned_entities.synthetics.length})
                                            </h4>
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>ID</TableHead>
                                                  <TableHead>Usage</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {dg.data.unassigned_entities.synthetics.map((synthetic) => (
                                                  <TableRow key={synthetic.dt_id}>
                                                    <TableCell>{synthetic.dt_id}</TableCell>
                                                    <TableCell>{renderNonZeroUsage(synthetic.usage)}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportPage