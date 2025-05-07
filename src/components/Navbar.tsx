"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Menu, Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";

interface NavBarProps {
  onMenuClick?: () => void;
  flows?: Flow[];
}

interface Flow {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function NavBar({ onMenuClick, flows = [] }: NavBarProps) {
  const router = useRouter();
  const { searchInput, setSearchInput } = useSearch();

  const filteredFlows = searchInput.length < 2 
    ? [] 
    : flows.filter((flow: Flow) => 
        flow.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        flow.status.toLowerCase().includes(searchInput.toLowerCase())
      );

  const handleFlowSelect = (flowId: string) => {
    router.push(`/flows/${flowId}`);
    setSearchInput("");
  };

  return (
    <nav className="border-b w-full backdrop-blur-xs">
      <div className="flex h-16 items-center justify-between px-4 ">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center gap-4">
            <h1 className="text-xl font-bold">Flow Editor</h1>
          </div>
        </div>

        <div className="w-full max-w-2xl relative">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar flows..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Resultados da busca */}
          {filteredFlows.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
              <div className="py-2">
                {filteredFlows.map((flow) => (
                  <button
                    key={flow.id}
                    onClick={() => handleFlowSelect(flow.id)}
                    className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex flex-col"
                  >
                    <span className="font-medium">{flow.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Status: {flow.status} • Criado em: {new Date(flow.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
