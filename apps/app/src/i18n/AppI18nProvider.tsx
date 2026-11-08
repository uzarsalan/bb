import { I18nProvider } from "@lingui/react";
import { useEffect, type ReactNode } from "react";
import { useSystemConfig } from "@/hooks/queries/system-queries";
import { activateLanguage, i18n } from "./i18n";
import { DEFAULT_APP_LANGUAGE } from "./locales";

export function AppI18nProvider({ children }: { children: ReactNode }) {
  const language =
    useSystemConfig().data?.generalSettings.language ?? DEFAULT_APP_LANGUAGE;
  useEffect(() => {
    void activateLanguage(language);
  }, [language]);
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
