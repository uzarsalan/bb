// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@lingui/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { activateLanguage, i18n } from "@/i18n/i18n";
import { GeneralSettingsSection } from "./SettingsView";

afterEach(async () => {
  cleanup();
  await activateLanguage("en");
});

function renderSection(onLanguageChange = vi.fn()) {
  return render(
    <I18nProvider i18n={i18n}>
      <GeneralSettingsSection
        confirmThreadArchive={true}
        onConfirmThreadArchiveChange={vi.fn()}
        keepHistoryAfterContextClear={false}
        onKeepHistoryAfterContextClearChange={vi.fn()}
        summarizeShellCommands={true}
        onSummarizeShellCommandsChange={vi.fn()}
        desktopBrowserAvailable={false}
        generalSettingsDisabled={false}
        language={i18n.locale === "ru" ? "ru" : "en"}
        onLanguageChange={onLanguageChange}
        terminalCopyOnSelect={true}
        onTerminalCopyOnSelectChange={vi.fn()}
        managedBranchPrefix="bb/"
        navigateToThreadAfterCreate={false}
        onManagedBranchPrefixChange={vi.fn()}
        onNavigateToThreadAfterCreateChange={vi.fn()}
        onOpenLinksInAppBrowserChange={vi.fn()}
        onReplaySetupGuide={vi.fn()}
        onRewriteLocalhostLinksChange={vi.fn()}
        onSteerActiveThreadOnEnterChange={vi.fn()}
        openLinksInAppBrowser={false}
        rewriteLocalhostLinks={false}
        steerActiveThreadOnEnter={false}
      />
    </I18nProvider>,
  );
}

describe("General settings language", () => {
  it("shows English section titles by default", () => {
    renderSection();
    expect(screen.getByText("Threads & editing")).toBeDefined();
    expect(screen.getByText("Terminals")).toBeDefined();
    expect(screen.getByRole("button", { name: "Language" })).toBeDefined();
  });

  it("shows Russian section titles when the locale is ru", async () => {
    await activateLanguage("ru");
    renderSection();
    expect(screen.getByText("Треды и редактирование")).toBeDefined();
    expect(screen.getByText("Терминалы")).toBeDefined();
    expect(screen.queryByText("Threads & editing")).toBeNull();
  });

  it("switches the rendered text when the locale changes", async () => {
    renderSection();
    expect(screen.getByText("Terminals")).toBeDefined();
    await activateLanguage("ru");
    expect(await screen.findByText("Терминалы")).toBeDefined();
  });

  it("reports the chosen language", () => {
    const onLanguageChange = vi.fn();
    renderSection(onLanguageChange);
    fireEvent.keyDown(screen.getByRole("button", { name: "Language" }), {
      key: "Enter",
    });
    fireEvent.click(screen.getByRole("menuitem", { name: /Русский/ }));
    expect(onLanguageChange).toHaveBeenCalledWith("ru");
  });
});
