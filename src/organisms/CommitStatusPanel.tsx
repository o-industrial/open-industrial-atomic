import {
  classSet,
  EaCStatus,
  EaCStatusProcessingTypes,
  IntentTypes,
  JSX,
  useEffect,
  useState,
} from '../.deps.ts';
import { Action, ActionStyleTypes, CloseIcon, CommitIcon } from '../.exports.ts';

type CommitStatusStoreSnapshot = {
  commits: EaCStatus[];
  badgeState: 'error' | 'processing' | 'success';
};

type CommitStatusStoreLike = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CommitStatusStoreSnapshot;
  load: () => Promise<void>;
};

type CommitStatusPanelProps =
  | {
    store: CommitStatusStoreLike;
    onClose: () => void;
  }
  | {
    commit: EaCStatus;
    onClose?: () => void;
  };

function classyPrint(value: unknown): JSX.Element {
  if (value === null) {
    return <span class='text-neutral-400'>null</span>;
  }

  if (Array.isArray(value)) {
    return (
      <ul class='pl-4 space-y-1 list-disc'>
        {value.map((v, i) => <li key={i}>{classyPrint(v)}</li>)}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <ul class='pl-4 space-y-1'>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <li key={k}>
            <span class='text-neutral-400'>{k}:</span>
            {classyPrint(v)}
          </li>
        ))}
      </ul>
    );
  }

  return <span class='text-neutral-300'>{String(value)}</span>;
}

function useCommitStoreField<T extends keyof CommitStatusStoreSnapshot>(
  store: CommitStatusStoreLike,
  field: T,
): CommitStatusStoreSnapshot[T] {
  const [value, setValue] = useState(store.getSnapshot()[field]);

  useEffect(() => {
    const update = () => setValue(store.getSnapshot()[field]);
    setValue(store.getSnapshot()[field]);
    return store.subscribe(update);
  }, [store, field]);

  return value;
}

function renderCommitDetails(commit: EaCStatus): JSX.Element {
  return (
    <div class='px-6 pb-2 text-neutral-300'>
      {classyPrint(commit)}
    </div>
  );
}

export function CommitStatusPanel(props: CommitStatusPanelProps): JSX.Element {
  if ('commit' in props) {
    const { commit, onClose } = props;
    return (
      <aside class='flex flex-col h-full w-full bg-neutral-900 border-l border-neutral-800'>
        <header class='flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700'>
          <h2 class='text-sm font-semibold tracking-wide text-white uppercase'>
            Commit Details
          </h2>
          {onClose && (
            <Action
              title='Close Commits'
              styleType={ActionStyleTypes.Icon}
              intentType={IntentTypes.Primary}
              onClick={onClose}
              class='-:absolute -:top-0 -:right-0 -:z-30'
            >
              <CloseIcon class='w-5 h-5' />
            </Action>
          )}
        </header>
        <div class='flex-1 overflow-y-auto'>
          {renderCommitDetails(commit)}
        </div>
      </aside>
    );
  }

  const { store, onClose } = props;
  const commits = useCommitStoreField(store, 'commits');
  const [selectedCommitId, setSelectedCommitId] = useState<string | undefined>();

  useEffect(() => {
    store.load().catch((err) => {
      console.warn('[CommitStatusPanel] Failed to load commit statuses', err);
    });
    const interval = setInterval(() => {
      store.load().catch((err) => {
        console.warn('[CommitStatusPanel] Polling load failed', err);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [store]);

  useEffect(() => {
    if (selectedCommitId && !commits.some((commit) => commit.ID === selectedCommitId)) {
      setSelectedCommitId(undefined);
    }
  }, [commits, selectedCommitId]);

  const sorted = [...commits].sort((a, b) => {
    const aDate = (a as any).Created ?? (a as any).Timestamp ?? 0;
    const bDate = (b as any).Created ?? (b as any).Timestamp ?? 0;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const statusIntent = (processing: EaCStatusProcessingTypes) => {
    switch (processing) {
      case EaCStatusProcessingTypes.COMPLETE:
        return IntentTypes.Secondary;
      case EaCStatusProcessingTypes.ERROR:
        return IntentTypes.Error;
      default:
        return IntentTypes.Info;
    }
  };

  return (
    <aside class='flex flex-col h-full w-full bg-neutral-900 border-l border-neutral-800'>
      <header class='flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700'>
        <h2 class='text-sm font-semibold tracking-wide text-white uppercase'>
          Commits
        </h2>
        <Action
          title='Close Commits'
          styleType={ActionStyleTypes.Icon}
          intentType={IntentTypes.Primary}
          onClick={onClose}
          class='-:absolute -:top-0 -:right-0 -:z-30'
        >
          <CloseIcon class='w-5 h-5' />
        </Action>
      </header>

      <div class='flex-1 overflow-y-auto'>
        <ul class='divide-y divide-neutral-800'>
          {sorted.map((commit) => {
            const isSelected = commit.ID === selectedCommitId;

            return (
              <li key={commit.ID} class='text-xs text-white'>
                <div
                  class={classSet([
                    'flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-800',
                    isSelected ? 'bg-neutral-800' : '',
                  ])}
                  onClick={() =>
                    setSelectedCommitId((prev) => prev === commit.ID ? undefined : commit.ID)}
                >
                  <Action
                    title={commit.ID}
                    styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
                    intentType={statusIntent(commit.Processing)}
                  >
                    <CommitIcon class={classSet(['w-4 h-4'])} />
                  </Action>

                  <span class='font-mono truncate'>{commit.ID}</span>
                </div>
                {isSelected && renderCommitDetails(commit)}
              </li>
            );
          })}
          {sorted.length === 0 && (
            <li class='px-4 py-6 text-center text-xs text-neutral-400'>
              No commits found.
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}
