import { classSet, ComponentChildren, IntentTypes, JSX, useMemo } from '../.deps.ts';
import { Action, ActionStyleTypes, CloseIcon, useEscapeKey, useFocusTrap } from '../.exports.ts';

export type ModalProps = {
  title?: ComponentChildren;
  onClose: () => void;
  fullscreen?: boolean;
  children: JSX.Element | JSX.Element[];
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'>;

export function Modal(props: ModalProps): JSX.Element {
  const { title, onClose, fullscreen = false, children, ...rest } = props;

  useEscapeKey(onClose);
  const trapRef = useFocusTrap<HTMLDivElement>();

  const {
    ['aria-labelledby']: ariaLabelledByProp,
    ['aria-describedby']: ariaDescribedByProp,
    ...restProps
  } = rest;

  const generatedTitleId = useMemo(
    () => `modal-title-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const generatedBodyId = useMemo(
    () => `modal-body-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  const ariaLabelledBy = title
    ? (ariaLabelledByProp as string | undefined) ?? generatedTitleId
    : (ariaLabelledByProp as string | undefined);
  const ariaDescribedBy = children
    ? (ariaDescribedByProp as string | undefined) ?? generatedBodyId
    : (ariaDescribedByProp as string | undefined);

  return (
    <div
      role='presentation'
      class='fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center'
      onClick={onClose}
    >
      <div
        ref={trapRef}
        onClick={(event) => event.stopPropagation()}
        class={classSet(
          [
            'relative bg-neutral-900 border border-neutral-700 rounded-md shadow-xl overflow-hidden flex flex-col transition-all',
            fullscreen ? 'w-full h-full m-4' : 'w-full max-w-5xl max-h-[90vh] m-4',
          ],
          restProps,
        )}
        role='dialog'
        aria-modal='true'
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        {...restProps}
      >
        {/* Header */}
        <div class='flex items-center justify-between px-4 py-3 border-b border-neutral-700'>
          <h2
            class='text-sm font-bold text-white uppercase tracking-wide w-full'
            id={ariaLabelledByProp ? undefined : generatedTitleId}
          >
            {title}
          </h2>
          <Action
            type='button'
            title='Close'
            onClick={onClose}
            intentType={IntentTypes.Error}
            styleType={ActionStyleTypes.Icon}
            aria-label='Close dialog'
          >
            <CloseIcon aria-hidden='true' class='h-4 w-4' />
          </Action>
        </div>

        {/* Scrollable Content */}
        <div
          class='flex-1 overflow-y-auto p-4'
          id={ariaDescribedByProp ? undefined : generatedBodyId}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
