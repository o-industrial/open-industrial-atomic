import { ComponentChildren, JSX, useMemo } from '../../.deps.ts';

export type MarketingPageFrameVariant = 'default' | 'aurora' | 'midnight';

export type MarketingPageFrameProps = {
  children: ComponentChildren;
  variant?: MarketingPageFrameVariant;
  overlays?: string[];
  disableOverlays?: boolean;
  contentClass?: string;
  mainProps?: JSX.HTMLAttributes<HTMLElement>;
} & JSX.HTMLAttributes<HTMLDivElement>;

const variantBackgrounds: Record<MarketingPageFrameVariant, string> = {
  default:
    'bg-gradient-to-b from-white via-neutral-50 to-neutral-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900',
  aurora:
    'bg-gradient-to-b from-white via-neutral-50 to-neutral-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900',
  midnight:
    'bg-gradient-to-b from-[#050816] via-[#090b1a] to-[#040613] text-white dark:from-[#040714] dark:via-[#050816] dark:to-[#02030a]',
};

const variantOverlays: Record<MarketingPageFrameVariant, string[]> = {
  default: [
    'absolute left-1/2 top-[-18%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.12),rgba(255,255,255,0)_70%)] blur-[160px] dark:bg-[radial-gradient(circle,_rgba(129,140,248,0.22),rgba(255,255,255,0)_70%)]',
    'absolute left-[-16%] top-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(45,212,191,0.12),rgba(255,255,255,0)_68%)] blur-[140px] dark:bg-[radial-gradient(circle,_rgba(34,211,238,0.25),rgba(6,8,18,0)_70%)]',
    'absolute right-[-20%] bottom-[-12%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,_rgba(244,114,182,0.14),rgba(255,255,255,0)_72%)] blur-[180px] dark:bg-[radial-gradient(circle,_rgba(168,85,247,0.3),rgba(9,10,24,0)_75%)]',
  ],
  aurora: [
    'absolute left-1/2 top-[-18%] h-[620px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.22),rgba(255,255,255,0)_72%)] opacity-60 blur-3xl dark:opacity-90',
    'absolute left-[-12%] top-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.16),rgba(255,255,255,0)_68%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(34,211,238,0.32),rgba(255,255,255,0)_70%)]',
    'absolute right-[-14%] bottom-[-8%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,_rgba(249,168,212,0.18),rgba(255,255,255,0)_72%)] blur-[140px] dark:bg-[radial-gradient(circle,_rgba(196,181,253,0.28),rgba(255,255,255,0)_75%)]',
  ],
  midnight: [
    'absolute left-[-8%] top-[-12%] h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.24),rgba(5,8,16,0)_74%)] blur-[160px] opacity-90',
    'absolute right-[-14%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.3),rgba(7,11,27,0)_72%)] blur-[160px] opacity-80',
  ],
};

export function MarketingPageFrame({
  children,
  variant = 'default',
  overlays,
  disableOverlays = false,
  contentClass = '',
  mainProps,
  class: className = '',
  ...rest
}: MarketingPageFrameProps): JSX.Element {
  const mergedOverlays = disableOverlays ? [] : overlays ?? variantOverlays[variant];
  const {
    id: mainIdProp,
    role: mainRoleProp,
    class: mainClassProp = '',
    ...restMainProps
  } = mainProps ?? {};

  const mainId = useMemo(
    () => mainIdProp ?? `marketing-page-frame-${Math.random().toString(36).slice(2, 9)}`,
    [mainIdProp],
  );

  return (
    <div
      {...rest}
      class={`relative flex min-h-screen flex-col overflow-hidden ${
        variantBackgrounds[variant]
      } ${className}`}
    >
      {mergedOverlays.length > 0 && (
        <div aria-hidden='true' class='pointer-events-none absolute inset-0'>
          {mergedOverlays.map((overlayClass, index) => <div key={index} class={overlayClass} />)}
        </div>
      )}

      <main
        id={mainId}
        role={mainRoleProp ?? 'main'}
        class={`relative z-10 flex flex-col ${contentClass} ${mainClassProp}`}
        tabIndex={-1}
        {...restMainProps}
      >
        {children}
      </main>
    </div>
  );
}
