"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "./ui/input"

export function SearchDrawer() {
  const [search, setSearch] = useState("")

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  )
} 