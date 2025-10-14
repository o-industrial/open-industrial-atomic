import { IS_BROWSER, MutableRef, useEffect, useRef } from '../../.deps.ts';

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
].join(',');

export interface UseFocusTrapOptions {
  active?: boolean;
  restoreFocus?: boolean;
}

export function useFocusTrap<T extends HTMLElement>({
  active = true,
  restoreFocus = true,
}: UseFocusTrapOptions = {}): MutableRef<T | null> {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!IS_BROWSER || !active) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const previousActive = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((el) => !el.hasAttribute('inert') && !el.getAttribute('aria-hidden'));

    const focusableElements = getFocusable();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const elements = getFocusable();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || document.activeElement === container) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus && previousActive && previousActive.focus) {
        previousActive.focus();
      }
    };
  }, [active, restoreFocus]);

  return containerRef;
}
