import { ComponentChildren, JSX } from '../.deps.ts';

export type FlowPanelTemplateProps = JSX.HTMLAttributes<HTMLDivElement> & {
  bank?: ComponentChildren;
  canvas?: ComponentChildren;
  systemControls?: ComponentChildren;
  managementControls?: ComponentChildren;
  panelLabel?: string;
  panelLabelledBy?: string;
  focusable?: boolean;
};

export function FlowPanelTemplate({
  bank,
  canvas,
  systemControls,
  managementControls,
  panelLabel = 'Workspace canvas',
  panelLabelledBy,
  focusable = true,
  class: className,
  tabIndex,
  role,
  ...rest
}: FlowPanelTemplateProps): JSX.Element {
  const containerClass = [
    'relative w-full h-full flex-grow bg-neutral-950 overflow-hidden',
    className ?? '',
  ].filter(Boolean).join(' ');

  const resolvedRole = role ?? 'main';
  const resolvedTabIndex = tabIndex ?? (focusable ? -1 : undefined);

  return (
    <div
      {...rest}
      class={containerClass}
      role={resolvedRole}
      aria-label={panelLabelledBy ? undefined : panelLabel}
      aria-labelledby={panelLabelledBy}
      tabIndex={resolvedTabIndex}
    >
      {/* Full React Flow Canvas */}
      <div class='absolute inset-0 z-0'>{canvas}</div>

      {/* Floating Bank Overlay (non-blocking) */}
      <div
        class='absolute top-4 left-4 z-10 pointer-events-none'
        aria-hidden='true'
      >
        <div class='pointer-events-auto bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-md p-2'>
          {bank}
        </div>
      </div>

      {/* Bottom-left System Controls */}
      {systemControls && (
        <div class='absolute bottom-4 left-4 z-10 pointer-events-none'>
          <div class='pointer-events-auto'>{systemControls}</div>
        </div>
      )}

      {/* Top-right Management Controls */}
      {managementControls && (
        <div class='absolute top-4 right-4 z-10 pointer-events-none'>
          <div class='pointer-events-auto'>{managementControls}</div>
        </div>
      )}
    </div>
  );
}
