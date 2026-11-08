import { i18n } from "@lingui/core";
import { messages as enMessages } from "../../locales/en/messages.po";
import { DEFAULT_APP_LANGUAGE, type AppLanguage } from "./locales";

i18n.load("en", enMessages);
i18n.activate(DEFAULT_APP_LANGUAGE);

export { i18n };

export async function activateLanguage(language: AppLanguage): Promise<void> {
  if (language === "ru") {
    const { messages } = await import("../../locales/ru/messages.po");
    i18n.load("ru", messages);
  }
  i18n.activate(language);
}
