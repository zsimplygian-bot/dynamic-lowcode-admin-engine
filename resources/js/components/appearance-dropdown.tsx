import { SmartDropdown, type SDItem } from "@/components/smart-dropdown";
import { useAppearance } from "@/hooks/use-appearance";
import { useTranslation } from "@/hooks/use-translation";
export default function AppearanceToggleDropdown() {
  const { appearance, updateAppearance } = useAppearance();
  const t = useTranslation();
  const currentIcon = appearance === "dark" ? "moon" : appearance === "light" ? "sun" : "monitor";
  const items: SDItem[] = [
    { label: t("Light"), icon: "sun", action: () => updateAppearance("light") },
    { label: t("Dark"), icon: "moon", action: () => updateAppearance("dark") },
    { label: t("System"), icon: "monitor", action: () => updateAppearance("system") },
  ];
  return ( <SmartDropdown buttonLabel="Toggle theme" label={t("Toggle theme")} icon={currentIcon} variant="ghost" items={items} /> );
}