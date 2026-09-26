"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-navy-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-navy-900 mb-2">BeatAhead</h3>
            <p className="text-sm text-navy-500">
              {t("footer.framework")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900 mb-2">{t("footer.platform")}</h3>
            <div className="space-y-1">
              <Link href="/dashboard" className="block text-sm text-navy-500 hover:text-navy-900">{t("dashboard.title")}</Link>
              <Link href="/methodology" className="block text-sm text-navy-500 hover:text-navy-900">{t("nav.methodology")}</Link>
              <Link href="/about" className="block text-sm text-navy-500 hover:text-navy-900">{t("nav.about")}</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900 mb-2">{t("footer.important")}</h3>
            <p className="text-xs text-navy-500 leading-relaxed">{t("footer.disclaimer")}</p>
          </div>
        </div>
        <div className="pt-6 border-t border-navy-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-navy-400">
          <span>&copy; {new Date().getFullYear()} BeatAhead. {t("footer.research")}</span>
          <span>{t("footer.simulated")}</span>
        </div>
      </div>
    </footer>
  );
}

export function DisclaimerBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 ${className ?? ""}`}>
      <strong>{t("footer.research")}</strong> {t("footer.disclaimer")}
    </div>
  );
}
