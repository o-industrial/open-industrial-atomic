import { describe, it } from '../tests.deps.ts';
import { assertSnapshot } from '../tests.deps.ts';
import { Modal } from '../../src/molecules/Modal.tsx';
import { renderSnapshot } from '../utils/render.tsx';

describe('Modal', () => {
  it('renders a basic modal shell', async (context) => {
    const originalRandom = Math.random;
    Math.random = () => 0.123456789;

    try {
      const html = renderSnapshot(
        <Modal title='Snapshot Modal' onClose={() => {}}>
          <p>Declarative modal content</p>
        </Modal>,
      );

      await assertSnapshot(context, html);
    } finally {
      Math.random = originalRandom;
    }
  });
});
