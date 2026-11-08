import { t as globalT } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useLingui as useLinguiSubscription } from "@lingui/react";
import { useState, type ReactNode } from "react";
import { Button } from "@bb/shared-ui/button";
import { Icon } from "@bb/shared-ui/icon";
import { cn } from "@bb/shared-ui/lib/utils";
import { Popover, PopoverTrigger } from "@bb/shared-ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@bb/shared-ui/tooltip";
import {
  SettingsSection,
  SettingsWithControl,
} from "@/components/ui/settings-section";
import {
  useAudioInputDevices,
  type AudioInputDeviceOption,
} from "@/hooks/useAudioInputDevices";
import {
  useAudioInputDevicePreferenceValue,
  type PreferredAudioInputDeviceId,
} from "@/lib/audio-input-device-preference";
import { MicrophonePreferencesSplit } from "@/components/promptbox/MicrophonePreferencesSplit";
import { MicrophonePreferencesPopoverContent } from "@/components/promptbox/MicrophonePreferencesPopoverContent";
import { SETTINGS_DROPDOWN_TRIGGER_CLASS } from "./settings-dropdown";

interface VoiceInputSettingsSectionContentProps {
  devices: readonly AudioInputDeviceOption[];
  errorMessage: string | null;
  isLoading: boolean;
  isSupported: boolean;
  onRefresh: (requestPermission: boolean) => void;
  preferredDeviceId: PreferredAudioInputDeviceId;
}

function selectedMicrophoneLabel({
  devices,
  isSupported,
  preferredDeviceId,
}: {
  devices: readonly AudioInputDeviceOption[];
  isSupported: boolean;
  preferredDeviceId: PreferredAudioInputDeviceId;
}): string {
  if (!isSupported) {
    return globalT`Unsupported`;
  }
  if (preferredDeviceId === null) {
    return globalT`System default`;
  }
  return (
    devices.find((device) => device.deviceId === preferredDeviceId)?.label ??
    globalT`System default`
  );
}

function microphoneSettingDescription({
  devices,
  errorMessage,
  isLoading,
  isSupported,
  preferredDeviceId,
  onRequestAccess,
}: {
  devices: readonly AudioInputDeviceOption[];
  onRequestAccess: () => void;
  errorMessage: string | null;
  isLoading: boolean;
  isSupported: boolean;
  preferredDeviceId: PreferredAudioInputDeviceId;
}): ReactNode {
  if (!isSupported) {
    return globalT`This browser does not expose microphone devices.`;
  }
  if (isLoading) {
    return globalT`Loading microphones.`;
  }
  if (errorMessage !== null) {
    return errorMessage;
  }
  if (devices.length === 0) {
    return (
      <Trans>
        <button
          type="button"
          className="rounded-sm underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={onRequestAccess}
        >
          Check microphone access
        </button>{" "}
        to see available devices.
      </Trans>
    );
  }
  if (
    preferredDeviceId !== null &&
    devices.every((device) => device.deviceId !== preferredDeviceId)
  ) {
    return globalT`Preferred microphone is disconnected. Using another input until it reconnects.`;
  }
  return globalT`Used for prompt voice input.`;
}

export function VoiceInputSettingsSectionContent({
  devices,
  errorMessage,
  isLoading,
  isSupported,
  onRefresh,
  preferredDeviceId,
}: VoiceInputSettingsSectionContentProps) {
  const { t } = useLingui();
  const microphoneLabel = t`Microphone`;
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const triggerLabel = selectedMicrophoneLabel({
    devices,
    isSupported,
    preferredDeviceId,
  });

  return (
    <SettingsSection
      title={t`Voice Input`}
      actionPlacement="inline"
      action={
        <Tooltip delayDuration={300} disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              disabled={!isSupported || isLoading}
              onClick={() => onRefresh(true)}
              aria-label={
                isLoading ? t`Loading microphones` : t`Load microphones`
              }
            >
              <Icon
                name="RotateCcw"
                className={cn("size-3.5", isLoading && "animate-spin")}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t`Load microphones`}</TooltipContent>
        </Tooltip>
      }
    >
      <SettingsWithControl
        label={microphoneLabel}
        description={microphoneSettingDescription({
          onRequestAccess: () => onRefresh(true),
          devices,
          errorMessage,
          isLoading,
          isSupported,
          preferredDeviceId,
        })}
      >
        <Popover
          open={preferencesOpen}
          onOpenChange={(open) => {
            setPreferencesOpen(open);
            onRefresh(false);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={SETTINGS_DROPDOWN_TRIGGER_CLASS}
              {...MicrophonePreferencesSplit.intentProps}
              aria-label={microphoneLabel}
              disabled={!isSupported}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon name="Mic" className="size-3.5 shrink-0" />
                <span className="min-w-0 truncate">{triggerLabel}</span>
              </span>
              <Icon
                name="ChevronDown"
                className="size-3.5 text-muted-foreground"
              />
            </Button>
          </PopoverTrigger>
          <MicrophonePreferencesPopoverContent
            open={preferencesOpen}
            onClose={() => setPreferencesOpen(false)}
            warning={null}
            align="end"
            side="bottom"
          />
        </Popover>
      </SettingsWithControl>
    </SettingsSection>
  );
}

export function VoiceInputSettingsSection() {
  useLinguiSubscription();
  const preferredDeviceId = useAudioInputDevicePreferenceValue();
  const { devices, errorMessage, isLoading, isSupported, refresh } =
    useAudioInputDevices();

  return (
    <VoiceInputSettingsSectionContent
      devices={devices}
      errorMessage={errorMessage}
      isLoading={isLoading}
      isSupported={isSupported}
      onRefresh={(requestPermission) => {
        void refresh({ requestPermission });
      }}
      preferredDeviceId={preferredDeviceId}
    />
  );
}
