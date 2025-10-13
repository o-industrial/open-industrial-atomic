import { IntentTypes, JSX } from '../../.deps.ts';
import { Input } from '../../atoms/forms/Input.tsx';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';

export interface StringArrayEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
  addLabel?: string;
  removeLabel?: string;
}

export function StringArrayEditor({
  items,
  onChange,
  label,
  placeholder,
  addLabel = 'Add entry',
  removeLabel = 'Remove entry',
}: StringArrayEditorProps): JSX.Element {
  const update = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const add = () => {
    onChange([...items, '']);
  };

  return (
    <div class='space-y-2'>
      {label
        ? (
          <label class='block text-xs font-semibold text-neutral-300 mb-1'>
            {label}
          </label>
        )
        : null}
      <ul class='space-y-2'>
        {items.map((item, idx) => (
          <li key={idx} class='flex items-center gap-2'>
            <Input
              value={item}
              placeholder={placeholder}
              aria-label={`${label ?? 'Item'} ${idx + 1}`}
              onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                update(idx, event.currentTarget.value)}
            />
            <Action
              type='button'
              onClick={() => remove(idx)}
              intentType={IntentTypes.Error}
              styleType={ActionStyleTypes.Link | ActionStyleTypes.Thin}
              aria-label={`${removeLabel} ${idx + 1}`}
            >
              Remove
            </Action>
          </li>
        ))}
      </ul>
      <Action
        type='button'
        intentType={IntentTypes.Primary}
        styleType={ActionStyleTypes.Link | ActionStyleTypes.Thin}
        onClick={add}
        aria-label={addLabel}
      >
        Add
      </Action>
    </div>
  );
}
