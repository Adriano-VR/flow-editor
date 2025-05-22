import { Textarea } from "@/components/ui/textarea";

interface JsonTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onError: (error: string | null) => void;
  className?: string;
}

export function JsonTextarea({ value, onChange, onError, className }: JsonTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    onError(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    try {
      JSON.parse(pastedText);
      onChange(pastedText);
      onError(null);
    } catch (err) {
      console.error(err);
      onError("JSON inválido. Por favor, verifique a formatação.");
    }
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      className={`resize-none bg-background border rounded-md ${className || ''}`}
      placeholder="Cole ou edite o JSON do fluxo aqui..."
      style={{
        tabSize: 2,
        whiteSpace: "pre",
        wordWrap: "normal",
        overflowX: "auto"
      }}
    />
  );
} 