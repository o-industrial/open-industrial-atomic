import { describe, it } from '../tests.deps.ts';
import { assertSnapshot } from '../tests.deps.ts';
import { Action, ActionStyleTypes } from '../../src/atoms/Action.tsx';
import { CloseIcon } from '../../src/.exports.ts';
import { IntentTypes } from '../../src/.deps.ts';
import { renderSnapshot } from '../utils/render.tsx';

describe('Action', () => {
  it('renders a primary solid action', async (context) => {
    const html = renderSnapshot(
      <Action intentType={IntentTypes.Primary} styleType={ActionStyleTypes.Solid}>
        Click to deploy
      </Action>,
    );

    await assertSnapshot(context, html);
  });

  it('renders an icon-only action', async (context) => {
    const html = renderSnapshot(
      <Action
        title='Close'
        aria-label='Close'
        intentType={IntentTypes.Secondary}
        styleType={ActionStyleTypes.Icon}
      >
        <CloseIcon aria-hidden='true' class='h-4 w-4' />
      </Action>,
    );

    await assertSnapshot(context, html);
  });
});
