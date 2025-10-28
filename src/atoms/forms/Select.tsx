import {
  classSet,
  ComponentChildren,
  ForwardedRef,
  forwardRef,
  FunctionalComponent,
  IntentTypes,
  JSX,
  Ref,
  toChildArray,
  useMemo,
  useState,
  type VNode,
} from '../../.deps.ts';

export type SelectProps = {
  label?: string;
  intentType?: IntentTypes;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  filterOption?: (option: SelectFilterOption, query: string) => boolean;
  onSearchChange?: (query: string) => void;
} & JSX.HTMLAttributes<HTMLSelectElement>;

export type SelectFilterOption = {
  element: JSX.Element;
  label: string;
  value: string;
};

function getIntentClasses(intent?: IntentTypes) {
  switch (intent) {
    case IntentTypes.Warning:
      return 'border-neon-yellow-400 focus:ring-neon-yellow-500';
    case IntentTypes.Error:
      return 'border-neon-red-400 focus:ring-neon-red-500';
    case IntentTypes.Info:
      return 'border-neon-cyan-400 focus:ring-neon-cyan-500';
    case IntentTypes.Secondary:
      return 'border-neon-indigo-400 focus:ring-neon-indigo-500';
    case IntentTypes.Tertiary:
      return 'border-neon-blue-500 focus:ring-neon-blue-500';
    case IntentTypes.Primary:
      return 'border-neon-violet-500 focus:ring-neon-violet-500';
    default:
      return 'border-neutral-600 focus:ring-neon-blue-500';
  }
}

type OptionVNodeProps = {
  value?: unknown;
  children?: ComponentChildren;
  disabled?: boolean;
  [key: string]: unknown;
};

type InternalSelectOption = {
  element: VNode<OptionVNodeProps>;
  label: string;
  value: string;
  labelLower: string;
  valueLower: string;
};

function isOptionVNode(
  node: ComponentChildren,
): node is VNode<OptionVNodeProps> {
  return typeof node === 'object' && node !== null &&
    (node as VNode<OptionVNodeProps>).type === 'option';
}

function optionLabelFromChildren(children: ComponentChildren | undefined) {
  if (children === undefined || children === null) return '';
  return toChildArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }
      return '';
    })
    .join(' ')
    .trim();
}

function normalizeValue(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map((item) => String(item));
  return [String(value)];
}

export const Select: FunctionalComponent<
  React.PropsWithoutRef<SelectProps> & {
    ref?: Ref<HTMLSelectElement> | undefined;
  }
> = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    intentType,
    disabled,
    children,
    searchable = false,
    searchPlaceholder,
    noResultsText = 'No options found',
    filterOption,
    onSearchChange,
    ...rest
  },
  ref: ForwardedRef<HTMLSelectElement>,
) {
  const baseClasses =
    'w-full px-2 py-1 rounded text-sm bg-neutral-700 text-white placeholder-slate-400 border focus:outline-none focus:ring-2';
  const intentClass = getIntentClasses(intentType);
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const [searchTerm, setSearchTerm] = useState('');
  const searchPlaceholderText = searchPlaceholder ?? 'Search options...';
  const selectValue = (rest as { value?: unknown }).value;
  const selectDefaultValue = (rest as { defaultValue?: unknown }).defaultValue;

  const normalizedOptions = useMemo<InternalSelectOption[]>(() => {
    if (!searchable) return [];

    return toChildArray(children)
      .filter(isOptionVNode)
      .map((option) => {
        const label = optionLabelFromChildren(option.props?.children);
        const value = option.props?.value !== undefined ? String(option.props.value) : label;
        return {
          element: option,
          label,
          value,
          labelLower: label.toLowerCase(),
          valueLower: value.toLowerCase(),
        };
      });
  }, [children, searchable]);

  const selectedValues = useMemo(() => {
    const values = new Set<string>();
    const currentValues = normalizeValue(selectValue);
    if (currentValues.length) {
      currentValues.forEach((val) => values.add(val));
    } else {
      normalizeValue(selectDefaultValue)
        .forEach((val) => values.add(val));
    }
    return values;
  }, [selectValue, selectDefaultValue]);

  const { filteredOptions, hasMatches } = useMemo(() => {
    if (!searchable) {
      return { filteredOptions: [] as InternalSelectOption[], hasMatches: true };
    }

    const rawQuery = searchTerm;
    const query = rawQuery.trim();
    if (!query) {
      return { filteredOptions: normalizedOptions, hasMatches: true };
    }

    const queryLower = query.toLowerCase();
    let matchCount = 0;

    const options = normalizedOptions.filter((option) => {
      if (selectedValues.has(option.value)) {
        return true;
      }

      let isMatch: boolean;
      if (filterOption) {
        isMatch = filterOption({
          element: option.element,
          label: option.label,
          value: option.value,
        }, rawQuery);
      } else {
        isMatch = option.labelLower.includes(queryLower) ||
          option.valueLower.includes(queryLower);
      }

      if (isMatch) {
        matchCount++;
      }

      return isMatch;
    });

    return { filteredOptions: options, hasMatches: matchCount > 0 };
  }, [
    filterOption,
    normalizedOptions,
    searchTerm,
    searchable,
    selectedValues,
  ]);

  const renderedOptions: ComponentChildren = searchable
    ? filteredOptions.map((option) => option.element)
    : children;

  const showNoResults = searchable && searchTerm.trim().length > 0 && !hasMatches;

  const handleSearchInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const nextTerm = (event.target as HTMLInputElement).value;
    setSearchTerm(nextTerm);
    onSearchChange?.(nextTerm);
  };

  return (
    <div class={classSet([`w-full`], rest)}>
      {label && (
        <label class='block text-xs font-semibold text-neutral-300 mb-1'>
          {label}
        </label>
      )}
      {searchable && (
        <input
          type='text'
          value={searchTerm}
          disabled={disabled}
          placeholder={searchPlaceholderText}
          onInput={handleSearchInput}
          aria-label={label ? `${label} search` : 'Search options'}
          class='w-full mb-2 px-2 py-1 rounded text-sm bg-neutral-800 text-white placeholder-slate-400 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neon-blue-500'
        />
      )}
      <select
        ref={ref}
        disabled={disabled}
        class={`${baseClasses} ${intentClass} ${disabledClass}`}
        {...rest}
      >
        {renderedOptions}
      </select>
      {showNoResults && <p class='mt-1 text-xs text-neutral-300'>{noResultsText}</p>}
    </div>
  );
});
