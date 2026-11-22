import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const autocompleteMeta: ComponentMeta = {
  slug: 'autocomplete',
  name: 'Autocomplete',
  category: 'forms',
  summary:
    'Single choice from a list you search by typing: the Select for a list too long to scroll, or one the server searches and pages. The box is a text field, the value is the chosen row, and it carries its own label, so the box never loses it when the page it came from is not loaded.',
  props: [
    R('options', 'AutocompleteOption[]', 'What the list shows now: `{ value, label, disabled? }`. Not the value: the box shows `value.label` whether or not that row is in here. Appending rows while the list is open is fine, it keeps its scroll.', '[]'),
    R('value / defaultValue', 'AutocompleteOption | null', 'The chosen row itself, `{ value, label }`, or `null` for none: controlled / uncontrolled. It carries its label, which is what lets a paged list show the right name from the first render.'),
    R('onValueChange', '(option: AutocompleteOption | null) => void', 'Fires with the chosen row, or `null` when the value is cleared. A row, not a string, and not a DOM event.'),
    R('filter', 'boolean | ((option, query) => boolean)', '`true`: typing keeps the rows whose label contains the text, ignoring case and accents, and the first match is ready for Enter. `false`: the list is left as it is, for a list the server already searched. A function decides per row.', 'true'),
    R('onSearch', '(query: string) => void', 'The text to search for changed: as the user types (after `debounce`), and with `\'\'` when the box goes back to the chosen label (pick, clear, leave, Esc). Never called with the label itself, so the query is safe to run in here. For `filter={false}`.'),
    R('debounce', 'number', 'Debounce for `onSearch` while typing, in ms.', '250'),
    R('loading', 'boolean', 'The list is waiting for rows: a spinner under them (or alone when there are none), `aria-busy` on the list, and a screen reader hears "Loading…". `onReachEnd` stays quiet meanwhile.', 'false'),
    R('onReachEnd', '() => void', 'The list was scrolled to within about five rows of its end (or it is too short to scroll). Fires once per list size, never while `loading`. Pass it only while there is a next page: a list that is complete should ask for nothing.'),
    R('onOpenChange', '(open: boolean) => void', 'The list opened or closed. For a list that loads the first time it opens.'),
    R('clearable', 'boolean', 'A × button that clears the value, and an emptied box clears it too. Off: leaving the box puts the label back.', 'true'),
    R('placeholder', 'string', 'Muted text while nothing is chosen.', 'locale-dependent'),
    R('label / hint / error / required', '-', 'Same label contract as Input, including the `aria-invalid` / `aria-describedby` / `aria-required` wiring on the text box.'),
    R('size', "'sm' | 'md' | 'lg'", 'Control height.', "'md'"),
    R('disabled', 'boolean', 'Disabled fill and text, not-allowed cursor.', 'false'),
    R('name', 'string', 'Mirrored to a hidden input (the chosen `value.value`) so it can be submitted in a form. `ref` reaches that input, the same as Select.'),
    R('locale', "'pt-BR' | 'en'", "The built-in texts (placeholder, loading, no results, the × and the chevron). The real Sereno product always renders pt-BR, `'en'` exists for an English-speaking docs/demo audience.", "'pt-BR'"),
    R('labels', 'Partial<AutocompleteLabels>', 'Change any one of those texts: `placeholder`, `clear`, `open`, `close`, `loading`, `empty`, `results(count)`.'),
    R('preserveHelperSpace', 'boolean', "Reserve the hint/error row's height even with neither set, see Input.", 'false'),
  ],
  code: `<Autocomplete
  label="City"
  options={cities}
  value={city}
  onValueChange={setCity}
/>`,
  examples: [
    {
      id: 'basic',
      title: 'Local search',
      description:
        'The default: the options are all here, typing narrows them (case and accents ignored) and the first match is ready for `Enter`. `onValueChange` gives the chosen row. Open with a click or `↓`, then `↑ ↓`, `Home` / `End`, `Enter` to pick, `Esc` to close; leaving the box puts the chosen label back, because what is typed is never the value.',
      code: `const [city, setCity] = useState<AutocompleteOption | null>(null);

<Autocomplete
  label="City"
  options={cities} // [{ value: 'sao-paulo', label: 'São Paulo' }, ...]
  value={city}
  onValueChange={setCity}
/>`,
    },
    {
      id: 'server',
      title: 'Search on the server',
      description:
        '`filter={false}` leaves the list to you, and `onSearch` hands you what was typed, debounced. It is never called with the chosen label, and it goes back to `\'\'` when the box does, so the app can reload the unfiltered list. Pass `loading` while you wait. Answers can arrive out of order: keep only the last one.',
      code: `const [client, setClient] = useState<AutocompleteOption | null>(null);
const [options, setOptions] = useState<AutocompleteOption[]>([]);
const [loading, setLoading] = useState(false);

<Autocomplete
  label="Client"
  filter={false}
  options={options}
  loading={loading}
  value={client}
  onValueChange={setClient}
  debounce={300}
  onOpenChange={(open) => open && options.length === 0 && search('')}
  onSearch={search} // sets loading, asks the server, sets options
/>`,
    },
    {
      id: 'paged',
      title: 'A thousand records, fifty at a time',
      description:
        'The case a Select cannot do. The client being edited is #988 of 1000, so its page is not the first. Because the value is `{ value, label }`, the box shows the name from the first render, whatever is loaded. `onReachEnd` loads the next page when the scroll gets within five rows of the end; the row turns up selected when its page lands, without moving the list under the user. If your API can answer "the page around this id", start the list there (second button): it opens on the row. Earlier pages are one search away.',
      code: `<Autocomplete
  label="Client"
  filter={false}
  options={rows}          // the pages loaded so far
  loading={loading}
  value={editing}         // { value, label }: its label does not depend on \`rows\`
  onValueChange={setEditing}
  onSearch={restartWith}  // '' goes back to the first page (or the one around the value)
  onReachEnd={hasMore ? loadNextPage : undefined}
/>`,
    },
    {
      id: 'states',
      title: 'Loading, empty, error, disabled',
      description:
        'Open the first two. `loading` shows a lone spinner under the rows (or by itself when there are none), `error` and `required` follow the Input contract, and a screen reader hears "Loading…", "No results" or the number of results as the list changes.',
      code: `<Autocomplete label="Loading" loading options={[]} />
<Autocomplete label="No results" options={[]} />
<Autocomplete label="Client" required error="Choose a client." options={clients} />
<Autocomplete label="Client" disabled defaultValue={client} options={clients} />`,
    },
    {
      id: 'sizes',
      title: 'Sizes',
      description: '`sm` fits dense rows: a filter bar, a table cell.',
      code: `<Autocomplete label="Field" size="sm" options={opts} />
<Autocomplete label="Field" size="md" options={opts} />
<Autocomplete label="Field" size="lg" options={opts} />`,
    },
    {
      id: 'in-dialog',
      title: 'Inside a Dialog',
      description:
        'The list is not clipped by the dialog: it is drawn over it. `Esc` closes the list first, and the dialog on the next press.',
      code: `<Dialog open={open} onClose={() => setOpen(false)}>
  <Dialog.Body>
    <Autocomplete label="City" options={cities} value={city} onValueChange={setCity} />
  </Dialog.Body>
</Dialog>`,
    },
  ],
  guidelines: {
    do: [
      'Use it when the list is past ~12 options, or when the server searches and pages it. Up to ~12, a Select is simpler.',
      'Keep the chosen row in `value`, with its label: that is what the box shows, not whatever page is loaded.',
      'For a list the server searches, set `filter={false}` and run the query in `onSearch`.',
      'Pass `onReachEnd` only while there is a next page, and set `loading` while it loads.',
    ],
    dont: [
      'Free text: what is typed never becomes the value. For an address or a name the user may invent, use an Input.',
      'Reading the typed text from `onValueChange`: it fires with a chosen row (or `null`), not with keystrokes. Use `onSearch`.',
      'A `name` that reveals what the field is (an address, a card number): password managers and the browser autofill read it. Keep ids and names neutral.',
    ],
  },
};
