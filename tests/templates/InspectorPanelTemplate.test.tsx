import { describe, it } from '../tests.deps.ts';
import { assertSnapshot } from '../tests.deps.ts';
import { InspectorPanelTemplate } from '../../src/templates/InspectorPanelTemplate.tsx';
import { renderSnapshot } from '../utils/render.tsx';

describe('InspectorPanelTemplate', () => {
  it('renders with close affordance', async (context) => {
    const originalRandom = Math.random;
    Math.random = () => 0.987654321;

    try {
      const html = renderSnapshot(
        <InspectorPanelTemplate
          title='Structure Inspector'
          onClose={() => {}}
        >
          <div>Panel body content</div>
        </InspectorPanelTemplate>,
      );

      await assertSnapshot(context, html);
    } finally {
      Math.random = originalRandom;
    }
  });
});
