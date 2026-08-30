import { cn } from "@/lib/utils"

// Clases base compartidas por todos los controles de entrada (Input, Textarea, Select, etc.)
export const BASE_INPUT_CLASSES = [
  "border-input placeholder:text-muted-foreground dark:bg-input/30",
  "flex w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  "disabled:cursor-not-allowed disabled:opacity-80",
]

/**
 * Helper para construir las clases de cualquier elemento de entrada de formulario
 */
export function inputStyles(...classNames: (string | undefined)[]) {
  return cn(BASE_INPUT_CLASSES, classNames)
}