import { classSet, JSX, useCallback, useEffect, useMemo, useRef, useState } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';

export type MarketingNavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type MarketingNavCTA = MarketingNavLink & {
  intent?: 'primary' | 'secondary' | 'ghost';
};

export type MarketingNavMegaMenuGroup = {
  triggerHref: string;
  title: string;
  items: MarketingNavLink[];
};

export type MarketingNavigationProps = {
  links: MarketingNavLink[];
  ctas?: MarketingNavCTA[];
  currentPath?: string;
  megaMenuGroups?: MarketingNavMegaMenuGroup[];
} & JSX.HTMLAttributes<HTMLElement>;

function normalizePath(path: string): string {
  if (!path) {
    return '';
  }

  if (path === '/') {
    return '/';
  }

  return path.replace(/\/+$/, '') || '/';
}

function isActiveLink(href: string, currentPath?: string): boolean {
  if (!currentPath) {
    return false;
  }

  const normalizedHref = normalizePath(href);
  const normalizedCurrent = normalizePath(currentPath);

  return normalizedCurrent === normalizedHref ||
    normalizedCurrent.startsWith(`${normalizedHref}/`);
}

function mapIntent(intent?: MarketingNavCTA['intent']): ActionStyleTypes {
  switch (intent) {
    case 'secondary':
      return ActionStyleTypes.Outline | ActionStyleTypes.Rounded;
    case 'ghost':
      return ActionStyleTypes.Thin | ActionStyleTypes.Link;
    case 'primary':
    default:
      return ActionStyleTypes.Solid | ActionStyleTypes.Rounded;
  }
}

export function MarketingNavigation(props: MarketingNavigationProps): JSX.Element {
  const {
    links,
    ctas = [],
    currentPath,
    megaMenuGroups,
    ...rest
  } = props;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const groupsByHref = useMemo(() => {
    const map = new Map<string, MarketingNavMegaMenuGroup>();

    for (const group of megaMenuGroups ?? []) {
      const key = normalizePath(group.triggerHref);
      map.set(key, group);
    }

    return map;
  }, [megaMenuGroups]);

  const hoverTimeouts = useRef<Map<string, number>>(new Map());
  const containerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const buttonRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const itemRefs = useRef<Map<string, Array<HTMLAnchorElement | null>>>(new Map());

  useEffect(() => {
    return () => {
      hoverTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      hoverTimeouts.current.clear();
    };
  }, []);

  const clearHoverTimeout = useCallback((href: string) => {
    const key = normalizePath(href);
    const timeoutId = hoverTimeouts.current.get(key);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      hoverTimeouts.current.delete(key);
    }
  }, []);

  const openFlyout = useCallback((href: string) => {
    const key = normalizePath(href);
    clearHoverTimeout(key);
    setOpenGroup(key);
  }, [clearHoverTimeout]);

  const closeFlyout = useCallback((href: string) => {
    const key = normalizePath(href);
    clearHoverTimeout(key);
    setOpenGroup((current) => current === key ? null : current);
  }, [clearHoverTimeout]);

  const scheduleClose = useCallback((href: string) => {
    const key = normalizePath(href);
    clearHoverTimeout(key);
    const timeoutId = setTimeout(() => {
      setOpenGroup((current) => current === key ? null : current);
      hoverTimeouts.current.delete(key);
    }, 120);

    hoverTimeouts.current.set(key, timeoutId as unknown as number);
  }, [clearHoverTimeout]);

  const focusFirstItem = useCallback((href: string) => {
    const key = normalizePath(href);
    const items = itemRefs.current.get(key);
    if (!items?.length) {
      return;
    }

    const focusable = items.find((item) => item);
    focusable?.focus();
  }, []);

  const groupedHrefs = useMemo(() => {
    const set = new Set<string>();
    groupsByHref.forEach((_value, key) => set.add(key));
    return set;
  }, [groupsByHref]);

  const otherLinks = useMemo(
    () => links.filter((link) => !groupedHrefs.has(normalizePath(link.href))),
    [links, groupedHrefs],
  );

  const mobileGroups = useMemo(
    () => (megaMenuGroups ?? []).filter((group) => group.items.length > 0),
    [megaMenuGroups],
  );

  const toggleMobile = () => setMobileOpen((open) => !open);
  const closeMobile = () => setMobileOpen(false);

  const renderSimpleLink = (link: MarketingNavLink) => {
    const active = isActiveLink(link.href, currentPath);

    return (
      <a
        key={link.href}
        href={link.href}
        target={link.external ? '_blank' : undefined}
        rel={link.external ? 'noopener noreferrer' : undefined}
        class={classSet([
          'text-sm font-medium transition-colors',
          active
            ? 'text-neutral-900 dark:text-white'
            : 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white',
        ])}
      >
        {link.label}
      </a>
    );
  };

  return (
    <nav
      {...rest}
      class={classSet(['relative flex items-center gap-4'], rest)}
    >
      <div class='hidden items-center gap-8 md:flex'>
        {links.map((link, index) => {
          const linkKey = normalizePath(link.href);
          const group = groupsByHref.get(linkKey);
          if (!group) {
            return renderSimpleLink(link);
          }

          const isOpen = openGroup === linkKey;
          const isHighlighted = group.items.some((item) => isActiveLink(item.href, currentPath)) ||
            isActiveLink(link.href, currentPath);

          const menuId = `marketing-nav-menu-${index}`;

          const existingRefs = itemRefs.current.get(linkKey) ?? [];
          existingRefs.length = group.items.length;
          itemRefs.current.set(linkKey, existingRefs);

          const handleButtonKeyDown = (
            event: JSX.TargetedKeyboardEvent<HTMLButtonElement>,
          ) => {
            switch (event.key) {
              case 'Enter':
              case ' ': {
                event.preventDefault();
                if (isOpen) {
                  closeFlyout(linkKey);
                } else {
                  openFlyout(linkKey);
                  focusFirstItem(linkKey);
                }
                break;
              }
              case 'ArrowDown': {
                event.preventDefault();
                openFlyout(linkKey);
                focusFirstItem(linkKey);
                break;
              }
              case 'Escape': {
                event.preventDefault();
                closeFlyout(linkKey);
                buttonRefs.current.get(linkKey)?.focus();
                break;
              }
              default:
                break;
            }
          };

          const handleBlurCapture = (
            event: JSX.TargetedFocusEvent<HTMLElement>,
          ) => {
            const next = event.relatedTarget as HTMLElement | null;
            if (!next) {
              return;
            }

            const container = containerRefs.current.get(linkKey);
            const menu = menuRefs.current.get(linkKey);

            if (container?.contains(next) || menu?.contains(next)) {
              return;
            }

            closeFlyout(linkKey);
          };

          return (
            <div
              key={link.href}
              ref={(node) => containerRefs.current.set(linkKey, node)}
              class='relative'
              onMouseEnter={() => openFlyout(linkKey)}
              onMouseLeave={() => scheduleClose(linkKey)}
              onBlurCapture={handleBlurCapture}
            >
              <button
                ref={(node) => buttonRefs.current.set(linkKey, node)}
                type='button'
                class={classSet([
                  'inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950',
                  isHighlighted
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white',
                ])}
                aria-haspopup='menu'
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={(event) => {
                  event.preventDefault();
                  if (isOpen) {
                    closeFlyout(linkKey);
                  } else {
                    openFlyout(linkKey);
                    focusFirstItem(linkKey);
                  }
                }}
                onKeyDown={handleButtonKeyDown}
                onFocus={() => openFlyout(linkKey)}
              >
                {link.label}
                <svg
                  class={classSet([
                    'h-2.5 w-2.5 transition-transform duration-150',
                    isOpen ? 'rotate-180' : 'rotate-0',
                  ])}
                  viewBox='0 0 10 6'
                  aria-hidden='true'
                  focusable='false'
                >
                  <path
                    d='M1 1l4 4 4-4'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='1.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  />
                </svg>
              </button>

              <div
                ref={(node) => menuRefs.current.set(linkKey, node)}
                id={menuId}
                role='menu'
                aria-label={group.title}
                class={classSet([
                  'absolute left-0 top-full z-40 mt-4 w-80 rounded-3xl border border-neutral-200/70 bg-white/95 p-4 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.35)] backdrop-blur-lg transition-all duration-150 dark:border-white/10 dark:bg-neutral-900/95 dark:shadow-[0_40px_160px_-80px_rgba(129,140,248,0.45)]',
                  isOpen
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0',
                ])}
                onMouseEnter={() => openFlyout(linkKey)}
                onMouseLeave={() => scheduleClose(linkKey)}
                onBlurCapture={handleBlurCapture}
              >
                <div class='flex flex-col gap-1'>
                  {group.items.map((item, itemIndex) => {
                    const active = isActiveLink(item.href, currentPath);

                    return (
                      <a
                        key={item.href}
                        ref={(anchor) => {
                          const refs = itemRefs.current.get(linkKey) ?? [];
                          refs[itemIndex] = anchor;
                          itemRefs.current.set(linkKey, refs);
                        }}
                        href={item.href}
                        class={classSet([
                          'flex flex-col gap-0.5 rounded-2xl border border-transparent px-4 py-3 text-left transition-colors',
                          active
                            ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                            : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white',
                        ])}
                        onClick={() => closeFlyout(linkKey)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            closeFlyout(linkKey);
                            buttonRefs.current.get(linkKey)?.focus();
                          }
                        }}
                        onBlur={handleBlurCapture}
                      >
                        <span class='text-sm font-medium'>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div class='hidden items-center gap-3 md:flex'>
        {ctas.map((cta) => (
          <Action
            key={cta.href}
            href={cta.href}
            styleType={mapIntent(cta.intent)}
            target={cta.external ? '_blank' : undefined}
            rel={cta.external ? 'noopener noreferrer' : undefined}
          >
            {cta.label}
          </Action>
        ))}
      </div>

      <div class='md:hidden ml-auto'>
        <button
          type='button'
          onClick={toggleMobile}
          class='flex items-center gap-2 rounded-full border border-neutral-300/60 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:text-neutral-200 dark:focus-visible:ring-offset-neutral-950'
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-label='Toggle navigation menu'
        >
          <span class='flex flex-col gap-1'>
            <span class='block h-0.5 w-5 rounded-full bg-current' />
            <span class='block h-0.5 w-5 rounded-full bg-current' />
            <span class='block h-0.5 w-5 rounded-full bg-current' />
          </span>
          <span>Menu</span>
        </button>
      </div>

      {mobileOpen
        ? (
          <div class='absolute left-0 top-full z-40 mt-3 w-full rounded-3xl border border-neutral-200 bg-white/95 p-5 shadow-[0_35px_160px_-90px_rgba(15,23,42,0.45)] backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/95 dark:shadow-[0_45px_200px_-110px_rgba(129,140,248,0.55)] md:hidden'>
            <div class='flex flex-col gap-6'>
              {mobileGroups.map((group) => (
                <div key={group.triggerHref} class='flex flex-col gap-2'>
                  <span class='text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400'>
                    {group.title}
                  </span>
                  <div class='flex flex-col gap-1.5'>
                    {group.items.map((item) => {
                      const active = isActiveLink(item.href, currentPath);

                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          class={classSet([
                            'rounded-2xl px-3 py-2 text-sm transition-colors',
                            active
                              ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                              : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white',
                          ])}
                          onClick={closeMobile}
                        >
                          {item.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}

              {otherLinks.length
                ? (
                  <div class='flex flex-col gap-2'>
                    <span class='text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400'>
                      Navigate
                    </span>
                    <div class='flex flex-col gap-1.5'>
                      {otherLinks.map((link) => {
                        const active = isActiveLink(link.href, currentPath);

                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                            class={classSet([
                              'rounded-2xl px-3 py-2 text-sm transition-colors',
                              active
                                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white',
                            ])}
                            onClick={closeMobile}
                          >
                            {link.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )
                : null}

              {ctas.length
                ? (
                  <div class='flex flex-col gap-2'>
                    {ctas.map((cta) => (
                      <Action
                        key={`mobile-cta-${cta.href}`}
                        href={cta.href}
                        onClick={closeMobile}
                        styleType={mapIntent(cta.intent)}
                        target={cta.external ? '_blank' : undefined}
                        rel={cta.external ? 'noopener noreferrer' : undefined}
                        class='w-full justify-center'
                      >
                        {cta.label}
                      </Action>
                    ))}
                  </div>
                )
                : null}
            </div>
          </div>
        )
        : null}
    </nav>
  );
}
