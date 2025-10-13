import { ComponentChildren, JSX } from '../../.deps.ts';
import { SectionSurface, type SectionSurfaceTone } from '../../atoms/marketing/SectionSurface.tsx';

export type MarketingSectionShellVariant = 'neutral' | 'lavender' | 'midnight';

export type MarketingSectionShellProps = {
  children: ComponentChildren;
  variant?: MarketingSectionShellVariant;
  overlays?: string[];
  width?: NonNullable<Parameters<typeof SectionSurface>[0]['width']>;
  contentClass?: string;
  class?: string;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'children'>;

const variantContainerClass: Record<MarketingSectionShellVariant, string> = {
  neutral:
    'border border-neutral-200/70 bg-white shadow-[0_45px_140px_-110px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_60px_190px_-130px_rgba(15,23,42,0.55)]',
  lavender:
    'border border-white/10 bg-gradient-to-br from-[#f7f9ff] via-white to-[#f4efff] shadow-[0_45px_140px_-110px_rgba(129,140,248,0.22)] dark:border-white/10 dark:bg-gradient-to-br dark:from-[#080c1f] dark:via-[#111539] dark:to-[#060916] dark:shadow-[0_60px_190px_-130px_rgba(129,140,248,0.45)]',
  midnight:
    'border border-white/10 bg-gradient-to-br from-[#07091d] via-[#0d1230] to-[#050716] text-white shadow-[0_120px_280px_-160px_rgba(59,130,246,0.45)]',
};

const variantOverlayClass: Record<MarketingSectionShellVariant, string[]> = {
  neutral: [
    'absolute inset-0 bg-[radial-gradient(circle,_rgba(236,72,153,0.08),rgba(255,255,255,0)_74%)] opacity-70 blur-[150px] dark:bg-[radial-gradient(circle,_rgba(236,72,153,0.18),rgba(5,8,21,0)_76%)]',
  ],
  lavender: [
    'absolute inset-0 bg-[radial-gradient(circle,_rgba(129,140,248,0.14),rgba(255,255,255,0)_78%)] opacity-80 blur-[180px] dark:bg-[radial-gradient(circle,_rgba(129,140,248,0.32),rgba(6,8,22,0)_76%)]',
  ],
  midnight: [
    'absolute left-[-12%] top-[-18%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.32),rgba(5,8,18,0)_78%)] blur-[200px] opacity-80',
    'absolute right-[-16%] bottom-[-22%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.32),rgba(7,12,28,0)_78%)] blur-[210px] opacity-75',
  ],
};

export function MarketingSectionShell({
  children,
  variant = 'neutral',
  overlays,
  width = 'wide',
  contentClass = '',
  class: className = '',
  ...rest
}: MarketingSectionShellProps): JSX.Element {
  const overlayClasses = overlays ?? variantOverlayClass[variant];

  return (
    <SectionSurface
      tone={variant === 'midnight' ? 'emphasis' satisfies SectionSurfaceTone : 'default'}
      width={width}
      contentClass={`relative mx-auto flex w-full flex-col gap-10 px-6 py-20 ${contentClass}`}
      class={`relative overflow-hidden ${variantContainerClass[variant]} ${className}`}
      {...rest}
    >
      {overlayClasses.length > 0 && (
        <div aria-hidden='true' class='pointer-events-none absolute inset-0'>
          {overlayClasses.map((overlayClass, index) => <div key={index} class={overlayClass} />)}
        </div>
      )}

      <div class='relative z-10 flex w-full flex-col gap-10'>
        {children}
      </div>
    </SectionSurface>
  );
}
