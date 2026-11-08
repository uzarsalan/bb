import { t as globalT } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import type { SystemCliCommandStatus } from "@bb/server-contract";
import { Button } from "@bb/shared-ui/button";
import {
  SettingsSection,
  SettingsWithControl,
} from "@/components/ui/settings-section";
import { useChangeCliCommand } from "@/hooks/mutations/settings-mutations";
import { useCliCommandStatus } from "@/hooks/queries/system-queries";

const CLI_COMMAND_SETTING_LABEL = "bb CLI";

interface CliCommandSettingsSectionContentProps {
  onChange: (change: "install" | "remove") => void;
  pending: boolean;
  status: SystemCliCommandStatus;
}

export function describeCliCommandStatus(
  status: SystemCliCommandStatus,
): string {
  if (status.installedPath !== null) {
    return status.onPath
      ? globalT`Installed at ${status.installedPath}. You can control bb from any terminal, and so can agents outside bb, such as Claude Code or Codex.`
      : globalT`Installed at ${status.installedPath}, but its folder is not on your PATH. Add the folder to your PATH to use bb outside bb.`;
  }
  if (status.shadowedBy === null) {
    return globalT`Install the bb CLI for use outside bb. You can control bb from any terminal, and so can agents outside bb, such as Claude Code or Codex. Threads in bb already have it.`;
  }
  if (status.shadowedBy.source === "npm") {
    return globalT`Already installed for use outside bb at ${status.shadowedBy.path}, by npm.`;
  }
  if (status.shadowedBy.source === "machine") {
    return globalT`Already installed for use outside bb at ${status.shadowedBy.path}, with the bb machine on this computer.`;
  }
  return globalT`Another bb at ${status.shadowedBy.path} comes first on your PATH. Remove it to install this one.`;
}

export function CliCommandSettingsSectionContent({
  onChange,
  pending,
  status,
}: CliCommandSettingsSectionContentProps) {
  const { t } = useLingui();
  const installed = status.installedPath !== null;
  return (
    <SettingsSection title={t`Command line`}>
      <SettingsWithControl
        controlPlacement="trailing"
        label={CLI_COMMAND_SETTING_LABEL}
        {...(installed ? { labelBadge: t`Installed` } : {})}
        description={describeCliCommandStatus(status)}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || (!installed && status.shadowedBy !== null)}
          onClick={() => onChange(installed ? "remove" : "install")}
          aria-label={
            installed
              ? t`Remove ${CLI_COMMAND_SETTING_LABEL}`
              : t`Install ${CLI_COMMAND_SETTING_LABEL}`
          }
        >
          {installed ? t`Remove` : t`Install`}
        </Button>
      </SettingsWithControl>
    </SettingsSection>
  );
}

export function CliCommandSettingsSection() {
  const statusQuery = useCliCommandStatus();
  const changeCliCommand = useChangeCliCommand();
  const status = statusQuery.data;
  if (status === undefined || !status.supported) {
    return null;
  }

  return (
    <CliCommandSettingsSectionContent
      status={status}
      pending={changeCliCommand.isPending || statusQuery.isRefetching}
      onChange={(change) =>
        changeCliCommand.mutate(change, {
          onSettled: () => {
            void statusQuery.refetch();
          },
        })
      }
    />
  );
}
