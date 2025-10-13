import { render } from 'npm:preact-render-to-string@6.3.1';
import type { JSX } from '../../src/.deps.ts';

const dynamicIdPatterns: Array<[RegExp, string]> = [
  [/(modal-(?:title|body)-)[a-z0-9]+/gi, '$1__id__'],
  [/(inspector-heading-)[a-z0-9]+/gi, '$1__id__'],
];

export function renderSnapshot(element: JSX.Element): string {
  const markup = render(element);

  return dynamicIdPatterns.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    markup,
  );
}
