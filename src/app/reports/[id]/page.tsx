'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Report {
  id: number
  name: string 
  status: string
  from_date: string
  to_date: string
  last_updated: string
  data: {
    report_data: DGReport[]
    overall_summary: Summary
    metadata: {
      total_dgs: number
      report_type: string
    }
  }
}

interface DGReport {
  dg_name: string
  dg_id: number
  last_updated: string
  hosts: Host[]
  applications: Application[]
  synthetics: Synthetic[]
  summary: Summary
}

interface Summary {
  total_hosts: number
  managed_hosts: number
  total_applications: number
  total_synthetics: number
  hosts_without_is: number
}

interface Host {
  id: number
  name: string
  dt_id: string
  managed: boolean
  memory_gb: number
  state: string
  monitoring_mode: string
  information_systems: IS[]
}

interface Application {
  id: number
  name: string
  dt_id: string
  type: string
  information_systems: IS[]
}

interface Synthetic {
  id: number
  name: string
  dt_id: string
  type: string
  http_type: string
  is_custom: boolean
  information_systems: IS[]
}

interface IS {
  name: string
  id: number
}

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:8000/reports/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch report')
        }
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

  const handleDownload = async (format: string) => {
    try {
      const response = await fetch(`http://localhost:8000/reports/${params.id}/download?format=${format}`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${params.id}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (loading) {
    return <div className="p-8"><Skeleton className="h-48 w-full" /></div>
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Report Details</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => handleDownload('excel')}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button variant="outline" onClick={() => handleDownload('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Overview</CardTitle>
          <CardDescription>
            Generated at: {new Date(report.last_updated).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total DGs</p>
              <p className="text-2xl font-bold">{report.data.metadata.total_dgs}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Hosts</p>
              <p className="text-2xl font-bold">{report.data.overall_summary.total_hosts}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{report.data.overall_summary.total_applications}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Synthetics</p>
              <p className="text-2xl font-bold">{report.data.overall_summary.total_synthetics}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="hosts">Hosts</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="synthetics">Synthetics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          {report.data.report_data.map((dgReport) => (
            <Card key={dgReport.dg_id} className="mb-4">
              <CardHeader>
                <CardTitle>{dgReport.dg_name}</CardTitle>
                <CardDescription>
                  Last updated: {new Date(dgReport.last_updated).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Hosts</p>
                    <p className="text-2xl font-bold">{dgReport.summary.total_hosts}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Managed Hosts</p>
                    <p className="text-2xl font-bold">{dgReport.summary.managed_hosts}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="text-2xl font-bold">{dgReport.summary.total_applications}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Synthetics</p>
                    <p className="text-2xl font-bold">{dgReport.summary.total_synthetics}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hosts">
          {report.data.report_data.map((dgReport) => (
            <Card key={dgReport.dg_id} className="mb-4">
              <CardHeader>
                <CardTitle>{dgReport.dg_name} - Hosts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Monitoring Mode</TableHead>
                      <TableHead>Memory (GB)</TableHead>
                      <TableHead>Information Systems</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dgReport.hosts.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell>{host.name}</TableCell>
                        <TableCell>{host.state}</TableCell>
                        <TableCell>{host.monitoring_mode}</TableCell>
                        <TableCell>{host.memory_gb?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>
                          {host.information_systems.map(is => is.name).join(', ') || 'None'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="applications">
          {report.data.report_data.map((dgReport) => (
            <Card key={dgReport.dg_id} className="mb-4">
              <CardHeader>
                <CardTitle>{dgReport.dg_name} - Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Information Systems</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dgReport.applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.type}</TableCell>
                        <TableCell>
                          {app.information_systems.map(is => is.name).join(', ') || 'None'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="synthetics">
          {report.data.report_data.map((dgReport) => (
            <Card key={dgReport.dg_id} className="mb-4">
              <CardHeader>
                <CardTitle>{dgReport.dg_name} - Synthetics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>HTTP Type</TableHead>
                      <TableHead>Custom</TableHead>
                      <TableHead>Information Systems</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dgReport.synthetics.map((synthetic) => (
                      <TableRow key={synthetic.id}>
                        <TableCell>{synthetic.name}</TableCell>
                        <TableCell>{synthetic.type}</TableCell>
                        <TableCell>{synthetic.http_type || 'N/A'}</TableCell>
                        <TableCell>{synthetic.is_custom ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          {synthetic.information_systems.map(is => is.name).join(', ') || 'None'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}