import { useMemo, memo } from "react"
import { Paintbrush, RotateCcw } from "lucide-react"
import { SmartDropdown, SDItem } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { SmartBadge } from "@/components/smart-badge"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { useCssTheme, THEME_VARS } from "@/hooks/use-css-theme"
import { useTranslation } from "@/hooks/use-translation"

const ThemeFormContent = memo(function ThemeFormContent() {
  const t = useTranslation()
  const { currentMode, activeStyles, setVariable, resetTheme } = useCssTheme()

  const { fields, formValues } = useMemo(() => {
    const fieldsAcc: FieldConfig[] = []
    const valuesAcc: Record<string, any> = {}

    THEME_VARS.forEach(({ label, variable, defaultLight, defaultDark, type }) => {
      const fallback = currentMode === "dark" ? defaultDark : defaultLight
      fieldsAcc.push({ id: variable, name: variable, label: t(label), type, placeholder: fallback })
      valuesAcc[variable] = activeStyles[variable] ?? fallback
    })

    return { fields: fieldsAcc, formValues: valuesAcc }
  }, [activeStyles, currentMode, t])

  return (
    <div className="flex flex-col gap-2 p-2" onClick={(e) => e.stopPropagation()}>
      <div className="w-60">
        <FormGroup fields={fields} values={formValues} layout="horizontal" onChange={setVariable} />
      </div>
      <div className="flex items-center pt-2 border-t">
        <SmartButton onClick={resetTheme} label={t("Reset Values")} icon={RotateCcw} variant="ghost" buttonClassName="w-full justify-center" />
      </div>
    </div>
  )
})

export default function CssThemeDropdown() {
  const t = useTranslation()
  const { currentMode } = useCssTheme()

  const items: SDItem[] = useMemo(() => [
    { type: "custom" as const, custom: <ThemeFormContent /> }
  ], [])

  return (
    <SmartDropdown icon={Paintbrush} variant="ghost" label={t("Customization")} items={items} disableHover 
      labelExtra={<SmartBadge label={currentMode} className="uppercase" />} />
  )
}