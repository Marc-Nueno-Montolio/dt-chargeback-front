'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileDown, Eye, Trash2 } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts"
import { useRouter } from 'next/navigation'

interface Report {
  id: number
  name: string
  status: string
  from_date: string
  to_date: string
  last_updated: string
  summary: {
    total_hosts: number
    managed_hosts: number
    total_applications: number
    total_synthetics: number
    hosts_without_is: number
  }
  metadata: {
    total_dgs: number
    report_type: string
  }
}

interface AnalyticsData {
  labels: string[]
  data: number[]
  title: string
}

interface DistributionPerDG {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
  title: string
}

interface AnalyticsSummary {
  isPerDG: AnalyticsData
  monitoringDistribution: AnalyticsData
  monitoringDistributionPerDG: DistributionPerDG
  applicationsPerDG: AnalyticsData
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#84cc16']

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("reports")
  const [reports, setReports] = useState<Report[]>([])
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:8000/reports?skip=0&limit=100')
        const data = await response.json()
        setReports(data)
      } catch (err) {
        console.error('Error fetching reports:', err)
      }
    }

    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:8000/analytics/summary')
        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        setError('Failed to fetch analytics data')
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === "reports") {
      fetchReports()
    } else {
      fetchAnalytics()
    }
  }, [activeTab])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/reports/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove the deleted report from state
        setReports(reports.filter(report => report.id !== id))
      } else {
        throw new Error('Failed to delete report')
      }
    } catch (err) {
      console.error('Error deleting report:', err)
    }
  }

  const handleView = async (id: number) => {
    router.push(`/reports/${id}`)
  }

  // Transform data for Recharts
  const transformToPieData = (analyticsData: AnalyticsData | undefined) => {
    if (!analyticsData) return []
    return analyticsData.labels.map((label, index) => ({
      name: label,
      value: analyticsData.data[index]
    }))
  }

  const transformToBarData = (analyticsData: DistributionPerDG | undefined) => {
    if (!analyticsData) return []
    return analyticsData.labels.map((label, index) => ({
      name: label,
      Infrastructure: analyticsData.datasets[0].data[index],
      FullStack: analyticsData.datasets[1].data[index],
    }))
  }

  const transformToSimpleBarData = (analyticsData: AnalyticsData | undefined) => {
    if (!analyticsData) return []
    return analyticsData.labels.map((label, index) => ({
      name: label,
      value: analyticsData.data[index]
    }))
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <Tabs defaultValue="reports" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            
          </TabsList>
        </div>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell>{new Date(report.from_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(report.to_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(report.last_updated).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline">
                          <FileDown className="h-4 w-4 mr-1" />
                          XLSX
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileDown className="h-4 w-4 mr-1" />
                          CSV
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView(report.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* Information Systems per DG */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Information Systems per DG</CardTitle>
                <CardDescription>Distribution of Information Systems across Delivery Groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={transformToPieData(data?.isPerDG)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {transformToPieData(data?.isPerDG).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monitoring Distribution */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Infrastructure vs FullStack Hosts</CardTitle>
                <CardDescription>Global distribution of monitoring modes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={transformToPieData(data?.monitoringDistribution)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {transformToPieData(data?.monitoringDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monitoring Distribution per DG */}
            <Card className="col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Monitoring Distribution per DG</CardTitle>
                <CardDescription>Infrastructure vs FullStack hosts per Delivery Group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={transformToBarData(data?.monitoringDistributionPerDG)} margin={{ bottom: 90 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Infrastructure" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="FullStack" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Applications per DG */}
            <Card className="col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Applications per DG</CardTitle>
                <CardDescription>Number of applications in each Delivery Group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={transformToSimpleBarData(data?.applicationsPerDG)} margin={{ bottom: 90 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Applications']} />
                    <Bar 
                      dataKey="value" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]}
                      name="Applications"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}