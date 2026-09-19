import { Input } from "@/components/ui/input"
export interface ColorInputProps {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelect?: (e: React.SyntheticEvent<HTMLInputElement>) => void
}
export function ColorInput({ value, className = "", style, ...props }: ColorInputProps & { style?: React.CSSProperties }) {
  const currentColor = value || props.defaultValue || "#000000"
  return (
    <Input {...props} type="color" value={value} style={{ backgroundColor: currentColor, ...style }}
      className={`[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none ${className}`}
    />
  )
}

export default ColorInput