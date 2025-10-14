import { Action } from '../../atoms/Action.tsx';
import { Input } from '../../atoms/forms/Input.tsx';
import { Select } from '../../atoms/forms/Select.tsx';
import { ToggleCheckbox } from '../../atoms/forms/ToggleCheckbox.tsx';
import { classSet, JSX, useEffect, useMemo, useState } from '../../.deps.ts';

export type EaCBillingScopeMap = Record<string, string>;

export type EaCCreateSubscriptionFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  entLookup?: string;
  cloudLookup?: string;
  billingScopes?: EaCBillingScopeMap;
  scopesLoading?: boolean;
  scopesError?: string;
  onRetryScopes?: () => void;
  initialScope?: string;
  initialName?: string;
  initialIsDev?: boolean;
};

export function EaCCreateSubscriptionForm(
  props: EaCCreateSubscriptionFormProps,
): JSX.Element {
  const {
    class: className,
    billingScopes = {},
    scopesLoading = false,
    scopesError,
    onRetryScopes,
    entLookup,
    cloudLookup,
    initialScope,
    initialName = '',
    initialIsDev = true,
    ...rest
  } = props as EaCCreateSubscriptionFormProps & { class?: string };

  const [name, setName] = useState(initialName);
  const [isDev, setIsDev] = useState(initialIsDev);
  const [selectedScope, setSelectedScope] = useState(initialScope ?? '');

  const sortedScopes = useMemo(() => {
    return Object.entries(billingScopes)
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [billingScopes]);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setIsDev(initialIsDev);
  }, [initialIsDev]);

  useEffect(() => {
    if (initialScope) {
      setSelectedScope(initialScope);
      return;
    }

    setSelectedScope((current) => {
      const hasCurrent = current && billingScopes[current] !== undefined;
      if (hasCurrent) {
        return current;
      }

      if (sortedScopes.length) {
        return sortedScopes[0].id;
      }

      return '';
    });
  }, [billingScopes, sortedScopes, initialScope]);

  return (
    <form
      method='post'
      action='/workspace/api/o-industrial/eac/clouds'
      {...rest}
      class={classSet([
        'w-full max-w-sm md:max-w-md mx-auto py-3 mt-2 space-y-4',
        className ?? '',
      ], rest)}
    >
      <input id='entLookup' name='entLookup' type='hidden' value={entLookup} />
      <input id='cloudLookup' name='cloudLookup' type='hidden' value={cloudLookup} />
      <input id='billing-scope' name='billing-scope' type='hidden' value={selectedScope} />
      <input id='is-dev' name='is-dev' type='hidden' value={isDev ? 'true' : 'false'} />

      <div class='grid grid-cols-1 gap-4'>
        <div>
          <Input
            id='name'
            name='name'
            type='text'
            label='Subscription Name'
            value={name}
            required
            placeholder='Enter new subscription name'
            onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              setName((event.target as HTMLInputElement).value)}
          />
        </div>

        <div class='flex items-center gap-2'>
          <ToggleCheckbox
            title='Dev/Test Subscription'
            checked={isDev}
            onToggle={setIsDev}
          />
          <span class='text-xs text-neutral-300'>Dev/Test workload</span>
        </div>

        <div>
          <Select
            label='Billing Scope'
            value={selectedScope}
            disabled={scopesLoading || !!scopesError || sortedScopes.length === 0}
            onChange={(event) => setSelectedScope((event.target as HTMLSelectElement).value)}
          >
            <option value='' disabled>
              {scopesLoading ? 'Loading scopes...' : 'Choose a billing scope'}
            </option>
            {sortedScopes.map((scope) => (
              <option value={scope.id} key={scope.id}>{scope.label}</option>
            ))}
          </Select>

          <div class='mt-1 space-y-1 text-xs'>
            {scopesError
              ? (
                <p class='flex items-center gap-2 text-rose-300'>
                  <span>{scopesError}</span>
                  {onRetryScopes && (
                    <button
                      type='button'
                      class='underline decoration-dotted underline-offset-2 text-rose-200 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900'
                      onClick={onRetryScopes}
                    >
                      Retry
                    </button>
                  )}
                </p>
              )
              : null}
            {!scopesLoading && !scopesError && sortedScopes.length === 0 && (
              <p class='text-slate-300'>
                No billing scopes found. Verify your Azure account has access to billing profiles or
                invoice sections.
              </p>
            )}
          </div>
        </div>
      </div>

      <div class='flex justify-start pt-2'>
        <Action type='submit' disabled={!selectedScope || !name}>Create Subscription</Action>
      </div>
    </form>
  );
}

export default EaCCreateSubscriptionForm;
