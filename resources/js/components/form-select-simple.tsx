import { SelectBaseLayout, SelectOptionsList, SelectBaseProps } from "@/components/form-select-base"
export interface FormSelectSimpleProps extends SelectBaseProps {
  onSelect?: (value: string) => void
}
export const FormSelectSimple = ({ onSelect, ...props }: FormSelectSimpleProps) => {
  const currentVal = String(props.value || props.defaultValue || "")
  return (
    <SelectBaseLayout {...props}>
      {(close) => (
        <SelectOptionsList options={props.options ?? []} currentValue={currentVal} disabled={props.disabled} close={close} onSelectOption={(id, closeFn) => { onSelect?.(id); closeFn() }} />
      )}
    </SelectBaseLayout>
  )
}
export default FormSelectSimple