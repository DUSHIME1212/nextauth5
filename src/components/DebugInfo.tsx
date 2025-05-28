"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DebugInfoProps {
  data: any
  title?: string
}

export default function DebugInfo({ data, title = "Debug Information" }: DebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs max-h-[400px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  )
}
