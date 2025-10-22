import { IntentTypes, JSX, useEffect, useRef, useState } from '../../.deps.ts';
import {
  Action,
  ActionStyleTypes,
  EmptyIcon,
  Input,
  Modal,
  RedoIcon,
  SendIcon,
} from '../../.exports.ts';

export type AziChatInputProps = {
  placeholder?: string;
  onSend: (message: string, extraInputs?: Record<string, unknown>) => Promise<void>; // ✅ now async
  disabled?: boolean;
  inputIntentType?: IntentTypes;
  actionIntentType?: IntentTypes;
  sendIcon?: JSX.Element;
  redoIcon?: JSX.Element;
  maxHeight?: number; // in pixels
  extraInputs?: Record<string, unknown>;
  onReset?: () => void | Promise<void>;
  showResetAction?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
};

export function AziChatInput({
  placeholder = 'Ask Azi something...',
  onSend,
  disabled = false,
  inputIntentType = IntentTypes.None,
  actionIntentType = IntentTypes.Primary,
  sendIcon = <SendIcon class='w-5 h-5' />,
  redoIcon = <RedoIcon class='w-5 h-5' />,
  maxHeight = 80,
  extraInputs = {},
  onReset,
  showResetAction = true,
  isStreaming = false,
  onStop,
}: AziChatInputProps): JSX.Element {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const minHeightRef = useRef<number | null>(null);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = `${maxHeight}px`;

    if (minHeightRef.current == null) {
      minHeightRef.current = maxHeight;
    }
    el.style.overflowY = el.scrollHeight > maxHeight ? 'scroll' : 'hidden';
  };

  const handleInput = (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => {
    const value = e.currentTarget.value;
    setInput(value);
  };

  const sendNow = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || resetting || disabled || isStreaming) return;

    setSending(true);
    try {
      await onSend(trimmed, extraInputs);
      setInput('');
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        // Ignore abort signals triggered by Stop.
      } else {
        throw err;
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = async (
    e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await sendNow();
    }
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendNow();
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const trimmedInput = input.trim();
  const inputDisabled = disabled || sending || resetting || isStreaming;
  const sendDisabled = disabled || sending || resetting || isStreaming || trimmedInput.length === 0;
  const stopDisabled = disabled || resetting || !onStop;

  const handleOpenResetConfirm = () => {
    if (!showResetAction || disabled || resetting || sending || isStreaming) return;
    setShowResetConfirm(true);
  };

  const handleCloseResetConfirm = () => {
    if (resetting) return;
    setShowResetConfirm(false);
  };

  const handleConfirmReset = async () => {
    if (!onReset) return;
    setResetting(true);
    try {
      await Promise.resolve(onReset());
      setInput('');
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} class='flex gap-2 w-full items-stretch'>
        <Input
          ref={textareaRef}
          multiline
          rows={5}
          value={input}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={inputDisabled}
          intentType={inputIntentType}
          class='flex-grow resize-none overflow-hidden h-full'
          style={{ minHeight: `${maxHeight}px`, maxHeight: `${maxHeight}px` }}
        />

        <div class='flex items-stretch gap-1 self-stretch'>
          {isStreaming
            ? (
              <Action
                type='button'
                onClick={() => onStop?.()}
                styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
                intentType={IntentTypes.Secondary}
                disabled={stopDisabled}
                class='px-3 h-full flex items-center justify-center'
                title='Stop'
              >
                <EmptyIcon class='w-5 h-5' />
              </Action>
            )
            : (
              <Action
                type='submit'
                styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
                intentType={actionIntentType}
                disabled={sendDisabled}
                class='px-3 h-full flex items-center justify-center'
                title='Send'
              >
                {sendIcon}
              </Action>
            )}

          {showResetAction && onReset && (
            <Action
              type='button'
              onClick={handleOpenResetConfirm}
              styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
              intentType={IntentTypes.Primary}
              disabled={disabled || resetting || sending || isStreaming}
              class='px-3 h-full flex items-center justify-center'
              title='Reset Chat'
            >
              {redoIcon}
            </Action>
          )}
        </div>
      </form>

      {showResetAction && onReset && showResetConfirm && (
        <Modal title='Reset Azi Chat' onClose={handleCloseResetConfirm}>
          <div class='space-y-6'>
            <p class='text-sm text-slate-200'>Are you sure you want to reset this Azi chat?</p>
            <div class='flex justify-end gap-3'>
              <Action
                type='button'
                onClick={handleCloseResetConfirm}
                intentType={IntentTypes.Secondary}
                styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
                disabled={resetting}
              >
                Cancel
              </Action>
              <Action
                type='button'
                onClick={handleConfirmReset}
                intentType={IntentTypes.Primary}
                styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
                disabled={resetting}
              >
                Reset Chat
              </Action>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
