import { useMemo } from "react";
import { SmartDropdown, type SDItem } from "@/components/smart-dropdown";
import { useAppearance } from "@/hooks/use-appearance";
import { useTranslation } from "@/hooks/use-translation";
import { Monitor, Moon, Sun } from "lucide-react";
export default function AppearanceToggleDropdown() {
  const { appearance, updateAppearance } = useAppearance();
  const t = useTranslation();
  const CurrentIcon = useMemo(() => {
    return appearance === "dark" ? Moon : appearance === "light" ? Sun : Monitor;
  }, [appearance]);
  const items: SDItem[] = useMemo(
    () => [
      { label: t("Light"), icon: Sun, action: () => updateAppearance("light") },
      { label: t("Dark"), icon: Moon, action: () => updateAppearance("dark") },
      { label: t("System"), icon: Monitor, action: () => updateAppearance("system") },
    ], [updateAppearance, t]
  );
  return ( <div> <SmartDropdown buttonLabel="Toggle theme" label={t("Toggle theme")} icon={CurrentIcon} variant="ghost" items={items} /> </div> );
}