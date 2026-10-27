import { Loader2, AlertCircle } from "lucide-react";
import { SmartButton } from "@/components/smart-button";

interface AsyncStateProps {
  isLoading: boolean
  error?: string | null
  children?: React.ReactNode
  minHeight?: string
  variant?: "default" | "inline"
  loadingLabel?: React.ReactNode
  onRetry?: () => void
}

export const AsyncState = ({
  isLoading, error, children, minHeight = "min-h-[150px]", variant = "default", loadingLabel = "Loading...", onRetry
}: AsyncStateProps) => {
  if (isLoading) {
    if (variant === "inline") {
      return (
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Loader2 className="animate-spin text-blue-500 shrink-0" />
          {loadingLabel && <span>{loadingLabel}</span>}
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center gap-2 w-full ${minHeight}`}>
        <Loader2 className="animate-spin text-blue-500 shrink-0" />
        {loadingLabel && <span className="text-sm text-muted-foreground">{loadingLabel}</span>}
      </div>
    );
  }

  if (error) {
    if (variant === "inline") {
      return (
        <div className="inline-flex items-center gap-1 text-xs text-destructive shrink-0" title={error}>
          <AlertCircle className="shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center gap-2 text-center w-full max-w-xl mx-auto p-4 ${minHeight}`}>
        <AlertCircle className="text-destructive shrink-0" />
        <p className="text-xs text-destructive font-medium break-all whitespace-normal leading-relaxed">{error}</p>
        {onRetry && <SmartButton onClick={onRetry} label="Reintentar" icon="refresh-cw" variant="ghost" />}
      </div>
    );
  }

  return <>{children}</>;
};