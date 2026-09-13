import { ClockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
interface ClockProps extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  onChange?: (value: string) => void
}
export const Clock = ({ className, value = "", onChange, onClick, ...props }: ClockProps) => (
  <div className="relative w-full flex items-center">
    <Input {...props} type="time" value={value} onClick={(e) => { e.currentTarget.showPicker?.(); onClick?.(e) }} onChange={(e) => onChange?.(e.target.value)}
      className={cn("w-full pr-8 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0",
      "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer", className)} />
    <ClockIcon className="absolute right-2.5 size-5 text-muted-foreground pointer-events-none shrink-0" />
  </div>
)