'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Tag {
  context?: string
  key: string
  value?: string
  stringRepresentation?: string
}

interface Application {
  id: number
  dt_id: string
  name: string
  type: string
  tags: Tag[]
  last_updated: string
  dgs: { id: number; name: string }[]
  information_systems: { id: number; name: string; dg: { id: number; name: string } | null }[]
}

const FilterSection = ({ title, items, selected, setSelected }: {
  title: string,
  items: Set<string>,
  selected: Set<string>,
  setSelected: (value: Set<string>) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selectedCount = selected.size
  const checkboxRef = useRef<HTMLInputElement>(null)

  const normalizeValue = (value: string | null | undefined): string => {
    return value === null || value === undefined || value === '' ? 'N/A' : value
  }

  const displayItems = Array.from(items)
    .map(normalizeValue)
    .filter(item => item.toLowerCase().includes(search.toLowerCase()))
    .sort()

  const handleSelect = (item: string, checked: boolean) => {
    const newSelected = new Set(selected)
    if (checked) {
      newSelected.add(item)
    } else {
      newSelected.delete(item)
    }
    setSelected(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(displayItems))
    } else {
      setSelected(new Set())
    }
  }

  const isAllSelected = displayItems.length > 0 && selected.size === items.size
  const isIndeterminate = selected.size > 0 && selected.size < items.size

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {title}
          {selectedCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
              {selectedCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{title}</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelected(new Set())}
              className="h-8 px-2"
              disabled={selected.size === 0}
            >
              Clear
            </Button>
          </div>
          
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />

          <div className="border-t" />
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-select-all`}
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                ref={checkboxRef as unknown as React.Ref<HTMLButtonElement>}
              />
              <label 
                htmlFor={`${title}-select-all`} 
                className="text-sm font-medium"
              >
                Select All
              </label>
            </div>
            <div className="border-t" />
            <div className="max-h-[200px] overflow-auto">
              {displayItems.length > 0 ? (
                displayItems.map(item => (
                  <div key={item} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`${title}-${item}`}
                      checked={selected.has(item)}
                      onCheckedChange={(checked) => handleSelect(item, checked as boolean)}
                    />
                    <label 
                      htmlFor={`${title}-${item}`} 
                      className="text-sm"
                    >
                      {item}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
          <div className="border-t pt-4 flex justify-end">
            <Button 
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedDGs, setSelectedDGs] = useState<Set<string>>(new Set())
  const [selectedIS, setSelectedIS] = useState<Set<string>>(new Set())
  const [uniqueTypes, setUniqueTypes] = useState<Set<string>>(new Set())
  const [uniqueDGs, setUniqueDGs] = useState<Set<string>>(new Set())
  const [uniqueIS, setUniqueIS] = useState<Set<string>>(new Set())
  const [itemsPerPage, setItemsPerPage] = useState<number>(100)

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/applications/filters')
      const data = await response.json()
      if (data) {
        setUniqueTypes(new Set([...(data.app_types || []), 'N/A']))
        setUniqueDGs(new Set([...(data.dgs || []), 'N/A']))
        setUniqueIS(new Set([...(data.information_systems || []), 'N/A']))
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Fetch applications
  const fetchApplications = async (page: number) => {
    setLoading(true)
    try {
      let url = `http://localhost:8000/applications?page=${page}&limit=${itemsPerPage}`
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      // Add filters as comma-separated values for OR conditions within same filter type
      // Different filter types are applied with AND condition by default
      if (selectedTypes.size > 0) {
        const types = Array.from(selectedTypes)
          .map(type => type === 'N/A' ? 'null' : encodeURIComponent(type))
          .join(',')
        url += `&type=${types}`
      }
      if (selectedDGs.size > 0) {
        const dgs = Array.from(selectedDGs)
          .map(dg => dg === 'N/A' ? 'null' : encodeURIComponent(dg))
          .join(',')
        url += `&dg=${dgs}`
      }
      if (selectedIS.size > 0) {
        const is = Array.from(selectedIS)
          .map(is => is === 'N/A' ? 'null' : encodeURIComponent(is))
          .join(',')
        url += `&information_system=${is}`
      }

      const response = await fetch(url)
      const data = await response.json()
      
      setApplications(data.items)
      setTotalPages(data.total_pages)
      setTotalItems(data.total_items)
    } catch (error) {
      console.error('Error fetching applications:', error)
      setApplications([])
    }
    setLoading(false)
  }

  // Initial load
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Fetch when filters change
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchApplications(1)
  }, [search, selectedTypes, selectedDGs, selectedIS, itemsPerPage])

  // Fetch when page changes
  useEffect(() => {
    fetchApplications(currentPage)
  }, [currentPage])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
          <p className="text-sm text-gray-500 mt-1">Total applications: {totalItems}</p>
        </div>
        <div className="flex items-center gap-4">
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
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex gap-2">
          <FilterSection title="Types" items={uniqueTypes} selected={selectedTypes} setSelected={setSelectedTypes} />
          <FilterSection title="DGs" items={uniqueDGs} selected={selectedDGs} setSelected={setSelectedDGs} />
          <FilterSection title="Information Systems" items={uniqueIS} selected={selectedIS} setSelected={setSelectedIS} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>DG</TableHead>
              <TableHead>IS</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : applications && applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate block">{app.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{app.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{app.type || 'N/A'}</TableCell>
                  
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {app.dgs?.length > 0 ? (
                              app.dgs.map((dg) => (
                                <Badge key={dg.id} variant="outline" className="truncate max-w-[150px]">
                                  {dg.name}
                                </Badge>
                              ))
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {app.dgs?.map((dg) => dg.name).join(', ') || 'N/A'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {app.information_systems?.length > 0 ? (
                              app.information_systems.map((is) => (
                                <Badge key={is.id} variant="outline" className="truncate max-w-[150px]">
                                  {is.name}
                                </Badge>
                              ))
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {app.information_systems?.map((is) => is.name).join(', ') || 'N/A'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[500px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {app.tags?.map((tag: Tag, index: number) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="font-mono text-xs whitespace-normal break-words"
                              >
                                <span className="font-semibold">{tag.key}</span>
                                {tag.value && (
                                  <>
                                    <span className="font-normal">:</span>
                                    <span className="text-muted-foreground ml-1">{tag.value}</span>
                                  </>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {app.tags?.map((tag: Tag) => 
                            `${tag.key}${tag.value ? `: ${tag.value}` : ''}`
                          ).join('\n')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(app.last_updated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No applications found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}