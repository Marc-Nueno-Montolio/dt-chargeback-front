'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Report {
  id: number
  name: string
  status: string
  from_date: string
  to_date: string
  last_updated: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:8000/reports?skip=0&limit=100')
        const data = await response.json()
        setReports(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching reports:', err)
        setError('Failed to fetch reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/reports/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setReports(reports.filter(report => report.id !== id))
      } else {
        throw new Error('Failed to delete report')
      }
    } catch (err) {
      console.error('Error deleting report:', err)
    }
  }

  const handleView = (id: number) => {
    router.push(`/reports/${id}`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-sm text-gray-500 mt-1">View and download generated reports</p>
        </div>
      </div>

      <div className="rounded-md border">
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
            {Array.isArray(reports) && reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.name}</TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>{format(new Date(report.from_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(report.to_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(report.last_updated), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell className="space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleView(report.id)}
                    disabled={report.status !== 'completed'}
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
      </div>
    </div>
  )
}