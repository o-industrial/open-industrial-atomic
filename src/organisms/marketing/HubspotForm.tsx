import { JSX, useEffect, useRef } from '../../.deps.ts';

export const IsIsland = true;

// deno-lint-ignore no-explicit-any
declare const hbspt: any;

type HubspotFormBaseEvent = {
  id: string;
  portalId: string;
  formId: string;
};

export type HubspotFormLifecycleEvent = HubspotFormBaseEvent & {
  attempts: number;
};

export type HubspotFormCreateEvent = HubspotFormLifecycleEvent & {
  options: Record<string, unknown>;
};

export type HubspotFormProps = {
  id?: string;
  portalId?: string;
  formId?: string;
  onInit?: (event: HubspotFormLifecycleEvent) => void;
  onCreate?: (event: HubspotFormCreateEvent) => void;
  onReady?: (event: HubspotFormLifecycleEvent) => void;
  onSubmit?: (event: HubspotFormLifecycleEvent) => void;
  onRetry?: (event: HubspotFormLifecycleEvent) => void;
  retryDelayMs?: number;
};

const DEFAULT_RETRY_DELAY = 100;

export function HubspotForm({
  id = 'hubspot-form',
  portalId = '2687377',
  formId = '560105cb-d75e-480b-9e1a-cdbd10172e56',
  onInit,
  onCreate,
  onReady,
  onSubmit,
  onRetry,
  retryDelayMs = DEFAULT_RETRY_DELAY,
}: HubspotFormProps): JSX.Element {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let retryHandle: number | null = null;
    let attempts = 0;

    const makeEvent = (): HubspotFormLifecycleEvent => ({
      id,
      portalId,
      formId,
      attempts,
    });

    const scheduleRetry = () => {
      if (cancelled) {
        return;
      }

      attempts += 1;
      onRetry?.(makeEvent());
      retryHandle = globalThis.setTimeout(waitForHbspt, retryDelayMs);
    };

    const waitForHbspt = () => {
      if (cancelled) {
        return;
      }

      if (typeof hbspt !== 'undefined' && typeof hbspt.forms?.create === 'function') {
        const options = {
          portalId,
          formId,
          region: 'na1',
          target: `#${id}`,
          onFormReady: () => {
            if (cancelled) return;
            onReady?.(makeEvent());
          },
          onFormSubmit: () => {
            if (cancelled) return;
            onSubmit?.(makeEvent());
          },
        };

        onCreate?.({
          ...makeEvent(),
          options,
        });

        hbspt.forms.create(options);
      } else {
        scheduleRetry();
      }
    };

    onInit?.(makeEvent());
    waitForHbspt();

    return () => {
      cancelled = true;
      if (retryHandle !== null) {
        globalThis.clearTimeout(retryHandle);
      }
    };
  }, [
    id,
    portalId,
    formId,
    onInit,
    onCreate,
    onReady,
    onSubmit,
    onRetry,
    retryDelayMs,
  ]);

  return <div ref={formRef} id={id} class='w-full max-w-xl mx-auto' />;
}
