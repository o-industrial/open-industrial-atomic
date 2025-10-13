import { JSX, useCallback, useEffect, useState } from '../../.deps.ts';
import {
  EaCBillingScopeMap,
  EaCCreateSubscriptionForm,
  EaCCreateSubscriptionFormProps,
} from '../../molecules/eac/create-subscription.form.tsx';

export type EaCCreateSubscriptionControllerProps =
  & Omit<
    EaCCreateSubscriptionFormProps,
    'billingScopes' | 'scopesLoading' | 'scopesError' | 'onRetryScopes'
  >
  & {
    scopesEndpoint?: string;
    transformScopes?: (scopes: unknown) => EaCBillingScopeMap;
  };

const defaultTransformScopes = (scopes: unknown): EaCBillingScopeMap => {
  if (scopes && typeof scopes === 'object') {
    return scopes as EaCBillingScopeMap;
  }

  return {};
};

export function EaCCreateSubscriptionController(
  props: EaCCreateSubscriptionControllerProps,
): JSX.Element {
  const {
    scopesEndpoint = '/workspace/api/azure/billing/scopes',
    transformScopes = defaultTransformScopes,
    ...rest
  } = props;

  const [billingScopes, setBillingScopes] = useState<EaCBillingScopeMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [scopesError, setScopesError] = useState<string | undefined>();

  const fetchBillingScopes = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setScopesError(undefined);

      try {
        const response = await fetch(scopesEndpoint, { signal });
        if (!response.ok) {
          throw new Error(`Failed to load billing scopes (${response.status})`);
        }

        const payload = await response.json();
        if (signal?.aborted) {
          return;
        }

        setBillingScopes(transformScopes(payload));
      } catch (err) {
        if (signal?.aborted) {
          return;
        }

        console.error(err);
        setBillingScopes({});
        setScopesError('Failed to load billing scopes');
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [scopesEndpoint, transformScopes],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchBillingScopes(abortController.signal);
    return () => abortController.abort();
  }, [fetchBillingScopes]);

  return (
    <EaCCreateSubscriptionForm
      {...rest}
      billingScopes={billingScopes}
      scopesLoading={isLoading}
      scopesError={scopesError}
      onRetryScopes={() => fetchBillingScopes()}
    />
  );
}

export default EaCCreateSubscriptionController;
