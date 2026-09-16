import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
export const AsyncState = ({ isLoading, error, children, minHeight = "min-h-[150px]", variant = "default", loadingLabel, onRetry }: AsyncStateProps) => {
    if (isLoading) {
        if (variant === "inline") {
            return (
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Loader2 className="animate-spin text-blue-500" />
                    {loadingLabel && <span>{loadingLabel}</span>}
                </div>
            );
        }
        return (
            <div className={`flex items-center justify-center gap-2 ${minHeight}`}>
                <Loader2 className="animate-spin text-blue-500" />
                {loadingLabel && <span className="text-sm text-muted-foreground">{loadingLabel}</span>}
            </div>
        );
    }
    if (error) {
        if (variant === "inline") {
            return (
                <div className="inline-flex items-center gap-1 text-xs text-destructive shrink-0" title={error}>
                    <AlertCircle />
                    <span>{error}</span>
                </div>
            );
        }
        return (
            <div className={`flex flex-col items-center justify-center gap-2 text-center ${minHeight}`}>
                <AlertCircle className="text-destructive" />
                <p className="text-xs text-destructive font-medium">{error}</p>
                {onRetry && <SmartButton onClick={onRetry} label="Reintentar" icon={RefreshCw} variant="ghost" />}
            </div>
        );
    }
    return <>{children}</>;
};