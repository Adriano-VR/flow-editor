"use client"

import { useEffect, useState } from "react";
import { getFlows } from "../lib/api";
import { Button } from "./ui/button";

interface Flow {
  id: string;
  attributes: {
    name: string;
  };
}

interface SidebarProps {
  onSelectFlow: (flowId: string) => void;
}

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    getFlows().then((data) => setFlows(data.data));
  }, []);


  return (
    <aside className="w-64 p-4 border-r">
      <h2 className="font-bold mb-4">Flows</h2>
      <ul>
        {flows.map((flow) => (
          <li key={flow.id} className="mb-2">
            <Button 
              variant="outline" 
              className="w-full justify-start truncate"
              onClick={() => onSelectFlow(flow.id)}
            >
              {flow.attributes.name}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
}