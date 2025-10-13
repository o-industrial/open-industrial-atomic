import { ComponentChildren, IntentTypes, JSX } from '../../.deps.ts';
import {
  MarketingSectionShell,
  type MarketingSectionShellProps,
} from '../../molecules/marketing/SectionShell.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { SystemMindset } from '../../molecules/writing-devices/SystemMindset.tsx';
import { getIntentStyles } from '../../utils/getIntentStyles.ts';

export type NotADashboardSectionProps = {
  header: SectionHeaderProps;
  failureTitle?: ComponentChildren;
  failureItems?: ComponentChildren[];
  stabilityTitle?: ComponentChildren;
  stabilityItems?: ComponentChildren[];
  callout?: ComponentChildren | null;
  calloutIntent?: IntentTypes;
} & Omit<MarketingSectionShellProps, 'children'>;

export function NotADashboardSection(
  props: NotADashboardSectionProps,
): JSX.Element {
  const {
    header,
    failureTitle = 'What Breaks',
    failureItems = [
      'ETL pipelines collapse on schema drift',
      'Alert fatigue from shallow thresholds',
      'LLMs guess but cannot trace structure',
    ],
    stabilityTitle = 'What Holds',
    stabilityItems = [
      'Versioned schemas govern behavior',
      'Agents act only on structure match',
      'Execution persists even without insight tools',
    ],
    callout = 'You did not configure an integration. You promoted structure. The system responded.',
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
    'items-center text-center gap-10',
    contentClass,
  ].filter(Boolean).join(' ');

  const warningTextClass = getIntentStyles(IntentTypes.Warning).text;
  const tertiaryTextClass = getIntentStyles(IntentTypes.Tertiary).text;

  return (
    <MarketingSectionShell
      {...shellProps}
      variant={variant}
      width={width}
      contentClass={combinedContentClass}
      class={className}
    >
      <SectionHeader {...header} align={header.align ?? 'center'} />

      <div class='grid w-full gap-6 text-left md:grid-cols-2'>
        <div class='h-full rounded-xl border border-white/10 bg-neutral-900/50 p-6'>
          <h3 class={`text-lg font-semibold ${warningTextClass}`}>{failureTitle}</h3>
          <ul class='mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-300'>
            {failureItems.map((item, index) => <li key={`break-${index}`}>{item}</li>)}
          </ul>
        </div>

        <div class='h-full rounded-xl border border-white/20 bg-neutral-950/70 p-6 text-white'>
          <h3 class={`text-lg font-semibold ${tertiaryTextClass}`}>{stabilityTitle}</h3>
          <ul class='mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-200'>
            {stabilityItems.map((item, index) => <li key={`hold-${index}`}>{item}</li>)}
          </ul>
        </div>
      </div>

      {callout === null ? null : (
        <SystemMindset intentType={calloutIntent}>
          {callout}
        </SystemMindset>
      )}
    </MarketingSectionShell>
  );
}
