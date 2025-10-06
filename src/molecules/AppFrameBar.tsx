import { SettingsIcon } from '../../build/iconset/icons/SettingsIcon.tsx';
import { UsersIcon } from '../../build/iconset/icons/UsersIcon.tsx';
import { CommitIcon } from '../../build/iconset/icons/CommitIcon.tsx';
import { classSet, IntentTypes, JSX, useEffect, useState } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../atoms/Action.tsx';
import { MenuActionItem, MenuRoot } from './FlyoutMenu.tsx';
import { MenuBar } from './MenuBar.tsx';
import { LoadingIcon } from '../../build/iconset/icons/LoadingIcon.tsx';

export type CommitBadgeState = 'error' | 'processing' | 'success';

type CommitStatusStoreSnapshot = {
  badgeState: CommitBadgeState;
};

type CommitStatusStoreLike = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CommitStatusStoreSnapshot;
  load?: () => Promise<void>;
};

export type AppFrameBarProps = {
  hasWorkspaceChanges: boolean;
  menus: MenuRoot[];
  isDeploying: boolean;
  onMenuOption: (item: MenuActionItem) => void;
  onActivateClick?: () => void;
  onCommitClick: () => void;
  onDeployClick?: () => void;
  commitBadgeState?: CommitBadgeState;
  commitStore?: CommitStatusStoreLike;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  profileIntentType?: IntentTypes;
};

function useCommitBadgeState(
  store: CommitStatusStoreLike | undefined,
  fallback?: CommitBadgeState,
): CommitBadgeState | undefined {
  const [badge, setBadge] = useState<CommitBadgeState | undefined>(
    () => store?.getSnapshot().badgeState ?? fallback,
  );

  useEffect(() => {
    if (!store) {
      setBadge(fallback);
      return;
    }

    setBadge(store.getSnapshot().badgeState);
    const unsubscribe = store.subscribe(() => {
      setBadge(store.getSnapshot().badgeState);
    });

    store.load?.().catch((err) => {
      console.warn('[AppFrameBar] Commit store load failed', err);
    });

    return unsubscribe;
  }, [store]);

  useEffect(() => {
    if (!store) setBadge(fallback);
  }, [store, fallback]);

  return store ? badge : fallback;
}

export function AppFrameBar({
  hasWorkspaceChanges,
  isDeploying,
  menus,
  onMenuOption,
  onActivateClick,
  onCommitClick,
  onDeployClick,
  commitBadgeState,
  commitStore,
  onProfileClick,
  onSettingsClick,
  profileIntentType = IntentTypes.Info,
}: AppFrameBarProps): JSX.Element {
  const resolvedBadgeState = useCommitBadgeState(commitStore, commitBadgeState);

  const commitIntent = resolvedBadgeState === 'error'
    ? IntentTypes.Error
    : resolvedBadgeState === 'processing'
    ? IntentTypes.Info
    : resolvedBadgeState === 'success'
    ? IntentTypes.Secondary
    : IntentTypes.None;

  return (
    <div
      class={classSet([
        '-:flex -:items-center -:gap-4 -:text-sm -:text-neutral-300',
        '-:w-full -:h-full -:px-4',
      ])}
    >
      {/* dY"? Logo & Brand */}
      <img
        src='/assets/favicon.ico'
        alt='Open Industrial'
        data-eac-bypass
        class='-:h-6 -:w-6'
      />

      {
        /* <span class="-:font-semibold">Open Industrial</span>
      <span class="-:text-xs -:text-neutral-500">runtime</span> */
      }

      {/* dY- Menu Bar (File | View | ???) */}
      <MenuBar menus={menus} onMenuOption={onMenuOption} />

      {/* ?z??,? Right-aligned Profile Button */}
      <div class='-:ml-auto -:flex -:items-center -:gap-2'>
        {onActivateClick && (
          <Action
            title='Activate to Deploy'
            onClick={onActivateClick}
            styleType={ActionStyleTypes.Outline | ActionStyleTypes.Thin}
            intentType={IntentTypes.Warning}
          >
            Activate to Deploy
          </Action>
        )}

        {onDeployClick &&
          (isDeploying ? <LoadingIcon class='w-4 h-4 animate-spin' /> : (
            <Action
              title='Deploy'
              onClick={onDeployClick}
              styleType={ActionStyleTypes.Outline | ActionStyleTypes.Thin}
              intentType={!hasWorkspaceChanges ? IntentTypes.Primary : IntentTypes.None}
              disabled={hasWorkspaceChanges}
            >
              Deploy
            </Action>
          ))}

        {onSettingsClick && (
          <Action
            title='Workspace Settings'
            onClick={onSettingsClick}
            styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
            intentType={IntentTypes.Info}
          >
            <SettingsIcon class='w-4 h-4' />
          </Action>
        )}

        <Action
          title='Commit Workspace'
          onClick={onCommitClick}
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={commitIntent}
        >
          <span class='-:relative -:block'>
            <CommitIcon class='-:w-4 -:h-4' />
            {resolvedBadgeState === 'error' && (
              <span class='-:absolute -:top-0 -:right-0 -:w-2 -:h-2 -:rounded-full -:bg-neon-red-500 -:translate-x-1/2 -:-translate-y-1/2' />
            )}
            {resolvedBadgeState === 'processing' && (
              <span class='-:absolute -:top-0 -:right-0 -:w-2 -:h-2 -:rounded-full -:border-2 -:border-neon-blue-500 -:border-t-transparent -:animate-spin -:translate-x-1/2 -:-translate-y-1/2' />
            )}
            {resolvedBadgeState === 'success' && (
              <span class='-:absolute -:top-0 -:right-0 -:text-green-500 -:text-[10px] -:translate-x-1/2 -:-translate-y-1/2'>
                ✓
              </span>
            )}
          </span>
        </Action>

        {onProfileClick && (
          <Action
            title='Manage Profile'
            onClick={onProfileClick}
            styleType={ActionStyleTypes.Link}
            intentType={profileIntentType}
          >
            <UsersIcon class='h-6 w-6' />
          </Action>
        )}
      </div>
    </div>
  );
}
