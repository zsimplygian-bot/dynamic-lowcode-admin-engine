import { cn } from "@/lib/utils"
export const BASE_INPUT_CLASSES =
  "border-input placeholder:text-muted-foreground dark:bg-input/30 flex w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none"
  "md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40" 
  "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-80"
export const inputStyles = (...inputs: Parameters<typeof cn>) => cn(BASE_INPUT_CLASSES, ...inputs)