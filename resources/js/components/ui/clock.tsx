import { ClockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

export const Clock = (props: any) => (
  <div className="relative w-full">
    <Input
      {...props}
      type="time"
      className="w-full pr-8 [&::-webkit-calendar-picker-indicator]:hidden"
    />
    <ClockIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
  </div>
)