import * as React from "react"
import { inputStyles } from "@/lib/input-styles"
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} data-slot="input" className={inputStyles(
        "h-9 px-3 py-1 selection:bg-primary selection:text-primary-foreground",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )} {...props}
    />
  )
}
export { Input }