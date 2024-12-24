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
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DG {
  id: number
  name: string
  last_updated: string
}

interface IS {
  id: number
  name: string
  last_updated: string
}

interface PaginatedResponse {
  items: DG[]
  total_items: number
  total_pages: number
  current_page: number
  items_per_page: number
  has_previous: boolean
  has_next: boolean
}

export default function DGsPage() {
  const [dgs, setDGs] = useState<DG[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState<number>(100)
  const [selectedDG, setSelectedDG] = useState<DG | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [relatedIS, setRelatedIS] = useState<IS[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const fetchDGs = async (page: number) => {
    setLoading(true)
    try {
      let url = `http://localhost:8000/dgs?page=${page}&limit=${itemsPerPage}`
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const response = await fetch(url)
      const data: PaginatedResponse = await response.json()
      
      setDGs(Array.isArray(data.items) ? data.items : [])
      setTotalPages(data.total_pages)
      setTotalItems(data.total_items)
    } catch (error) {
      console.error('Error fetching DGs:', error)
      setDGs([])
    }
    setLoading(false)
  }

  const fetchDGDetails = async (dgId: number) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`http://localhost:8000/dgs/${dgId}/details`)
      const data = await response.json()
      setRelatedIS(data.information_systems || [])
    } catch (error) {
      console.error('Error fetching DG details:', error)
      setRelatedIS([])
    }
    setLoadingDetails(false)
  }

  const handleViewDetails = (dg: DG) => {
    setSelectedDG(dg)
    setIsDrawerOpen(true)
    fetchDGDetails(dg.id)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  useEffect(() => {
    fetchDGs(currentPage)
  }, [currentPage, search, itemsPerPage])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">DGs</h2>
          <p className="text-sm text-gray-500 mt-1">Total DGs: {totalItems}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Entries per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">entries</span>
          </div>

          {/* Pagination */}
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="flex items-center px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-center mb-4">
          <Input
            placeholder="Search DGs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : dgs && dgs.length > 0 ? (
              dgs.map((dg) => (
                <TableRow key={dg.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{dg.name}</TableCell>
                  <TableCell>{formatDate(dg.last_updated)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(dg)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No DGs found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>DG Details: {selectedDG?.name}</SheetTitle>
            <SheetDescription>
              Last updated: {selectedDG?.last_updated && formatDate(selectedDG.last_updated)}
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="is" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="is">Information Systems</TabsTrigger>
              <TabsTrigger value="topology">Topology</TabsTrigger>
            </TabsList>
            
            <TabsContent value="is" className="mt-4">
              {loadingDetails ? (
                <div className="flex justify-center py-4">Loading...</div>
              ) : relatedIS.length > 0 ? (
                <div className="rounded-md border max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedIS.map((is) => (
                        <TableRow key={is.id}>
                          <TableCell>{is.name}</TableCell>
                          <TableCell>
                            {formatDate(is.last_updated)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No Information Systems found
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="topology" className="mt-4">
              <div className="text-center py-4 text-muted-foreground">
                Topology visualization coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  )
} 