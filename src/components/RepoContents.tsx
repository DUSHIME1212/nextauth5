"use client"

import React, { useState, useMemo } from "react"
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core"
import { AssistiveTreeDescription, useTree } from "@headless-tree/react"
import {
  RiBracesLine,
  RiCodeSSlashLine,
  RiFileLine,
  RiFileTextLine,
  RiImageLine,
  RiReactjsLine,
} from "@remixicon/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tree, TreeItem, TreeItemLabel } from "@/components/tree"
import FileViewer from "./FileViewer"

interface RepoContentsProps {
  contents: any[]
  owner: string
  repo: string
  accessToken?: string
}

interface Item {
  name: string
  children?: string[]
  fileExtension?: string
  type: "file" | "dir"
  path: string
}

// Helper function to get file extension from file name
function getFileExtension(name: string): string | undefined {
  const parts = name.split(".")
  return parts.length > 1 && parts[parts.length - 1]
    ? parts[parts.length - 1]!.toLowerCase()
    : undefined
}

// Convert contents array to flat Record<string, Item>
function convertToItems(contents: any[], basePath: string = ""): Record<string, Item> {
  const items: Record<string, Item> = {}
  
  // Add root item
  items["root"] = {
    name: "Repository Root",
    children: contents.map((item) => item.path),
    type: "dir",
    path: "",
  }

  contents.forEach((item) => {
    const fullPath = basePath ? `${basePath}/${item.name}` : item.name
    items[fullPath] = {
      name: item.name,
      type: item.type,
      path: fullPath,
      ...(item.type === "dir" && item.children?.length
        ? { children: item.children.map((child: any) => `${fullPath}/${child.name}`) }
        : {}),
      ...(item.type === "file" ? { fileExtension: getFileExtension(item.name) } : {}),
    }

    if (item.type === "dir" && item.children?.length) {
      Object.assign(items, convertToItems(item.children, fullPath))
    }
  })

  return items
}

// Helper function to get icon based on file extension
function getFileIcon(extension: string | undefined, className: string) {
  switch (extension) {
    case "tsx":
    case "jsx":
      return <RiReactjsLine className={className} />
    case "ts":
    case "js":
    case "mjs":
      return <RiCodeSSlashLine className={className} />
    case "json":
      return <RiBracesLine className={className} />
    case "svg":
    case "ico":
    case "png":
    case "jpg":
      return <RiImageLine className={className} />
    case "md":
      return <RiFileTextLine className={className} />
    default:
      return <RiFileLine className={className} />
  }
}

const indent = 20

export default function RepoContents({
  contents,
  owner,
  repo,
  accessToken,
}: RepoContentsProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [items, setItems] = useState(convertToItems(contents))

  const tree = useTree<Item>({
    initialState: {
      expandedItems: ["root"],
      selectedItems: [],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData()?.name ?? "Unknown",
    isItemFolder: (item) => item.getItemData()?.type === "dir",
    canReorder: true,
    onDrop: createOnDropHandler((parentItem, newChildrenIds) => {
      setItems((prevItems) => {
        // Sort the children alphabetically
        const sortedChildren = [...newChildrenIds].sort((a, b) => {
          const itemA = prevItems[a]
          const itemB = prevItems[b]

          // First sort folders before files
          const isAFolder = itemA?.type === "dir"
          const isBFolder = itemB?.type === "dir"

          if (isAFolder && !isBFolder) return -1
          if (!isAFolder && isBFolder) return 1

          // Then sort alphabetically by name
          return (itemA?.name ?? "").localeCompare(itemB?.name ?? "")
        })

        return {
          ...prevItems,
          [parentItem.getId()]: {
            ...prevItems[parentItem.getId()],
            // Ensure all required Item fields are present and not undefined
            name: prevItems[parentItem.getId()]?.name ?? "",
            type: prevItems[parentItem.getId()]?.type ?? "file",
            path: prevItems[parentItem.getId()]?.path ?? "",
            fileExtension: prevItems[parentItem.getId()]?.fileExtension,
            children: sortedChildren,
          },
        }
      })
    }),
    dataLoader: {
      getItem: (itemId) =>
        items[itemId] ??
        {
          name: "Unknown",
          type: "file",
          path: itemId,
        },
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Repository Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 h-[600px]">
          {/* File Tree */}
          <div className="w-full md:w-1/3 border rounded-md overflow-auto">
            <Tree
              className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
              indent={indent}
              tree={tree}
            >
              <AssistiveTreeDescription tree={tree} />
              {tree.getItems().map((item) => (
                <TreeItem key={item.getId()} item={item} className="pb-0!">
                  <TreeItemLabel
                    className="rounded-none py-1"
                    onClick={() => {
                      if (!item.isFolder()) {
                        setSelectedFile(item.getItemData()?.path ?? null)
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {!item.isFolder() &&
                        getFileIcon(
                          item.getItemData()?.fileExtension,
                          "text-muted--pocket-foreground pointer-events-none size-4"
                        )}
                      {item.getItemName()}
                    </span>
                  </TreeItemLabel>
                </TreeItem>
              ))}
            </Tree>
          </div>
          {/* File Viewer */}
          <div className="w-full md:w-2/3">
            {selectedFile ? (
              <FileViewer
                owner={owner}
                repo={repo}
                path={selectedFile}
                accessToken={accessToken}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a file to view its contents
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}