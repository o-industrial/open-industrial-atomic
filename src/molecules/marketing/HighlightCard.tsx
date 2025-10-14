import { classSet, JSX } from '../../.deps.ts';

export type MarketingHighlightCardVariant = 'midnight' | 'onyx';

type VariantDecor = {
  base: string;
  content: string;
  title: string;
  prompt: string;
  body: string;
  iconWrap: string;
  topAccent?: string;
  eyebrow?: string;
};

const variantStyles: Record<MarketingHighlightCardVariant, VariantDecor> = {
  midnight: {
    base:
      'group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-left shadow-[0_30px_120px_-70px_rgba(236,72,153,0.55)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1',
    content: 'space-y-3 text-white',
    title: 'text-lg font-semibold text-white',
    prompt: 'mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-neon-purple-200',
    body: 'mt-3 text-sm text-white/70',
    iconWrap:
      'mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_18px_42px_-20px_rgba(236,72,153,0.6)]',
    topAccent: 'absolute inset-x-0 top-0 h-1 opacity-80',
    eyebrow: 'text-xs font-semibold tracking-[0.28em] text-white/70',
  },
  onyx: {
    base:
      'group relative overflow-hidden rounded-3xl border border-slate-700/50 bg-neutral-900/70 p-6 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:border-slate-500/60',
    content: 'space-y-3 text-slate-200',
    title: 'text-lg font-semibold text-white',
    prompt: 'mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200/75',
    body: 'text-sm leading-relaxed text-slate-300',
    iconWrap:
      'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-900 shadow-lg',
    topAccent: 'absolute inset-x-0 top-0 h-1 opacity-80',
    eyebrow: 'text-xs font-semibold tracking-[0.24em] text-slate-300/80',
  },
};

export type MarketingHighlightCardProps = {
  title: JSX.Element | string;
  description?: JSX.Element | string;
  prompt?: JSX.Element | string;
  eyebrow?: JSX.Element | string;
  icon?: JSX.Element;
  accentGradient?: string;
  variant?: MarketingHighlightCardVariant;
  topAccent?: boolean;
  iconClass?: string;
  bodyClass?: string;
  titleClass?: string;
  promptClass?: string;
  eyebrowClass?: string;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'icon'>;

export function MarketingHighlightCard({
  title,
  description,
  prompt,
  eyebrow,
  icon,
  accentGradient,
  variant = 'midnight',
  topAccent = true,
  iconClass,
  bodyClass,
  titleClass,
  promptClass,
  eyebrowClass,
  children,
  ...rest
}: MarketingHighlightCardProps): JSX.Element {
  const styles = variantStyles[variant];

  const accent = accentGradient ? `bg-gradient-to-r ${accentGradient}` : undefined;

  const iconAccent = accentGradient ? `bg-gradient-to-br ${accentGradient}` : undefined;

  return (
    <article
      {...rest}
      class={classSet([styles.base], rest)}
    >
      {topAccent && styles.topAccent && accent && (
        <div class={classSet([styles.topAccent, accent])} aria-hidden='true' />
      )}

      <div class={styles.content}>
        {icon && (
          <div class={classSet([styles.iconWrap, iconAccent, iconClass])}>
            {icon}
          </div>
        )}

        {eyebrow && (
          <span class={classSet([styles.eyebrow ?? '', eyebrowClass])}>
            {eyebrow}
          </span>
        )}

        <h3 class={classSet([styles.title, titleClass])}>
          {title}
        </h3>

        {prompt && (
          <p class={classSet([styles.prompt, promptClass])}>
            {prompt}
          </p>
        )}

        {description && (
          <p class={classSet([styles.body, bodyClass])}>
            {description}
          </p>
        )}

        {children}
      </div>
    </article>
  );
}

export default MarketingHighlightCard;
