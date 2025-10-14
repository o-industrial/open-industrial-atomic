import { classSet, ComponentChildren, JSX } from '../../.deps.ts';

type HtmlIntrinsicElement = Extract<keyof JSX.IntrinsicElements, keyof HTMLElementTagNameMap>;

export type GlowPillSize = 'sm' | 'md';

export type GlowPillProps<T extends HtmlIntrinsicElement = 'span'> = {
  /**
   * Element tag to render. Defaults to `span`.
   */
  as?: T;
  children: ComponentChildren;
  /**
   * Applies uppercase tracking if true.
   */
  uppercase?: boolean;
  /**
   * Accent classes applied to the decorative dot.
   */
  accentDotClass?: string;
  /**
   * Override base background styling.
   */
  backgroundClass?: string;
  /**
   * Override border styling.
   */
  borderClass?: string;
  /**
   * Override text styling.
   */
  textClass?: string;
  /**
   * Override shadow styling.
   */
  shadowClass?: string;
  /**
   * Dot size modifier.
   */
  dotSize?: GlowPillSize;
  /**
   * Pill padding/typography size.
   */
  size?: GlowPillSize;
  /**
   * Override padding classes completely.
   */
  paddingClass?: string;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'children' | 'ref'>;

export function GlowPill<T extends HtmlIntrinsicElement = 'span'>(
  props: GlowPillProps<T>,
): JSX.Element {
  const {
    as,
    children,
    uppercase = false,
    accentDotClass,
    backgroundClass,
    borderClass,
    textClass,
    shadowClass,
    dotSize = 'sm',
    size = 'md',
    paddingClass,
    ...rest
  } = props;

  const Component = (as ?? ('span' as T)) as any;

  const padding = paddingClass ??
    (size === 'sm' ? 'px-3 py-1.5 text-xs font-semibold' : 'px-4 py-2 text-sm font-semibold');

  const baseClasses = [
    'inline-flex items-center gap-3 rounded-full backdrop-blur',
    padding,
    uppercase ? 'uppercase tracking-[0.28em]' : '',
    backgroundClass ??
      'bg-gradient-to-r from-white/95 via-white/85 to-white/70 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-900/75',
    borderClass ?? 'border border-white/35 dark:border-white/15',
    textClass ?? 'text-neutral-900 dark:text-white',
    shadowClass ?? 'shadow-[0_0_20px_rgba(129,140,248,0.35)]',
  ];

  const dotBase = dotSize === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  const { class: userClass, ...otherProps } = rest;
  const computedClass = classSet(baseClasses, { class: userClass });
  const elementProps = otherProps as Record<string, unknown>;

  return (
    <Component
      {...elementProps}
      class={computedClass}
    >
      {accentDotClass && (
        <span class={classSet(['rounded-full', dotBase, accentDotClass])} aria-hidden='true' />
      )}
      {children}
    </Component>
  );
}

export default GlowPill;
