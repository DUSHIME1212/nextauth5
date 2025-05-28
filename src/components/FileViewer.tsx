"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface FileViewerProps {
  owner: string
  repo: string
  path: string
  branch?: string
  accessToken?: string
}

export default function FileViewer({ owner, repo, path, branch = "main", accessToken }: FileViewerProps) {
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [fileInfo, setFileInfo] = useState<any>(null)

  useEffect(() => {
    async function fetchFileContent() {
      setLoading(true)
      setError(null)

      try {
        const headers: HeadersInit = {
          Accept: "application/vnd.github.v3+json",
        }
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
          { headers }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`)
        }

        const data = await response.json()
        setFileInfo(data)

        if (!data.content) {
          throw new Error("File content is empty or not available")
        }

        // Decode base64 content, handle potential binary files
        try {
          const content = atob(data.content.replace(/\n/g, ""))
          setFileContent(content)
        } catch (decodeError) {
          throw new Error("Unable to decode file content (possibly a binary file)")
        }
      } catch (err) {
        console.error("Error fetching file:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch file content")
      } finally {
        setLoading(false)
      }
    }

    fetchFileContent()
  }, [owner, repo, path, branch, accessToken])

  const copyToClipboard = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadFile = () => {
    if (fileContent && fileInfo) {
      const blob = new Blob([fileContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileInfo.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getLanguage = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      py: "python",
      rb: "ruby",
      java: "java",
      go: "go",
      php: "php",
      cs: "csharp",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
    }
    return languageMap[extension] || "text"
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg truncate">{fileInfo?.name || path.split("/").pop() || "File Viewer"}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={loading || !!error || !fileContent}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile} disabled={loading || !!error || !fileContent}>
            <Download className="h-4 w-4" />
            <span className="ml-2">Download</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p>Error: {error}</p>
          </div>
        ) : fileContent ? (
          <Tabs defaultValue="preview" className="w-full h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-0 h-[calc(100%-3rem)]">
              <div className="border rounded-md overflow-hidden h-full">
                <SyntaxHighlighter
                  language={fileInfo ? getLanguage(fileInfo.name) : "text"}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: "0.9rem",
                    height: "100%",
                    overflow: "auto",
                  }}
                >
                  {fileContent}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
            <TabsContent value="raw" className="mt-0 h-[calc(100%-3rem)]">
              <pre className="p-4 bg-gray-50 rounded-md overflow-auto h-full text-sm">{fileContent}</pre>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-gray-500">No content available</p>
        )}
      </CardContent>
    </Card>
  )
}