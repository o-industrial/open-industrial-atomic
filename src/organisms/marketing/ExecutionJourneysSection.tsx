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

export type ExecutionJourneyCard = {
  icon: ComponentChildren;
  iconLabel?: string;
  title: ComponentChildren;
  subtitle: ComponentChildren;
  href: string;
};

export type ExecutionJourneysSectionProps = {
  header: SectionHeaderProps;
  journeys: ExecutionJourneyCard[];
  callout?: ComponentChildren | null;
  calloutIntent?: IntentTypes;
} & Omit<MarketingSectionShellProps, 'children'>;

export function ExecutionJourneysSection(
  props: ExecutionJourneysSectionProps,
): JSX.Element {
  const {
    header,
    journeys,
    callout = "Simulation isn't a toy. It is how your real runtime starts.",
    calloutIntent = IntentTypes.Secondary,
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

  return (
    <MarketingSectionShell
      {...shellProps}
      variant={variant}
      width={width}
      contentClass={combinedContentClass}
      class={className}
    >
      <SectionHeader {...header} align={header.align ?? 'center'} />

      <div class='grid w-full gap-6 text-left md:grid-cols-3'>
        {journeys.map((journey) => (
          <a
            key={journey.href}
            href={journey.href}
            class='group relative flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900/60 p-6 text-white shadow-lg transition hover:-translate-y-1 hover:border-neon-blue-400/60 hover:shadow-neon-blue-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-blue-400'
          >
            <span
              class='text-3xl'
              role={journey.iconLabel ? 'img' : undefined}
              aria-label={journey.iconLabel}
              aria-hidden={journey.iconLabel ? undefined : 'true'}
            >
              {journey.icon}
            </span>
            <div class='text-lg font-semibold'>{journey.title}</div>
            <p class='text-sm text-neutral-300'>{journey.subtitle}</p>
          </a>
        ))}
      </div>

      {callout === null ? null : (
        <SystemMindset intentType={calloutIntent}>
          {callout}
        </SystemMindset>
      )}
    </MarketingSectionShell>
  );
}
