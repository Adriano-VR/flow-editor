import { AlertCircle } from "lucide-react";

interface JsonErrorDisplayProps {
  error: string | null;
}

export function JsonErrorDisplay({ error }: JsonErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 border-b mb-4">
      <AlertCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
} 