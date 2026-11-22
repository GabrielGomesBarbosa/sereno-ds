import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const searchInputMeta: ComponentMeta = {
  slug: 'search-input',
  name: 'SearchInput',
  category: 'forms',
  summary: '`Input` with a magnifier, a clear (×) button, and a debounced `onSearch`. `Enter` searches now, `Esc` clears.',
  props: [
    R('value / defaultValue', 'string', 'Controlled / uncontrolled text.'),
    R('onValueChange', '(value: string) => void', 'Every keystroke and on clear: the plain string.'),
    R('onSearch', '(value: string) => void', 'Debounced; also fires on `Enter` and on clear. Run the query here.'),
    R('debounce', 'number', 'Debounce for `onSearch`, ms.', '250'),
    R('onKeyDown', '(e: KeyboardEvent<HTMLInputElement>) => void', 'Runs first, on every key. Calling `preventDefault()` there says the key was handled and skips the built-in `Enter` (search now) and `Esc` (clear).'),
    R('clearLabel', 'string', 'aria-label for the × button.', "'Clear search'"),
    R('placeholder', 'string', '', "'Search…'"),
    R('label / hint / error / size / disabled / preserveHelperSpace', '-', 'Passed through to `Input`.'),
  ],
  code: `<SearchInput
  placeholder="Buscar cliente"
  onSearch={(q) => setQuery(q)}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Basic',
      description: 'The × appears once there is text. `onSearch` is debounced (`250ms`); pressing `Enter` fires it immediately, `Esc` clears.',
      code: `<SearchInput placeholder="Buscar cliente" onSearch={(q) => run(q)} />`,
    },
    {
      id: 'live',
      title: 'Live results',
      description: 'Wire `onSearch` to a filter. `onValueChange` (undebounced) is there too if you need the raw value for something else.',
      code: `const [q, setQ] = useState('');
const rows = q ? ITEMS.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : ITEMS;
// …
<SearchInput placeholder="Filter" onSearch={setQ} />
{rows.length === 0 ? <EmptyState … /> : rows.map(…)}`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'Same `size` scale as `Input`: `lg` for a page-level search, `sm` inside a toolbar.',
      code: `<SearchInput size="sm" placeholder="Search" />
<SearchInput size="md" placeholder="Search" />
<SearchInput size="lg" placeholder="Search" />`,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      code: `<SearchInput placeholder="Search" defaultValue="emma johnson" disabled />`,
    },
  ],
  guidelines: {
    do: [
      'Put the query behind `onSearch` (debounced): not `onValueChange`.',
      'Show an `EmptyState` when a non-empty query returns nothing.',
      'A short, concrete placeholder: "Search clients", not just "Search".',
    ],
    dont: [
      'Running an expensive query on every keystroke; that is what the debounce is for.',
      'A search field with no clear affordance, the × is part of the contract.',
    ],
  },
};
