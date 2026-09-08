import { useState, useEffect, useCallback } from "react"

export interface ThemeVar { 
  label: string; 
  variable: string; 
  defaultLight: string; 
  defaultDark: string;
  type?: "color" | "text" | "number";
}

export const THEME_VARS: ThemeVar[] = [
  { label: "Main Background", variable: "--background", defaultLight: "#ffffff", defaultDark: "#141414", type: "color" },
  { label: "Card Background", variable: "--card", defaultLight: "#ffffff", defaultDark: "#1a1a1a", type: "color" },
  { label: "Sidebar", variable: "--sidebar", defaultLight: "#fafafa", defaultDark: "#18181b", type: "color" },
  { label: "Borders", variable: "--border", defaultLight: "#e4e4e7", defaultDark: "#27272a", type: "color" },
  { label: "Border Radius", variable: "--radius", defaultLight: "1.25rem", defaultDark: "1.25rem", type: "text" },
]

export type ThemeMode = "light" | "dark"
type StylesState = Record<ThemeMode, Record<string, string>>

export interface UseCssThemeReturn {
  currentMode: ThemeMode
  activeStyles: Record<string, string>
  setVariable: (variable: string, value: string) => void
  resetTheme: () => void
}

const getSavedStyles = (): StylesState => {
  try { return JSON.parse(localStorage.getItem("app_custom_css_vars_v2") || "") } catch { return { light: {}, dark: {} } }
}

export function useCssTheme(): UseCssThemeReturn {
  const [styles, setStyles] = useState<StylesState>(getSavedStyles)
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  )

  const applyDomVariables = useCallback((mode: ThemeMode, currentStyles: StylesState) => {
    const active = currentStyles[mode] || {}
    THEME_VARS.forEach(({ variable }) => {
      if (active[variable]) document.documentElement.style.setProperty(variable, active[variable])
      else document.documentElement.style.removeProperty(variable)
    })
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      const newMode: ThemeMode = isDark ? "dark" : "light"
      setCurrentMode(newMode)
      applyDomVariables(newMode, styles)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    applyDomVariables(currentMode, styles)
    return () => observer.disconnect()
  }, [styles, applyDomVariables, currentMode])

  const setVariable = useCallback((variable: string, value: string) => {
    setStyles((prev) => {
      const updated = { ...prev, [currentMode]: { ...prev[currentMode], [variable]: value } }
      localStorage.setItem("app_custom_css_vars_v2", JSON.stringify(updated))
      document.documentElement.style.setProperty(variable, value)
      return updated
    })
  }, [currentMode])

  const resetTheme = useCallback(() => {
    localStorage.removeItem("app_custom_css_vars_v2")
    THEME_VARS.forEach(({ variable }) => document.documentElement.style.removeProperty(variable))
    setStyles({ light: {}, dark: {} })
  }, [])

  return { currentMode, activeStyles: styles[currentMode] || {}, setVariable, resetTheme }
}