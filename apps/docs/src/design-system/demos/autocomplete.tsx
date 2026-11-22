'use client';

import { Autocomplete, type AutocompleteOption, Button, Dialog } from '@sereno-ds/ui';
import * as React from 'react';
import { col, row } from './_shared';

// A thousand clients, sorted by name, behind a "server" that answers after a moment. Names have
// accents on purpose: the search ignores them.
const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Heitor', 'Isabela', 'João',
  'Karina', 'Lucas', 'Marina', 'Natália', 'Otávio', 'Paula', 'Quitéria', 'Rafael', 'Sofia', 'Thiago',
  'Ursula', 'Vitória', 'Wagner', 'Yasmin', 'Zélia', 'Adriano', 'Beatriz', 'Caio', 'Daniela', 'Eduardo',
  'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Juliana', 'Kleber', 'Larissa', 'Mateus', 'Nicole', 'Pietro',
];

const LAST_NAMES = [
  'Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Henrique', 'Ibrahim', 'Jesus',
  'Lima', 'Machado', 'Nogueira', 'Oliveira', 'Pereira', 'Queiroz', 'Ramos', 'Souza', 'Teixeira', 'Uchoa',
  'Vieira', 'Xavier', 'Yamada', 'Zanetti', 'Moreira',
];

// 40 first names x 25 surnames = 1000 different clients
const CLIENTS: AutocompleteOption[] = FIRST_NAMES.flatMap((first, i) =>
  LAST_NAMES.map((last, j) => ({ value: 'cli-' + String(i * LAST_NAMES.length + j + 1).padStart(4, '0'), label: first + ' ' + last })),
).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

/** The client being edited in the paged example: on the last page of the list. */
const EDITING = CLIENTS[987];

const PAGE_SIZE = 50;

const plainText = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function askServer(query: string, offset: number, limit: number): Promise<{ items: AutocompleteOption[]; hasMore: boolean }> {
  const q = plainText(query.trim());
  const hits = q ? CLIENTS.filter((c) => plainText(c.label).includes(q)) : CLIENTS;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ items: hits.slice(offset, offset + limit), hasMore: offset + limit < hits.length }), 450);
  });
}

/**
 * What a screen keeps for a list the server searches and pages: the rows so far, whether it is
 * waiting, and whether there is a next page. `startAt` is where the list begins when there is no
 * search (an app whose API can answer "the page around this id" starts there).
 */
function useClientList(limit: number, startAt = 0) {
  const [options, setOptions] = React.useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const ticket = React.useRef(0);

  const fresh = (q: string) => {
    const mine = ++ticket.current;
    setQuery(q);
    setLoading(true);
    askServer(q, q ? 0 : startAt, limit).then((r) => {
      if (mine !== ticket.current) return; // a newer question was asked meanwhile
      setOptions(r.items);
      setHasMore(r.hasMore);
      setLoading(false);
    });
  };
  const more = () => {
    const mine = ++ticket.current;
    setLoading(true);
    askServer(query, (query ? 0 : startAt) + options.length, limit).then((r) => {
      if (mine !== ticket.current) return;
      setOptions((prev) => [...prev, ...r.items]);
      setHasMore(r.hasMore);
      setLoading(false);
    });
  };

  return {
    options,
    loading,
    filter: false as const,
    onSearch: fresh,
    // only while there is a next page: a list that is complete asks for nothing
    onReachEnd: hasMore ? more : undefined,
    onOpenChange: (open: boolean) => {
      if (open && options.length === 0 && !loading) fresh('');
    },
  };
}

const AUTO_CITIES: AutocompleteOption[] = [
  'São Paulo', 'Rio de Janeiro', 'Salvador', 'Brasília', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba',
  'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'São Luís', 'Maceió', 'Natal', 'Teresina', 'Campo Grande',
  'João Pessoa', 'Aracaju', 'Cuiabá', 'Florianópolis', 'Porto Velho', 'Macapá', 'Rio Branco', 'Vitória', 'Palmas', 'Boa Vista',
].map((c) => ({ value: plainText(c).replace(/\s+/g, '-'), label: c }));

function AutocompleteBasico() {
  const [city, setCity] = React.useState<AutocompleteOption | null>(null);
  return (
    <div style={{ maxWidth: 420 }}>
      <Autocomplete label="City" locale="en" options={AUTO_CITIES} value={city} onValueChange={setCity} hint="Type 'sao' and the accent does not matter." />
    </div>
  );
}

function AutocompleteServidor() {
  const [client, setClient] = React.useState<AutocompleteOption | null>(null);
  const list = useClientList(20);
  return (
    <div style={{ maxWidth: 420 }}>
      <Autocomplete
        label="Client"
        locale="en"
        {...list}
        value={client}
        onValueChange={setClient}
        debounce={300}
        hint="The server takes about half a second to answer."
      />
    </div>
  );
}

function AutocompletePaginadoInner({ startAt }: { startAt: number }) {
  const [client, setClient] = React.useState<AutocompleteOption | null>(EDITING);
  const list = useClientList(PAGE_SIZE, startAt);
  return (
    <Autocomplete
      label="Client"
      locale="en"
      {...list}
      value={client}
      onValueChange={setClient}
      hint={'Editing ' + EDITING.label + ', #988 of 1000. Pages of ' + PAGE_SIZE + '.'}
    />
  );
}

function AutocompletePaginado() {
  const [from, setFrom] = React.useState<'first' | 'selected'>('first');
  return (
    <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={row}>
        <Button size="sm" variant={from === 'first' ? 'primary' : 'secondary'} onClick={() => setFrom('first')}>
          List starts at page 1
        </Button>
        <Button size="sm" variant={from === 'selected' ? 'primary' : 'secondary'} onClick={() => setFrom('selected')}>
          List starts at the selected client
        </Button>
      </div>
      {/* a new key is a new list: the rows, the pages and the search start over */}
      <AutocompletePaginadoInner key={from} startAt={from === 'selected' ? Math.floor(987 / PAGE_SIZE) * PAGE_SIZE : 0} />
    </div>
  );
}

function AutocompleteEstados() {
  return (
    <div style={{ maxWidth: 420, ...col }}>
      <Autocomplete label="Loading" locale="en" loading options={[]} hint="Open it: only the loading row." />
      <Autocomplete label="No results" locale="en" options={[]} hint="Open it: nothing to show." />
      <Autocomplete label="Error" locale="en" required error="Choose a client." options={AUTO_CITIES} />
      <Autocomplete label="Disabled" locale="en" disabled defaultValue={AUTO_CITIES[0]} options={AUTO_CITIES} />
    </div>
  );
}

function AutocompleteTamanhos() {
  return (
    <div style={{ maxWidth: 420, ...col }}>
      <Autocomplete label="Field" size="sm" locale="en" options={AUTO_CITIES} />
      <Autocomplete label="Field" size="md" locale="en" options={AUTO_CITIES} />
      <Autocomplete label="Field" size="lg" locale="en" options={AUTO_CITIES} />
    </div>
  );
}

function AutocompleteNoDialog() {
  const [open, setOpen] = React.useState(false);
  const [city, setCity] = React.useState<AutocompleteOption | null>(null);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} size="md" onClose={() => setOpen(false)}>
        <Dialog.Header title="Where is the client?" description="The list opens over the dialog. Esc closes the list first, and the dialog on the next press.">
          <Dialog.Close />
        </Dialog.Header>
        <Dialog.Body>
          <Autocomplete label="City" locale="en" options={AUTO_CITIES} value={city} onValueChange={setCity} />
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

export const autocompleteDemos: Record<string, React.FC> = { basic: AutocompleteBasico, server: AutocompleteServidor, paged: AutocompletePaginado, states: AutocompleteEstados, sizes: AutocompleteTamanhos, 'in-dialog': AutocompleteNoDialog };
