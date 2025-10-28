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
  useEffect,
  useMemo,
  useRef,
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
  const {
    class: customClass,
    onChange: originalOnChange,
    ...selectProps
  } = rest as JSX.HTMLAttributes<HTMLSelectElement> & {
    class?: string;
    onChange?: JSX.GenericEventHandler<HTMLSelectElement>;
  };

  const baseClasses =
    'w-full px-2 py-1 rounded text-sm bg-neutral-700 text-white placeholder-slate-400 border focus:outline-none focus:ring-2';
  const intentClass = getIntentClasses(intentType);
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchPlaceholderText = searchPlaceholder ?? 'Search options...';
  const selectValue = (selectProps as { value?: unknown }).value;
  const selectDefaultValue = (selectProps as { defaultValue?: unknown }).defaultValue;
  const wrapperClass = classSet(['w-full'], { class: customClass });
  const visibleClasses = classSet([baseClasses, intentClass, disabledClass], {
    class: customClass,
  });
  const selectId = (selectProps as { id?: string }).id;
  const fallbackId = useMemo(() => {
    if (selectId) return undefined;
    const random = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    return `select-${random}`;
  }, [selectId]);
  const comboboxId = selectId ?? fallbackId;
  const listboxId = comboboxId ? `${comboboxId}-options` : undefined;
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isMultiple = Boolean((selectProps as { multiple?: boolean }).multiple);

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
      const isDisabled = Boolean(option.element.props?.disabled);
      const isSelectedOption = selectedValues.has(option.value);
      if (isDisabled && queryLower.length > 0) {
        return false;
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

      if (isMatch || isSelectedOption) {
        return true;
      }

      return false;
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
  const derivedLabel = useMemo(() => {
    if (!searchable || !normalizedOptions.length) {
      return '';
    }
    const candidateValues = normalizeValue(selectValue);
    const fallbackValues = normalizeValue(selectDefaultValue);
    const lookup = candidateValues.length ? candidateValues : fallbackValues;
    for (const option of normalizedOptions) {
      if (lookup.includes(option.value)) {
        return option.label;
      }
    }
    const selectedAttribute = normalizedOptions.find((option) => option.element.props?.selected);
    return selectedAttribute?.label ?? '';
  }, [normalizedOptions, searchable, selectDefaultValue, selectValue]);
  const [selectionLabel, setSelectionLabel] = useState(() => derivedLabel);

  useEffect(() => {
    const isControlled = selectValue !== undefined;
    if (isControlled) {
      if (selectionLabel !== derivedLabel) {
        setSelectionLabel(derivedLabel);
      }
      return;
    }

    if (!selectionLabel && derivedLabel) {
      setSelectionLabel(derivedLabel);
    }
  }, [derivedLabel, selectValue, selectionLabel]);

  const handleSearchInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const nextTerm = (event.target as HTMLInputElement).value;
    setSearchTerm(nextTerm);
    setIsOpen(true);
    setIsSearchFocused(true);
    onSearchChange?.(nextTerm);
  };

  const handleSelectChange = (event: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
    const target = event.currentTarget;
    if (target.multiple) {
      const labels = Array.from(target.selectedOptions ?? []).map((option) => option.text);
      setSelectionLabel(labels.join(', '));
    } else {
      const option = (target.selectedOptions && target.selectedOptions[0]) ??
        target.options[target.selectedIndex];
      setSelectionLabel(option ? option.text : '');
    }
    setSearchTerm('');
    onSearchChange?.('');
    setHighlightedIndex(-1);
    setIsOpen(target.multiple);
    if (!target.multiple) {
      setIsSearchFocused(false);
      queueMicrotask(() => inputRef.current?.blur());
    } else {
      setIsSearchFocused(true);
    }
    originalOnChange?.(event);
  };

  const assignSelectRef = (node: HTMLSelectElement | null) => {
    selectRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
    }
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsSearchFocused(true);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setIsSearchFocused(false);
  };

  const handleInputKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((current) => {
        if (!filteredOptions.length) return -1;
        const next = current < filteredOptions.length - 1
          ? current + 1
          : filteredOptions.length - 1;
        return next < 0 ? 0 : next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setHighlightedIndex((current) => {
        if (!filteredOptions.length) return -1;
        const next = current > 0 ? current - 1 : 0;
        return next;
      });
    } else if (event.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        event.preventDefault();
        handleOptionSelect(filteredOptions[highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setIsSearchFocused(false);
      if (searchTerm) {
        setSearchTerm('');
        onSearchChange?.('');
      }
      inputRef.current?.blur();
    } else if (event.key === 'Tab') {
      setIsOpen(false);
      setIsSearchFocused(false);
    } else {
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  const handleOptionSelect = (option: InternalSelectOption) => {
    const element = selectRef.current;
    if (!element) return;
    if (element.multiple) {
      const domOption = Array.from(element.options).find((opt) => opt.value === option.value);
      if (domOption) {
        domOption.selected = !domOption.selected;
      }
    } else {
      element.value = option.value;
    }
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
    if (!element.multiple) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setIsSearchFocused(true);
    }
    setSearchTerm('');
    onSearchChange?.('');
  };

  useEffect(() => {
    if (!searchable || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && wrapperRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
      setIsSearchFocused(false);
      if (searchTerm) {
        setSearchTerm('');
        onSearchChange?.('');
      }
    };

    globalThis.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => globalThis.removeEventListener('mousedown', handleClickOutside as EventListener);
  }, [isOpen, onSearchChange, searchTerm, searchable]);

  useEffect(() => {
    if (!searchable || !isOpen) {
      setHighlightedIndex(-1);
      return;
    }

    if (!filteredOptions.length) {
      setHighlightedIndex(-1);
      return;
    }

    const selectedIndex = filteredOptions.findIndex((option) => selectedValues.has(option.value));
    if (selectedIndex >= 0) {
      setHighlightedIndex(selectedIndex);
    } else {
      setHighlightedIndex(0);
    }
  }, [filteredOptions, isOpen, searchable, selectedValues]);

  const inputDisplayValue = isSearchFocused ? searchTerm : selectionLabel;
  const inputPlaceholder = isSearchFocused || selectionLabel === ''
    ? searchPlaceholderText
    : selectionLabel;
  const fallbackOptionIdBase = comboboxId ?? 'select';
  const activeOptionId = highlightedIndex >= 0
    ? listboxId
      ? `${listboxId}-option-${highlightedIndex}`
      : `${fallbackOptionIdBase}-option-${highlightedIndex}`
    : undefined;

  const optionItems = filteredOptions.length
    ? filteredOptions.map((option, index) => {
      const isHighlighted = index === highlightedIndex;
      const isSelected = selectedValues.has(option.value);
      const isDisabledOption = Boolean(option.element.props?.disabled);
      const optionId = listboxId
        ? `${listboxId}-option-${index}`
        : `${fallbackOptionIdBase}-option-${index}`;
      const optionClasses = classSet([
        'block w-full px-3 py-2 text-left transition-colors',
        isDisabledOption
          ? 'cursor-not-allowed text-neutral-500'
          : isHighlighted
          ? 'bg-neutral-700 text-white'
          : 'text-neutral-100',
        !isDisabledOption && isSelected ? 'font-semibold text-neon-blue-200' : '',
      ]);

      return (
        <button
          key={`${option.value}-${index}`}
          id={optionId}
          type='button'
          role='option'
          aria-selected={isSelected}
          aria-disabled={isDisabledOption || undefined}
          disabled={isDisabledOption}
          class={optionClasses}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={!isDisabledOption ? () => setHighlightedIndex(index) : undefined}
          onClick={!isDisabledOption ? () => handleOptionSelect(option) : undefined}
          tabIndex={-1}
        >
          {option.label}
        </button>
      );
    })
    : (
      <div class='px-3 py-2 text-neutral-300'>
        {noResultsText}
      </div>
    );

  const listboxBaseClasses =
    'overflow-y-auto rounded border border-neutral-700 bg-neutral-900 text-sm text-neutral-100 shadow-xl';

  return (
    <div ref={wrapperRef} class={wrapperClass}>
      {label && (
        <label class='block text-xs font-semibold text-neutral-300 mb-1'>
          {label}
        </label>
      )}
      {searchable
        ? (
          <div class='relative w-full'>
            <input
              ref={inputRef}
              type='text'
              value={inputDisplayValue}
              disabled={disabled}
              placeholder={inputPlaceholder}
              onInput={handleSearchInput}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              onClick={() => {
                if (disabled) return;
                setIsOpen(true);
              }}
              role='combobox'
              aria-autocomplete='list'
              aria-expanded={isOpen}
              aria-haspopup='listbox'
              aria-controls={listboxId}
              aria-activedescendant={isOpen ? activeOptionId : undefined}
              aria-label={label ? `${label} search` : 'Search options'}
              class={`${visibleClasses} pr-8`}
            />
            <button
              type='button'
              aria-label='Toggle options'
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (disabled) return;
                setIsOpen((prev) => !prev);
                setIsSearchFocused(true);
                queueMicrotask(() => inputRef.current?.focus());
              }}
              class={`absolute right-2 top-1/2 left-auto flex h-6 w-6 -translate-y-1/2 transform items-center justify-center rounded text-neutral-300 transition-transform ${
                isOpen ? 'rotate-180' : ''
              } hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue-500 disabled:opacity-50`}
            >
              <svg
                class='h-4 w-4'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
              >
                <path
                  d='M5 7l5 5 5-5'
                  stroke='currentColor'
                  stroke-width='1.5'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                />
              </svg>
            </button>
            <select
              ref={assignSelectRef}
              disabled={disabled}
              class='absolute inset-0 h-full w-full opacity-0 pointer-events-none'
              {...selectProps}
              onChange={handleSelectChange}
            >
              {renderedOptions}
            </select>
            {isOpen && (
              <div
                id={listboxId}
                role='listbox'
                aria-multiselectable={isMultiple || undefined}
                class={`absolute left-0 right-0 z-[2147483000] mt-1 max-h-56 ${listboxBaseClasses}`}
              >
                {optionItems}
              </div>
            )}
          </div>
        )
        : (
          <select
            ref={ref}
            disabled={disabled}
            class={visibleClasses}
            {...selectProps}
            onChange={originalOnChange}
          >
            {renderedOptions}
          </select>
        )}
      {showNoResults && !isOpen && <p class='mt-1 text-xs text-neutral-300'>{noResultsText}</p>}
    </div>
  );
});
