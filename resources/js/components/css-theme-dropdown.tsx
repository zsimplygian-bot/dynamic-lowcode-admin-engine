import { useState, useEffect, memo, useMemo } from "react"
import { Paintbrush, Save } from "lucide-react"
import { toast } from "sonner"
import { SmartDropdown, SDItem } from "@/components/smart-dropdown"
import { SmartButton } from "@/components/smart-button"
import { SmartBadge } from "@/components/smart-badge"
import { ResetButton } from "@/components/reset-button"
import { FormGroup, FieldConfig } from "@/components/form-group"
import { useTranslation } from "@/hooks/use-translation"
import { useLocalStorage } from "@/hooks/use-local-storage"

export interface ThemeVar {
  label: string; variable: string; type?: "color" | "text" | "number"
}

export const THEME_VARS: ThemeVar[] = [
  { label: "Background", variable: "--background", type: "color" },
  { label: "Foreground", variable: "--foreground", type: "color" },
  { label: "Border Radius", variable: "--radius", type: "text" },
  { label: "Borders", variable: "--border", type: "color" },
  { label: "Input", variable: "--input", type: "color" },
  { label: "Ring", variable: "--ring", type: "color" },
  { label: "Card", variable: "--card", type: "color" },
  { label: "Card Foreground", variable: "--card-foreground", type: "color" },
  { label: "Popover", variable: "--popover", type: "color" },
  { label: "Popover Foreground", variable: "--popover-foreground", type: "color" },
  { label: "Primary", variable: "--primary", type: "color" },
  { label: "Primary Foreground", variable: "--primary-foreground", type: "color" },
  { label: "Secondary", variable: "--secondary", type: "color" },
  { label: "Secondary Foreground", variable: "--secondary-foreground", type: "color" },
  { label: "Muted", variable: "--muted", type: "color" },
  { label: "Muted Foreground", variable: "--muted-foreground", type: "color" },
  { label: "Accent", variable: "--accent", type: "color" },
  { label: "Accent Foreground", variable: "--accent-foreground", type: "color" },
  { label: "Destructive", variable: "--destructive", type: "color" },
  { label: "Destructive Foreground", variable: "--destructive-foreground", type: "color" },
  { label: "Sidebar", variable: "--sidebar", type: "color" },
  { label: "Sidebar Foreground", variable: "--sidebar-foreground", type: "color" },
  { label: "Sidebar Primary", variable: "--sidebar-primary", type: "color" },
  { label: "Sidebar Primary Foreground", variable: "--sidebar-primary-foreground", type: "color" },
  { label: "Sidebar Accent", variable: "--sidebar-accent", type: "color" },
  { label: "Sidebar Accent Foreground", variable: "--sidebar-accent-foreground", type: "color" },
  { label: "Sidebar Border", variable: "--sidebar-border", type: "color" },
  { label: "Sidebar Ring", variable: "--sidebar-ring", type: "color" },
  { label: "Chart 1", variable: "--chart-1", type: "color" },
  { label: "Chart 2", variable: "--chart-2", type: "color" },
  { label: "Chart 3", variable: "--chart-3", type: "color" },
  { label: "Chart 4", variable: "--chart-4", type: "color" },
  { label: "Chart 5", variable: "--chart-5", type: "color" },
]

export type ThemeMode = "light" | "dark"
type StylesState = Record<ThemeMode, Record<string, string>>

const STORAGE_KEY = "app_custom_css_vars_v2"

const applyDom = (mode: ThemeMode, styles: StylesState) => {
  if (typeof document === "undefined") return
  const active = styles[mode] || {}
  THEME_VARS.forEach(({ variable }) => {
    if (active[variable]) document.documentElement.style.setProperty(variable, active[variable])
    else document.documentElement.style.removeProperty(variable)
  })
}

export function useCssTheme() {
  const [styles, setStyles] = useLocalStorage<StylesState>(STORAGE_KEY, { light: {}, dark: {} })
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  )

  useEffect(() => {
    applyDom(currentMode, styles)
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      const newMode = isDark ? "dark" : "light"
      setCurrentMode(newMode)
      applyDom(newMode, styles)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [styles, currentMode])

  const saveTheme = (newModeStyles: Record<string, string>) => {
    setStyles((prev) => ({ ...prev, [currentMode]: newModeStyles }))
  }

  const resetTheme = () => {
    setStyles({ light: {}, dark: {} })
    THEME_VARS.forEach(({ variable }) => document.documentElement.style.removeProperty(variable))
  }

  return { currentMode, activeStyles: styles[currentMode] || {}, saveTheme, resetTheme }
}

const ThemeFormContent = memo(function ThemeFormContent() {
  const t = useTranslation()
  const { currentMode, activeStyles, saveTheme, resetTheme } = useCssTheme()
  const [draftValues, setDraftValues] = useState<Record<string, string>>({})

  useEffect(() => {
    setDraftValues(activeStyles)
  }, [activeStyles, currentMode])

  const handleFieldChange = (name: string, value: string) => {
    setDraftValues((prev) => ({ ...prev, [name]: value }))
    document.documentElement.style.setProperty(name, value)
  }

  const handleSave = () => {
    saveTheme(draftValues)
    toast.success(t("Theme saved successfully"))
  }

  const handleReset = () => {
    setDraftValues({})
    resetTheme()
    toast.info(t("Theme reset to default"))
  }

  const defaultStyles = useMemo(() => {
    if (typeof window === "undefined") return {}
    const computed = getComputedStyle(document.documentElement)
    const acc: Record<string, string> = {}
    THEME_VARS.forEach(({ variable }) => {
      acc[variable] = computed.getPropertyValue(variable).trim()
    })
    return acc
  }, [currentMode])

  const { fields, formValues } = useMemo(() => {
    const fieldsAcc: FieldConfig[] = []
    const valuesAcc: Record<string, any> = {}

    THEME_VARS.forEach(({ label, variable, type }) => {
      const fallback = defaultStyles[variable] || ""
      fieldsAcc.push({ id: variable, name: variable, label: t(label), type, placeholder: fallback })
      valuesAcc[variable] = draftValues[variable] ?? activeStyles[variable] ?? fallback
    })

    return { fields: fieldsAcc, formValues: valuesAcc }
  }, [defaultStyles, draftValues, activeStyles, t])

  return (
    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="w-80 pl-2 max-h-[400px] overflow-y-auto pr-1">
        <FormGroup fields={fields} values={formValues} layout="horizontal" onChange={handleFieldChange} />
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t">
        <ResetButton onReset={handleReset} label={t("Reset")} variant="ghost" buttonClassName="w-1/2 justify-center" />
        <SmartButton onClick={handleSave} label={t("Save")} icon={Save} variant="default" buttonClassName="w-1/2 justify-center" />
      </div>
    </div>
  )
})

export default function CssThemeDropdown() {
  const t = useTranslation()
  const { currentMode } = useCssTheme()

  const items: SDItem[] = useMemo(() => [{ type: "custom", custom: <ThemeFormContent /> }], [])

  return (
    <SmartDropdown icon={Paintbrush} variant="ghost" buttonLabel="Customization" label={t("Customization")} items={items} disableHover labelExtra={<SmartBadge label={currentMode} className="uppercase" />} />
  )
}