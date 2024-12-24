"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RateCardItem {
  id: number
  category: string
  capability: string
  price: number
  unit: string
}

export default function RateCardPage() {
  const [rates, setRates] = useState<RateCardItem[]>([
    { 
      id: 1, 
      category: "Host Monitoring", 
      capability: "Full-Stack Monitoring", 
      price: 0.01, 
      unit: "per memory-GiB-hour" 
    },
    { 
      id: 2, 
      category: "Host Monitoring", 
      capability: "Infrastructure Monitoring", 
      price: 0.04, 
      unit: "per hour for any size host" 
    },
    { 
      id: 3, 
      category: "Host Monitoring", 
      capability: "Mainframe Monitoring", 
      price: 0.10, 
      unit: "per MSU hour" 
    },
    { 
      id: 4, 
      category: "Container Monitoring", 
      capability: "Kubernetes Platform Monitoring", 
      price: 0.002, 
      unit: "per hour for any size pod" 
    },
    { 
      id: 5, 
      category: "Application Security", 
      capability: "Runtime Vulnerability Analytics", 
      price: 0.00225, 
      unit: "per memory-GiB-hour" 
    },
    { 
      id: 6, 
      category: "Digital Experience Monitoring", 
      capability: "Real User Monitoring", 
      price: 0.00225, 
      unit: "per session" 
    }
  ])

  const categories = [
    "Host Monitoring",
    "Container Monitoring",
    "Application Security",
    "Digital Experience Monitoring",
    "Metrics powered by Grail",
    "Logs powered by Grail",
    "Events powered by Grail",
    "Automation",
    "AppEngine Functions",
    "Platform Extensions"
  ]

  const [newRate, setNewRate] = useState<Omit<RateCardItem, 'id'>>({
    category: "",
    capability: "",
    price: 0,
    unit: ""
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddRate = () => {
    setRates([...rates, { ...newRate, id: rates.length + 1 }])
    setNewRate({ category: "", capability: "", price: 0, unit: "" })
    setIsDialogOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rate Card</h2>
          <p className="text-muted-foreground mt-2">
            Dynatrace Platform Subscription pricing with hourly rates
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Rate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Rate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newRate.category}
                  onValueChange={(value) => setNewRate({ ...newRate, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capability</Label>
                <Input
                  value={newRate.capability}
                  onChange={(e) => setNewRate({ ...newRate, capability: e.target.value })}
                  placeholder="e.g., Full-Stack Monitoring"
                />
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={newRate.price}
                  onChange={(e) => setNewRate({ ...newRate, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={newRate.unit}
                  onChange={(e) => setNewRate({ ...newRate, unit: e.target.value })}
                  placeholder="e.g., per memory-GiB-hour"
                />
              </div>
              <Button onClick={handleAddRate} className="w-full">
                Add Rate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Category</TableHead>
                <TableHead className="w-[300px]">Capability</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.category}</TableCell>
                  <TableCell>{rate.capability}</TableCell>
                  <TableCell>${rate.price.toFixed(5)}</TableCell>
                  <TableCell>{rate.unit}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 