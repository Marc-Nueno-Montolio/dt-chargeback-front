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
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Host {
  id: number
  dt_id: string
  name: string
  managed: boolean
  memory_gb: number
  tags: Tag[]
  last_updated: string
  state: string
  monitoring_mode: string
  dgs: { id: number; name: string }[]
  information_systems: { id: number; name: string }[]
}

interface PaginatedResponse {
  items: Host[]
  total_items: number
  total_pages: number
  current_page: number
  items_per_page: number
  has_previous: boolean
  has_next: boolean
}

interface Tag {
  context: string
  key: string
  value?: string
  stringRepresentation: string
}

export default function HostsPage() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [managedOnly, setManagedOnly] = useState<boolean | null>(null)
  const [minMemory, setMinMemory] = useState<string>('')
  const [maxMemory, setMaxMemory] = useState<string>('')
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set())
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set())
  const [selectedDGs, setSelectedDGs] = useState<Set<string>>(new Set())
  const [selectedIS, setSelectedIS] = useState<Set<string>>(new Set())
  const [uniqueStates, setUniqueStates] = useState<Set<string>>(new Set())
  const [uniqueModes, setUniqueModes] = useState<Set<string>>(new Set())
  const [uniqueDGs, setUniqueDGs] = useState<Set<string>>(new Set())
  const [uniqueIS, setUniqueIS] = useState<Set<string>>(new Set())
  const [itemsPerPage, setItemsPerPage] = useState<number>(100)

  // Separate fetch for all possible filter values
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/hosts/filters')
      const data = await response.json()
      setUniqueStates(new Set([...data.states, 'N/A']))
      setUniqueModes(new Set([...data.monitoring_modes, 'N/A']))
      setUniqueDGs(new Set([...data.dgs, 'N/A']))
      setUniqueIS(new Set([...data.information_systems, 'N/A']))
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchHosts = async (page: number) => {
    setLoading(true)
    try {
      let url = `http://localhost:8000/hosts?page=${page}&limit=${itemsPerPage}`
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }
      if (managedOnly !== null) {
        url += `&managed=${managedOnly}`
      }
      if (minMemory) {
        url += `&min_memory=${minMemory}`
      }
      if (maxMemory) {
        url += `&max_memory=${maxMemory}`
      }
      if (selectedStates.size > 0) {
        const states = Array.from(selectedStates)
          .map(state => state === 'N/A' ? 'null' : encodeURIComponent(state))
          .join(',')
        url += `&state=${states}`
      }
      if (selectedModes.size > 0) {
        const modes = Array.from(selectedModes)
          .map(mode => mode === 'N/A' ? 'null' : encodeURIComponent(mode))
          .join(',')
        url += `&monitoring_mode=${modes}`
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
      const data: PaginatedResponse = await response.json()
      
      setHosts(Array.isArray(data.items) ? data.items : [])
      setTotalPages(data.total_pages)
      setTotalItems(data.total_items)
    } catch (error) {
      console.error('Error fetching hosts:', error)
      setHosts([])
    }
    setLoading(false)
  }

  // Fetch filter options on initial load
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Fetch hosts when filters change
  useEffect(() => {
    fetchHosts(currentPage)
  }, [currentPage, search, managedOnly, minMemory, maxMemory, selectedStates, selectedModes, selectedDGs, selectedIS])

  const FilterSection = ({ title, items, selected, setSelected }: {
    title: string,
    items: Set<string>,
    selected: Set<string>,
    setSelected: (value: Set<string>) => void
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const selectedCount = selected.size

    // Convert N/A values to a consistent format
    const normalizeValue = (value: string | null | undefined): string => {
      return value === null || value === undefined || value === '' ? 'N/A' : value
    }

    // Format and filter items based on search
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
                  ref={(ref) => {
                    if (ref) {
                      ref.indeterminate = isIndeterminate
                    }
                  }}
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hosts</h2>
          <p className="text-sm text-gray-500 mt-1">Total hosts: {totalItems}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1) // Reset to first page when changing limit
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
            placeholder="Search hosts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="managed"
              checked={managedOnly === true}
              onCheckedChange={(checked) => {
                if (checked === true) setManagedOnly(true)
                else if (checked === false) setManagedOnly(null)
              }}
            />
            <label htmlFor="managed">Managed Only</label>
          </div>
          <Input
            type="number"
            placeholder="Min Memory (GB)"
            value={minMemory}
            onChange={(e) => setMinMemory(e.target.value)}
            className="max-w-[150px]"
          />
          <Input
            type="number"
            placeholder="Max Memory (GB)"
            value={maxMemory}
            onChange={(e) => setMaxMemory(e.target.value)}
            className="max-w-[150px]"
          />
        </div>

        <div className="flex gap-2">
          <FilterSection title="States" items={uniqueStates} selected={selectedStates} setSelected={setSelectedStates} />
          <FilterSection title="Monitoring Modes" items={uniqueModes} selected={selectedModes} setSelected={setSelectedModes} />
          <FilterSection title="DGs" items={uniqueDGs} selected={selectedDGs} setSelected={setSelectedDGs} />
          <FilterSection title="Information Systems" items={uniqueIS} selected={selectedIS} setSelected={setSelectedIS} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Managed</TableHead>
              <TableHead>Physical Memory (GB)</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Monitoring Mode</TableHead>
              <TableHead>DG</TableHead>
              <TableHead>IS</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : hosts && hosts.length > 0 ? (
              hosts.map((host) => (
                <TableRow key={host.id}>
                  <TableCell className="max-w-[200px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate block">{host.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{host.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{host.managed ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{host.memory_gb?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{host.state || 'N/A'}</TableCell>
                  <TableCell>{host.monitoring_mode || 'N/A'}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {host.dgs?.length > 0 ? (
                              host.dgs.map((dg) => (
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
                          {host.dgs?.map((dg) => dg.name).join(', ') || 'N/A'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {host.information_systems?.length > 0 ? (
                              host.information_systems.map((is) => (
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
                          {host.information_systems?.map((is) => is.name).join(', ') || 'N/A'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[500px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1">
                            {host.tags?.map((tag: Tag, index: number) => (
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
                          {host.tags?.map((tag: Tag) => 
                            `${tag.key}${tag.value ? `: ${tag.value}` : ''}`
                          ).join('\n')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(host.last_updated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center">No hosts found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}