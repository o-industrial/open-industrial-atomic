import { ComponentChildren, IntentTypes, JSX, useMemo } from '../.deps.ts';
import { Action, ActionStyleTypes, CloseIcon } from '../.exports.ts';

export type InspectorPanelTemplateProps = {
  children?: ComponentChildren;
  title?: ComponentChildren;
  onClose?: () => void;
  panelLabel?: string;
  panelLabelledBy?: string;
  focusable?: boolean;
};

export function InspectorPanelTemplate({
  children,
  title = 'Inspector',
  onClose,
  panelLabel = 'Inspector panel',
  panelLabelledBy,
  focusable = true,
}: InspectorPanelTemplateProps): JSX.Element {
  const generatedHeadingId = useMemo(
    () => `inspector-heading-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const headingId = panelLabelledBy ?? generatedHeadingId;

  return (
    <aside
      class='relative flex h-full w-full flex-col bg-neutral-900'
      role='complementary'
      aria-label={panelLabelledBy ? undefined : panelLabel}
      aria-labelledby={panelLabelledBy ?? headingId}
      tabIndex={focusable ? -1 : undefined}
    >
      {/* Sticky Header */}
      <header class='sticky top-0 z-10 flex w-full items-center justify-between gap-3 border-b border-neutral-700 bg-neutral-800 px-4 py-2'>
        <h2
          id={panelLabelledBy ? undefined : headingId}
          class='truncate text-sm font-semibold uppercase tracking-wide text-white'
        >
          {title}
        </h2>

        {onClose
          ? (
            <Action
              type='button'
              aria-label='Close inspector panel'
              title='Close inspector panel'
              intentType={IntentTypes.Secondary}
              styleType={ActionStyleTypes.Icon}
              onClick={onClose}
            >
              <CloseIcon aria-hidden='true' class='h-4 w-4' />
            </Action>
          )
          : null}
      </header>

      {/* Scrollable Content */}
      <div class='flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3'>
        {children}
      </div>
    </aside>
  );
}
