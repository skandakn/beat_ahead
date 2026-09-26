"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { languageOptions, type Locale } from "@/lib/i18n/translations";

export function LanguageSelector({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className={cn("inline-flex items-center gap-1.5 rounded-lg text-navy-600", className)}>
      <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!compact && <span className="text-xs font-medium">{t("language.label")}</span>}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Locale)}
        className="min-w-0 cursor-pointer bg-transparent py-1 text-xs font-semibold text-navy-700 outline-none"
        aria-label={t("language.select")}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
