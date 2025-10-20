// deno-lint-ignore-file jsx-no-useless-fragment
import {
  AIMessage,
  AIMessageChunk,
  AziManager,
  type AziState,
  HumanMessage,
  HumanMessageChunk,
  IntentTypes,
  JSX,
  ToolMessage,
  ToolMessageChunk,
  useCallback,
  useEffect,
  useRef,
  useState,
  WorkspaceManager,
} from '../.deps.ts';

import { AziPanelTemplate } from '../templates/AziPanelTemplate.tsx';
import { AziChatInput } from '../molecules/azi/AziChatInput.tsx';
import { AziChatMessage } from '../molecules/azi/AziChatMessage.tsx';
import { Action, ActionStyleTypes, Modal, RedoIcon } from '../.exports.ts';

export const IsIsland = true;

type Role = 'user' | 'azi' | 'tool';

type AziPanelProps = {
  workspaceMgr: WorkspaceManager;
  aziMgr: AziManager;
  onClose?: () => void;
  onStartSend?: (state?: AziState) => void;
  onFinishSend?: (state?: AziState) => void;
  onStateChange?: (state: AziState) => void;
  intentTypes?: Partial<Record<Role, IntentTypes>>;
  renderMessage?: (message: string) => string;
  extraInputs?: Record<string, unknown>;
  elementId?: string;
  title?: string;
  headerRightInset?: number;
};

function ReasoningBlock({
  messages,
  isStreaming,
}: {
  messages: ToolMessage[];
  isStreaming: boolean;
}) {
  const renderMessage = (msg: ToolMessage, index: number) => {
    let parsed: unknown;
    let pretty = msg.content.toString();

    try {
      parsed = JSON.parse(msg.content.toString());
      pretty = JSON.stringify(parsed, null, 2);
    } catch {
      // fall back to plain text
    }

    return (
      <details
        key={index}
        class='text-sm text-tertiary my-2 bg-muted rounded px-4 py-2 overflow-hidden'
      >
        <summary class='cursor-pointer text-xs'>🧠 Step {index + 1}</summary>
        <pre class='overflow-auto text-xs whitespace-pre-wrap mt-2 break-words'>
          {pretty}
        </pre>
      </details>
    );
  };

  if (messages.length === 1) {
    return (
      <details class='text-sm text-tertiary my-2 max-w-[80%] overflow-hidden'>
        <summary class='cursor-pointer text-xs'>
          🧠 {isStreaming ? 'Reasoning…' : ''}
        </summary>
        <pre class='bg-muted rounded px-4 py-2 mt-2 overflow-auto text-xs whitespace-pre-wrap break-words'>
          {renderMessage(messages[0], 0).props.children[1].props.children}
        </pre>
      </details>
    );
  }

  return (
    <div class='text-sm text-tertiary my-2 max-w-[80%]'>
      {messages.map(renderMessage)}
    </div>
  );
}

export function AziPanel({
  workspaceMgr,
  onClose,
  onStartSend,
  onFinishSend,
  onStateChange,
  intentTypes = {
    user: IntentTypes.Secondary,
    azi: IntentTypes.Info,
    tool: IntentTypes.Tertiary,
  },
  renderMessage,
  aziMgr,
  extraInputs,
  title,
  headerRightInset = 20,
}: AziPanelProps): JSX.Element {
  const {
    state,
    isSending,
    send,
    peek,
    scrollRef,
    registerStreamAnchor,
    stop,
  } = workspaceMgr.UseAzi(aziMgr);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Track when the initial peek has completed
  const hasPeekedRef = useRef(false);

  // Initial peek when mounted (and mark completion)
  useEffect(() => {
    console.log('[AziPanel] Initial peek()');
    (async () => {
      try {
        await peek();
      } finally {
        hasPeekedRef.current = true;
      }
    })();
  }, []);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Notify parent on state changes for live updates (e.g., errors)
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const wrappedSend = useCallback(
    async (...args: Parameters<typeof send>) => {
      onStartSend?.(stateRef.current);
      try {
        return await send(...args);
      } finally {
        onFinishSend?.(stateRef.current);
      }
    },
    [send, onStartSend, onFinishSend],
  );

  // After initial peek, if still empty, trigger a single empty message to prompt greeting
  const autoGreetSentRef = useRef(false);
  useEffect(() => {
    if (!hasPeekedRef.current) return;
    if (autoGreetSentRef.current) return;
    if ((state.Messages?.length ?? 0) === 0 && !isSending) {
      autoGreetSentRef.current = true;
      console.log('[AziPanel] No messages after peek – sending empty message');
      wrappedSend('', extraInputs);
    }
  }, [state, isSending, wrappedSend, extraInputs]);

  const resolveRole = (msg: unknown): Role => {
    if (msg instanceof HumanMessage || msg instanceof HumanMessageChunk) {
      return 'user';
    }
    if (msg instanceof ToolMessage || msg instanceof ToolMessageChunk) {
      return 'tool';
    }
    if (msg instanceof AIMessage || msg instanceof AIMessageChunk) return 'azi';
    return 'azi';
  };

  const renderedMessages: JSX.Element[] = [];
  const toolBlocks: { index: number; messages: ToolMessage[] }[] = [];

  let buffer: ToolMessage[] = [];

  for (let i = 0; i < state.Messages.length; i++) {
    const msg = state.Messages[i];
    const role = resolveRole(msg);
    const content = msg.content?.toString?.() ?? '';

    if (role === 'tool') {
      buffer.push(msg as ToolMessage);
      const next = state.Messages[i + 1];
      const nextRole = next ? resolveRole(next) : null;

      if (nextRole !== 'tool') {
        toolBlocks.push({ index: renderedMessages.length, messages: buffer });
        renderedMessages.push(<></>);
        buffer = [];
      }
    } else {
      if (buffer.length) {
        toolBlocks.push({ index: renderedMessages.length, messages: buffer });
        renderedMessages.push(<></>);
        buffer = [];
      }

      if (content) {
        renderedMessages.push(
          <AziChatMessage
            key={`msg-${i}`}
            align={role === 'user' ? 'right' : 'left'}
            badge={role === 'azi' ? 'Azi' : role === 'user' ? 'You' : 'Tool'}
            content={content}
            intentType={intentTypes[role] ?? IntentTypes.None}
            inline
            renderMessage={renderMessage}
            class='mb-3'
          />,
        );
      }
    }
  }

  const lastToolBlockIndex = toolBlocks.length - 1;

  toolBlocks.forEach(({ index, messages }, i) => {
    const isLast = i === lastToolBlockIndex;
    renderedMessages[index] = (
      <ReasoningBlock
        key={`tool-${index}`}
        messages={messages}
        isStreaming={isLast && isSending}
      />
    );
  });
  const openResetConfirm = () => setShowResetConfirm(true);
  const closeResetConfirm = () => {
    if (isResetting) return;
    setShowResetConfirm(false);
  };
  const confirmReset = async () => {
    setShowResetConfirm(false);
    await handleReset();
  };

  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      const threadId = aziMgr.GetThreadId?.() ?? '';
      const aziType = threadId.includes('warmquery') ? 'azi-warm-query' : 'azi';

      if (!threadId) {
        console.warn('[AziPanel] No thread id available for reset');
        return;
      }

      const url = `/api/synaptic/azi/reset-ai/${encodeURIComponent(threadId)}/${aziType}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: workspaceMgr.GetAuthHeaders(),
      });
      if (!res.ok) {
        console.error('[AziPanel] Reset failed', res.status, await res.text().catch(() => ''));
      }

      autoGreetSentRef.current = false;
      await peek();
    } catch (err) {
      console.error('[AziPanel] Reset error', err);
    } finally {
      setIsResetting(false);
    }
  }, [aziMgr, peek, workspaceMgr]);

  return (
    <>
      <AziPanelTemplate
        onClose={onClose}
        panelLabel={title}
        headerRightInset={headerRightInset}
        headerActions={
          <Action
            type='button'
            onClick={openResetConfirm}
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            disabled={isSending || isResetting}
            style='padding-right:0;'
            title='Reset Chat'
          >
            <RedoIcon class='w-5 h-5' />
          </Action>
        }
        input={
          <AziChatInput
            onSend={wrappedSend}
            extraInputs={extraInputs}
            disabled={isResetting}
            onReset={handleReset}
            showResetAction={false}
            isStreaming={isSending}
            onStop={stop}
          />
        }
      >
        <div ref={scrollRef} class='overflow-y-auto h-full'>
          {renderedMessages}

          <div
            ref={(el) => {
              registerStreamAnchor(el);
            }}
            class='h-4'
          />
        </div>
      </AziPanelTemplate>
      {showResetConfirm && (
        <Modal title='Reset Azi Chat' onClose={closeResetConfirm}>
          <div class='space-y-6'>
            <p class='text-sm text-slate-200'>Are you sure you want to reset this Azi chat?</p>
            <div class='flex justify-end gap-3'>
              <Action
                type='button'
                onClick={closeResetConfirm}
                intentType={IntentTypes.Secondary}
                styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
                disabled={isResetting}
              >
                Cancel
              </Action>
              <Action
                type='button'
                onClick={confirmReset}
                intentType={IntentTypes.Primary}
                styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
                disabled={isResetting}
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
