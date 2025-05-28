"use client"

import React, { useState } from "react"
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

function getFileExtension(name: string): string | undefined {
  const parts = name.split(".")
  return parts.length > 1 && parts[parts.length - 1]
    ? parts[parts.length - 1]?.toLowerCase()
    : undefined
}

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

function convertToItems(contents: any[]): Record<string, Item> {
  const items: Record<string, Item> = {}
  const parentChildMap = new Map<string, string[]>()

  items["root"] = {
    name: "Repository Root",
    children: [],
    type: "dir",
    path: "",
  }

  contents.forEach((item) => {
    if (!item.name || !item.path || !item.type) {
      console.warn("Skipping invalid item:", item)
      return
    }

    items[item.path] = {
      name: item.name,
      type: item.type,
      path: item.path,
      ...(item.type === "file" ? { fileExtension: getFileExtension(item.name) } : { children: [] }),
    }

    const pathSegments = item.path.split("/")
    const parentPath = pathSegments.length > 1 ? pathSegments.slice(0, -1).join("/") : "root"

    if (!parentChildMap.has(parentPath)) {
      parentChildMap.set(parentPath, [])
    }
    parentChildMap.get(parentPath)!.push(item.path)
  })

  parentChildMap.forEach((childrenPaths, parentPath) => {
    if (!items[parentPath] && parentPath !== "root") {
      const parentName = parentPath.split("/").pop() || parentPath
      items[parentPath] = {
        name: parentName,
        type: "dir",
        path: parentPath,
        children: [],
      }
    }

    if (items[parentPath] && items[parentPath].type === "dir") {
      const sortedChildren = childrenPaths.sort((a, b) => {
        const itemA = items[a]
        const itemB = items[b]
        if (!itemA || !itemB) return 0
        const isAFolder = itemA.type === "dir"
        const isBFolder = itemB.type === "dir"
        if (isAFolder && !isBFolder) return -1
        if (!isAFolder && isBFolder) return 1
        return itemA.name.localeCompare(itemB.name)
      })
      items[parentPath].children = sortedChildren
    }
  })

  if (items["root"]) {
    const rootChildren = parentChildMap.get("root") || []
    items["root"].children = rootChildren.sort((a, b) => {
      const itemA = items[a]
      const itemB = items[b]
      if (!itemA || !itemB) return 0
      const isAFolder = itemA.type === "dir"
      const isBFolder = itemB.type === "dir"
      if (isAFolder && !isBFolder) return -1
      if (!isAFolder && isBFolder) return 1
      return itemA.name.localeCompare(itemB.name)
    })
  }

  console.log("Converted items:", items)
  return items
}

const indent = 20

export default function RepoContents({
  contents,
  owner,
  repo,
  accessToken,
}: RepoContentsProps) {
  console.log("Contents:", contents)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [items, setItems] = useState(() => {
    const items = convertToItems(contents)
    // console.log("Initial items:", items)
    return items
  })

  const tree = useTree<Item>({
    initialState: {
      expandedItems: ["root"],
      selectedItems: [],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => {
      const name = item.getItemData()?.name ?? "Unknown"
      console.log("Item ID:", item.getId(), "Name:", name)
      return name
    },
    isItemFolder: (item) => item.getItemData()?.type === "dir",
    canReorder: true,
    onDrop: createOnDropHandler((parentItem, newChildrenIds) => {
      setItems((prevItems) => {
        const sortedChildren = [...newChildrenIds].sort((a, b) => {
          const itemA = prevItems[a]
          const itemB = prevItems[b]
          const isAFolder = itemA?.type === "dir"
          const isBFolder = itemB?.type === "dir"
          if (isAFolder && !isBFolder) return -1
          if (!isAFolder && isBFolder) return 1
          return (itemA?.name ?? "").localeCompare(itemB?.name ?? "")
        })

        return {
          ...prevItems,
          [parentItem.getId()]: {
            ...prevItems[parentItem.getId()],
            name: prevItems[parentItem.getId()]?.name ?? "",
            type: prevItems[parentItem.getId()]?.type ?? "dir",
            path: prevItems[parentItem.getId()]?.path ?? "",
            fileExtension: prevItems[parentItem.getId()]?.fileExtension,
            children: sortedChildren,
          },
        }
      })
    }),
    dataLoader: {
      getItem: (itemId) => {
        if (!items[itemId]) {
          console.warn("Missing item for ID:", itemId)
        }
        return (
          items[itemId] ?? {
            name: "Unknown",
            type: "file",
            path: itemId,
          }
        )
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

  console.log(
    "Tree items:",
    tree.getItems().map((item) => ({
      id: item.getId(),
      name: item.getItemName(),
      data: item.getItemData(),
    }))
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Repository Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 h-[600px]">
          <div className="w-full md:w-1/3 border-2 border-black p-4 rounded-md overflow-auto">
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
                          "text-muted-foreground pointer-events-none size-4"
                        )}
                      {item.getItemName()}
                    </span>
                  </TreeItemLabel>
                </TreeItem>
              ))}
            </Tree>
          </div>
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