import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";
import type { IconName } from "@bb/shared-ui/icon";
import { SETTINGS_ROUTE_PATH, getSettingsRoutePath } from "@/lib/route-paths";

export const SETTINGS_NAV_SECTIONS = [
  { icon: "Settings", id: "general", label: msg`General` },
  { icon: "Bot", id: "providers", label: msg`Providers` },
  { icon: "AiBrain01", id: "ai-services", label: msg`AI services` },
  { icon: "Palette", id: "appearance", label: msg`Appearance` },
  { icon: "SlidersHorizontal", id: "keyboard", label: msg`Keyboard` },
  { icon: "Browser", id: "browser", label: msg`Browser` },
  { icon: "File", id: "files", label: msg`Files` },
  { icon: "FolderGit", id: "projects", label: msg`Projects` },
  { icon: "Laptop", id: "machines", label: msg`Machines` },
  { icon: "Smartphone", id: "mobile", label: msg`Mobile` },
  {
    icon: "Lock",
    id: "environment-variables",
    label: msg`Environment variables`,
  },
  { icon: "PackageReceive", id: "updates", label: msg`Updates` },
  { icon: "Plug02", id: "plugins", label: msg`Installed plugins` },
  { icon: "Puzzle", id: "marketplaces", label: msg`Plugin marketplaces` },
  { icon: "Beaker", id: "experiments", label: msg`Experiments` },
  { icon: "MessageSquare", id: "community", label: msg`Community` },
  { icon: "Archive", id: "archived", label: msg`Archived threads` },
] as const satisfies readonly {
  icon: IconName;
  id: string;
  label: MessageDescriptor;
}[];

export type SettingsNavSection = (typeof SETTINGS_NAV_SECTIONS)[number];

export type SettingsSectionId = SettingsNavSection["id"];

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_NAV_SECTIONS.some((section) => section.id === value);
}

export function getSettingsSectionRoutePath(
  sectionId: SettingsSectionId,
): string {
  return sectionId === "general"
    ? SETTINGS_ROUTE_PATH
    : getSettingsRoutePath(sectionId);
}
