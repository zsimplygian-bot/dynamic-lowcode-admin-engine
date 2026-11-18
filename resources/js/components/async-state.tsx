import { DynamicIcon } from "@/components/dynamic-icon"
import { SmartButton } from "@/components/smart-button"

export interface AsyncProps { isLoading?: boolean; error?: any; isEmpty?: boolean; children?: React.ReactNode; minHeight?: string; variant?: "default" | "inline"; loadingLabel?: React.ReactNode; errorLabel?: React.ReactNode; emptyLabel?: React.ReactNode; onRetry?: () => void }

export const Async = ({ isLoading = false, error, isEmpty, children, minHeight = "min-h-[150px]", variant = "default", loadingLabel = "Loading...", errorLabel = "Error loading data", emptyLabel = "No items found", onRetry }: AsyncProps) => {
  const isInline = variant === "inline"
  const errorMessage = typeof error === "string" ? error : (error?.message ?? (error ? errorLabel : null))
  const LoaderIcon = <DynamicIcon name="loader-2" className="animate-spin text-blue-500 shrink-0" />
  const AlertIcon = <DynamicIcon name="alert-circle" className="shrink-0 text-destructive" />
  const InboxIcon = <DynamicIcon name="inbox" className="shrink-0 text-muted-foreground" />

  if (isLoading) return isInline ? (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">{LoaderIcon}{loadingLabel && <span>{loadingLabel}</span>}</div>
  ) : (
    <div className={`flex items-center justify-center gap-2 w-full ${minHeight}`}>{LoaderIcon}{loadingLabel && <span className="text-sm text-muted-foreground">{loadingLabel}</span>}</div>
  )
  if (errorMessage) return isInline ? (
    <div className="inline-flex items-center gap-1 text-xs text-destructive shrink-0" title={String(errorMessage)}>{AlertIcon}<span className="truncate">{errorMessage}</span></div>
  ) : (
    <div className={`flex flex-col items-center justify-center gap-2 text-center w-full max-w-xl mx-auto p-4 ${minHeight}`}>{AlertIcon}<p className="text-xs text-destructive font-medium break-all whitespace-normal leading-relaxed">{errorMessage}</p>{onRetry && <SmartButton onClick={onRetry} label="Retry" icon="refresh-cw" variant="ghost" />}</div>
  )
  if (isEmpty) return isInline ? (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">{InboxIcon}<span>{emptyLabel}</span></div>
  ) : (
    <div className={`flex flex-col items-center justify-center gap-1 text-center w-full p-4 ${minHeight}`}>{InboxIcon}<span className="text-xs text-muted-foreground font-medium">{emptyLabel}</span></div>
  )
  return <>{children}</>
}
export default Async