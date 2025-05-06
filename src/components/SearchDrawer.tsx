"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer"

export function SearchDrawer() {
  const [search, setSearch] = useState("")

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-[400px]">
        <DrawerHeader>
          <DrawerTitle>Pesquisar</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
} 