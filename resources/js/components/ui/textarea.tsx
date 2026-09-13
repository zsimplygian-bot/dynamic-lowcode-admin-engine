import * as React from "react"
import { inputStyles } from "@/lib/input-styles"
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea data-slot="textarea" className={inputStyles( "w-full resize-y min-h-16 px-3 py-2", className )} {...props} />
  )
}
export { Textarea }