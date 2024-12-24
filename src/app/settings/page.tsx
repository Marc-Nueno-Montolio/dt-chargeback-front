"use client"

import { WorkInProgress } from "@/components/work-in-progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    baseUrl: "",
    token: "",
    entityThreads: "5",
    metricThreads: "3",
  })

  const [hostLogic, setHostLogic] = useState({
    assignment: "# Write your host assignment logic here\n",
    billable: "# Write your host billable logic here\n"
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Dynatrace Base URL</Label>
              <Input 
                id="baseUrl"
                placeholder="https://xxx.live.dynatrace.com"
                value={settings.baseUrl}
                onChange={(e) => setSettings({...settings, baseUrl: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Dynatrace Token</Label>
              <Input 
                id="token"
                type="password"
                placeholder="dt0c01.xxx..."
                value={settings.token}
                onChange={(e) => setSettings({...settings, token: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entityThreads">Entity Thread Count</Label>
              <Input 
                id="entityThreads"
                type="number"
                value={settings.entityThreads}
                onChange={(e) => setSettings({...settings, entityThreads: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricThreads">Metric Thread Count</Label>
              <Input 
                id="metricThreads"
                type="number"
                value={settings.metricThreads}
                onChange={(e) => setSettings({...settings, metricThreads: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Logic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Logic</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hosts">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hosts">Hosts</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="synthetics">Synthetics</TabsTrigger>
              <TabsTrigger value="extensions">Extensions</TabsTrigger>
            </TabsList>
            <TabsContent value="hosts" className="space-y-4">
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Host Assignment Logic</Label>
                  <div className="border rounded-md mt-2 bg-slate-950">
                    <CodeMirror
                      value={hostLogic.assignment}
                      height="300px"
                      theme="dark"
                      extensions={[python()]}
                      onChange={(value) => setHostLogic({...hostLogic, assignment: value})}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Host Billable Logic</Label>
                  <div className="border rounded-md mt-2 bg-slate-950">
                    <CodeMirror
                      value={hostLogic.billable}
                      height="300px"
                      theme="dark"
                      extensions={[python()]}
                      onChange={(value) => setHostLogic({...hostLogic, billable: value})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="applications">
              <WorkInProgress />
            </TabsContent>
            <TabsContent value="synthetics">
              <WorkInProgress />
            </TabsContent>
            <TabsContent value="extensions">
              <WorkInProgress />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  )
} 