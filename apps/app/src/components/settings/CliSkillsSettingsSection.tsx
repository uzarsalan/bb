import { plural, t as globalT } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { useLingui as useLinguiSubscription } from "@lingui/react";
import { useMemo, useState } from "react";
import type { Host } from "@bb/domain";
import type {
  CliSkillMachineStatus,
  SystemCliSkillsStatusResponse,
  SystemInstallCliSkillsResponse,
} from "@bb/server-contract";
import { Button } from "@bb/shared-ui/button";
import {
  SettingsSection,
  SettingsWithControl,
} from "@/components/ui/settings-section";
import { appToast } from "@/components/ui/app-toast";
import { InstallCliSkillsDialog } from "@/components/settings/InstallCliSkillsDialog";
import { useInstallCliSkills } from "@/hooks/mutations/settings-mutations";
import { selectHosts, useHosts } from "@/hooks/queries/host-queries";
import { useCliSkillsStatus } from "@/hooks/queries/system-queries";

interface CliSkillsSettingsSectionContentProps {
  hasConnectedMachine: boolean;
  onOpenPicker: () => void;
  pending: boolean;
  statusBadge: string | null;
}

function installDescription(hasConnectedMachine: boolean): string {
  return hasConnectedMachine
    ? globalT`Install them into ~/.agents/skills and ~/.claude/skills so agents outside bb can use the bb CLI.`
    : globalT`Connect a machine to install them into ~/.agents/skills and ~/.claude/skills.`;
}

export function summarizeMachineStatuses(
  statuses: readonly CliSkillMachineStatus[],
): string | null {
  const known = statuses.filter((status) => status !== "unknown");
  if (known.length === 0) return null;
  const installed = known.filter((status) => status === "installed").length;
  if (installed === known.length) {
    return known.length > 1
      ? plural(known.length, {
          one: "Installed on # machine",
          other: "Installed on # machines",
        })
      : globalT`Installed`;
  }
  if (installed > 0) {
    return globalT`Installed on ${installed} of ${known.length} machines`;
  }
  return known.some((status) => status === "outdated")
    ? globalT`Out of date`
    : globalT`Not installed`;
}

export function CliSkillsSettingsSectionContent({
  hasConnectedMachine,
  onOpenPicker,
  pending,
  statusBadge,
}: CliSkillsSettingsSectionContentProps) {
  const { t } = useLingui();
  const settingLabel = t`bb CLI skills`;
  return (
    <SettingsSection title={t`Skills`}>
      <SettingsWithControl
        controlPlacement="trailing"
        label={settingLabel}
        {...(statusBadge === null ? {} : { labelBadge: statusBadge })}
        description={installDescription(hasConnectedMachine)}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasConnectedMachine || pending}
          onClick={onOpenPicker}
          aria-label={t`Install ${settingLabel}`}
        >
          {pending ? t`Installing…` : t`Install`}
        </Button>
      </SettingsWithControl>
    </SettingsSection>
  );
}

function reportInstallResults(result: SystemInstallCliSkillsResponse): void {
  const hostNames = (entries: typeof result.results) =>
    entries.map((entry) => entry.hostName).join(", ");
  const installed = result.results.filter((entry) => entry.ok);
  const failed = result.results.filter((entry) => !entry.ok);
  if (installed.length > 0) {
    appToast.success(
      globalT`Installed the bb CLI skills on ${hostNames(installed)}`,
    );
  }
  for (const entry of failed) {
    appToast.error(`${entry.hostName}: ${entry.errorMessage}`);
  }
}

function statusByHostId(
  status: SystemCliSkillsStatusResponse | undefined,
): ReadonlyMap<string, CliSkillMachineStatus> {
  return new Map(
    (status?.machines ?? []).map((machine) => [machine.hostId, machine.status]),
  );
}

export function CliSkillsSettingsSection() {
  useLinguiSubscription();
  const hostsQuery = useHosts();
  const statusQuery = useCliSkillsStatus();
  const installCliSkills = useInstallCliSkills();
  const [pickerOpen, setPickerOpen] = useState(false);
  const hosts: readonly Host[] = useMemo(
    () => selectHosts(hostsQuery.data, "persistent"),
    [hostsQuery.data],
  );
  const statuses = statusByHostId(statusQuery.data);

  return (
    <>
      <CliSkillsSettingsSectionContent
        hasConnectedMachine={hosts.some((host) => host.status === "connected")}
        pending={installCliSkills.isPending}
        statusBadge={summarizeMachineStatuses([...statuses.values()])}
        onOpenPicker={() => setPickerOpen(true)}
      />
      <InstallCliSkillsDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        hosts={hosts}
        statusByHostId={statuses}
        pending={installCliSkills.isPending}
        onCancel={() => setPickerOpen(false)}
        onInstall={(hostIds) =>
          installCliSkills.mutate(
            { hostIds },
            {
              onSuccess: (result) => {
                setPickerOpen(false);
                reportInstallResults(result);
                void statusQuery.refetch();
              },
            },
          )
        }
      />
    </>
  );
}
