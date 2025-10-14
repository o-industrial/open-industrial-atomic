import { ComponentChildren, IntentTypes, JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';
import {
  MarketingSectionShell,
  type MarketingSectionShellProps,
} from '../../molecules/marketing/SectionShell.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { AziInnerVoice } from '../../molecules/writing-devices/AziInnerVoice.tsx';

export type CtaActionConfig = {
  label: ComponentChildren;
  href: string;
  intentType?: IntentTypes;
  styleType?: ActionStyleTypes;
};

export type FinalCtaSectionProps = {
  header: SectionHeaderProps;
  primaryAction: CtaActionConfig;
  secondaryAction?: CtaActionConfig;
  snippet?: string;
  callout?: ComponentChildren | null;
  calloutIntent?: IntentTypes;
} & Omit<MarketingSectionShellProps, 'children'>;

export function FinalCtaSection(props: FinalCtaSectionProps): JSX.Element {
  const {
    header,
    primaryAction,
    secondaryAction,
    snippet = '$ openindustrial deploy --no-azi',
    callout = 'This is not a product tour. It is your system, waiting to be remembered.',
    calloutIntent = IntentTypes.Tertiary,
    ...shell
  } = props;

  const {
    variant = 'midnight',
    width = 'wide',
    contentClass,
    class: className,
    ...shellProps
  } = shell;

  const combinedContentClass = [
    'items-center text-center gap-8',
    contentClass,
  ].filter(Boolean).join(' ');

  const {
    intentType: primaryIntent = IntentTypes.Primary,
    styleType: primaryStyle = ActionStyleTypes.Solid |
      ActionStyleTypes.Rounded |
      ActionStyleTypes.Fat,
    label: primaryLabel,
    href: primaryHref,
  } = primaryAction;

  const secondary = secondaryAction
    ? {
      intentType: secondaryAction.intentType ?? IntentTypes.None,
      styleType: secondaryAction.styleType ??
        (ActionStyleTypes.Outline | ActionStyleTypes.Rounded | ActionStyleTypes.Fat),
      label: secondaryAction.label,
      href: secondaryAction.href,
    }
    : null;

  return (
    <MarketingSectionShell
      {...shellProps}
      variant={variant}
      width={width}
      contentClass={combinedContentClass}
      class={className}
    >
      <SectionHeader {...header} align={header.align ?? 'center'} />

      <div class='flex w-full flex-col items-center justify-center gap-4 sm:flex-row'>
        <Action
          href={primaryHref}
          intentType={primaryIntent}
          styleType={primaryStyle}
        >
          {primaryLabel}
        </Action>

        {secondary
          ? (
            <Action
              href={secondary.href}
              intentType={secondary.intentType}
              styleType={secondary.styleType}
            >
              {secondary.label}
            </Action>
          )
          : null}
      </div>

      <code class='rounded-md bg-neutral-800/70 px-4 py-2 font-mono text-sm tracking-widest text-white shadow-inner'>
        {snippet}
      </code>

      {callout === null ? null : (
        <AziInnerVoice intentType={calloutIntent}>
          {callout}
        </AziInnerVoice>
      )}
    </MarketingSectionShell>
  );
}
