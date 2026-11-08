import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";
import {
  getSettingsSectionRoutePath,
  type SettingsNavSection,
} from "@/components/settings/settings-sections";
import type { PluginSettingsEntry } from "@/components/settings/plugin-settings-entries";
import { getPluginConfigurationRoutePath } from "@/lib/route-paths";
import type { PaletteAction } from "./palette-action";

interface BuildSettingsPaletteActionsArgs {
  navigate: (path: string) => void;
  pluginEntries: readonly PluginSettingsEntry[];
  sections: readonly SettingsNavSection[];
  translate: (message: MessageDescriptor) => string;
}

export function buildSettingsPaletteActions(
  args: BuildSettingsPaletteActionsArgs,
): PaletteAction[] {
  return [
    ...args.sections.map((section) => {
      const label = args.translate(section.label);
      return {
        id: `settings:${section.id}`,
        bucket: "Settings" as const,
        group: "Settings",
        title: args.translate(msg`${label} settings`),
        shortcut: null,
        run: () => args.navigate(getSettingsSectionRoutePath(section.id)),
      };
    }),
    ...args.pluginEntries.map((plugin) => {
      const label = plugin.label;
      return {
        id: `settings:plugin:${plugin.id}`,
        bucket: "Settings" as const,
        group: "Plugin settings",
        title: args.translate(msg`${label} settings`),
        shortcut: null,
        run: () =>
          args.navigate(
            getPluginConfigurationRoutePath({ pluginId: plugin.id }),
          ),
      };
    }),
  ];
}
