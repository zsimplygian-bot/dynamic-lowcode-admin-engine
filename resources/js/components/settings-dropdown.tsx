import React, { memo } from "react"
import { Settings } from "lucide-react"
import { SmartDropdown, type SDItem } from "@/components/smart-dropdown"
import LanguageDropdown from "@/components/language-dropdown"
import CssThemeDropdown from "@/components/css-theme-dropdown"
import AppearanceToggleDropdown from "@/components/appearance-dropdown"
import { FullscreenButton } from "@/components/fullscreen-button"

export const SettingsDropdown = memo(function SettingsDropdown() {
  const items: SDItem[] = [
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><LanguageDropdown /></div> },
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><CssThemeDropdown /></div> },
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><AppearanceToggleDropdown /></div> },
    { type: "item", custom: <div className="w-full [&>*]:w-full [&_button]:w-full [&_button]:justify-start"><FullscreenButton /></div> },
  ]

  return (
    <SmartDropdown
      label="Fast settings"
      icon={Settings}
      variant="ghost"
      size="md"
      align="end"
      items={items}
    />
  )
})
SettingsDropdown.displayName = "SettingsDropdown"