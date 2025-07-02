"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Globe, Lock } from "lucide-react"
import { BasicInformationFormProps } from "./types"

export function BasicInformationForm({
  formData,
  onInputChange,
  onNumberChange,
  onSelectChange,
  onSwitchChange,
  themeColors
}: BasicInformationFormProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
        <h2 className={`text-lg sm:text-xl font-bold ${themeColors.text}`}>Configure Endpoint</h2>
      </div>

      <Card className={`${themeColors.cardBg} ${themeColors.cardHover} transition-all duration-300`}>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure the basic details of your mock API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Mock Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">Mock Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Enter a descriptive name"
              className="text-sm h-8 sm:h-10"
            />
          </div>

          {/* Method and Path */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="method" className="text-xs sm:text-sm">HTTP Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => onSelectChange("method", value)}
              >
                <SelectTrigger className="h-8 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 text-white text-xs">GET</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="POST">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white text-xs">POST</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="PUT">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-600 text-white text-xs">PUT</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="DELETE">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 text-white text-xs">DELETE</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="PATCH">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 text-white text-xs">PATCH</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="endpoint" className="text-xs sm:text-sm">Endpoint Path</Label>
              <Input
                id="endpoint"
                name="endpoint"
                value={formData.endpoint}
                onChange={onInputChange}
                placeholder="/api/endpoint"
                className="text-sm h-8 sm:h-10 font-mono"
              />
            </div>
          </div>

          {/* Status Code and Delay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="status_code" className="text-xs sm:text-sm">Status Code</Label>
              <Input
                id="status_code"
                name="status_code"
                type="number"
                value={formData.status_code}
                onChange={onNumberChange}
                min={100}
                max={599}
                className="text-sm h-8 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="delay_ms" className="text-xs sm:text-sm">Response Delay (ms)</Label>
              <Input
                id="delay_ms"
                name="delay_ms"
                type="number"
                value={formData.delay_ms}
                onChange={onNumberChange}
                min={0}
                max={10000}
                className="text-sm h-8 sm:h-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={onInputChange}
              placeholder="Describe what this mock endpoint does"
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center space-x-2 pt-1 sm:pt-2">
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={onSwitchChange}
              className="scale-90 sm:scale-100"
            />
            <div className="grid gap-1 leading-none flex-1 min-w-0">
              <Label htmlFor="is_public" className="text-xs sm:text-sm">Public Endpoint</Label>
              <p className="text-xs text-muted-foreground">
                Make this mock accessible without authentication
              </p>
            </div>
            {formData.is_public ? (
              <Globe className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Lock className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
