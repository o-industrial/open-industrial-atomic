import { classSet, JSX } from '../.deps.ts';

type AdminCardPadding = 'none' | 'md' | 'lg';
type AdminCardGap = 'none' | 'tight' | 'base' | 'relaxed';
type AdminCardTone = 'default' | 'muted';
type AdminCardHover = 'none' | 'accent';

export type AdminCardProps = {
  /**
   * Optional padding preset for the card body.
   */
  padding?: AdminCardPadding;
  /**
   * Vertical spacing preset applied between direct children.
   * Ignored when `divided` is true.
   */
  gap?: AdminCardGap;
  /**
   * Controls background/border emphasis for the card surface.
   */
  tone?: AdminCardTone;
  /**
   * Enables hover states that are common in the admin grids.
   */
  hover?: AdminCardHover;
  /**
   * Renders child separation lines instead of gap spacing.
   */
  divided?: boolean;
  /**
   * Optional override when using dark divider surfaces.
   */
  dividerTone?: 'default' | 'muted';
} & JSX.HTMLAttributes<HTMLElement>;

const paddingMap: Record<AdminCardPadding, string> = {
  none: '',
  md: '-:-:p-4',
  lg: '-:-:p-6',
};

const gapMap: Record<AdminCardGap, string> = {
  none: '',
  tight: '-:-:space-y-2',
  base: '-:-:space-y-3',
  relaxed: '-:-:space-y-4',
};

const toneMap: Record<AdminCardTone, string> = {
  default: '-:-:border-neutral-800 -:-:bg-neutral-900/50',
  muted: '-:-:border-neutral-700 -:-:bg-neutral-900/60',
};

const hoverMap: Record<AdminCardHover, string> = {
  none: '',
  accent: '-:-:hover:-:-:border-neon-blue-500',
};

const dividerToneMap = {
  default: '-:-:divide-neutral-800',
  muted: '-:-:divide-neutral-700',
} as const;

export function AdminCard({
  padding = 'md',
  gap = 'base',
  tone = 'default',
  hover = 'accent',
  divided = false,
  dividerTone = 'default',
  children,
  ...rest
}: AdminCardProps): JSX.Element {
  const baseClasses = [
    '-:-:rounded-xl',
    '-:-:border',
    '-:-:transition-default',
    toneMap[tone],
    paddingMap[padding],
    hoverMap[hover],
  ];

  if (divided) {
    baseClasses.push(
      '-:-:divide-y',
      dividerToneMap[dividerTone],
    );
  } else {
    baseClasses.push(gapMap[gap]);
  }

  return (
    <article class={classSet(baseClasses, rest)} {...rest}>
      {children}
    </article>
  );
}

export default AdminCard;
