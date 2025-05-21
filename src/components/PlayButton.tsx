import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

interface PlayButtonProps {
  onPlay: () => Promise<void>;
  onExecutionStateChange?: (isExecuting: boolean) => void;
  className?: string;
}

export function PlayButton({ onPlay, onExecutionStateChange, className }: PlayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      onExecutionStateChange?.(true);
      await onPlay();
    } finally {
      setIsLoading(false);
      onExecutionStateChange?.(false);
    }
  };

  return (
    <Button 
      onClick={handlePlay} 
      disabled={isLoading}
      className={className}
      variant="outline"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {isLoading ? 'Executando...' : 'Executar Flow'}
    </Button>
  );
} 