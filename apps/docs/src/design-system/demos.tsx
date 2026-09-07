'use client';

import * as React from 'react';
import {
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck,
  CalendarOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lock,
  Mail,
  Phone,
  Plus,
  Search,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Alert,
  Avatar,
  AvatarUpload,
  Badge,
  Brand,
  BottomNav,
  Button,
  Card,
  Checkbox,
  DateTimePicker,
  Dialog,
  EmptyState,
  FileUpload,
  IconButton,
  Input,
  Radio,
  SearchInput,
  Select,
  SidebarNav,
  type SidebarNavSection,
  Skeleton,
  Stepper,
  Switch,
  Table,
  type TableSort,
  Tabs,
  Textarea,
  Toast,
  TopBar,
} from '@sereno/ui';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };

function ButtonBasico() {
  return (
    <div style={row}>
      <Button>Save</Button>
      <Button variant="accent">Confirm booking</Button>
      <Button variant="secondary">Back</Button>
    </div>
  );
}
function ButtonVariantes() {
  return (
    <div style={row}>
      <Button variant="primary">Primary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
function ButtonSemantic() {
  return (
    <div style={row}>
      <Button variant="success" iconLeft={<Check size={16} strokeWidth={1.75} />}>
        Approve
      </Button>
      <Button variant="warning">Review flags</Button>
      <Button variant="error" iconLeft={<Trash2 size={16} strokeWidth={1.75} />}>
        Delete account
      </Button>
    </div>
  );
}
function ButtonTamanhos() {
  return (
    <div style={{ ...row, alignItems: 'baseline' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">XL</Button>
    </div>
  );
}
function ButtonComIcone() {
  return (
    <div style={row}>
      <Button iconLeft={<Plus size={16} strokeWidth={1.75} />}>New service</Button>
      <Button variant="secondary" iconRight={<ChevronRight size={16} strokeWidth={1.75} />}>
        Next
      </Button>
    </div>
  );
}
function ButtonEstados() {
  return (
    <div style={row}>
      <Button loading>Sending</Button>
      <Button disabled>Unavailable</Button>
    </div>
  );
}
function ButtonFullWidth() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <Button variant="accent" size="lg" fullWidth>
        Confirm booking
      </Button>
    </div>
  );
}

function IconButtonVariantes() {
  return (
    <div style={row}>
      <IconButton label="Back">
        <ChevronLeft size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Search" variant="secondary">
        <Search size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="New" variant="primary">
        <Plus size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
function IconButtonTamanhos() {
  return (
    <div style={row}>
      <IconButton label="Previous" size="sm">
        <ChevronLeft size={16} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Previous" size="md">
        <ChevronLeft size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Previous" size="lg">
        <ChevronLeft size={20} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
function IconButtonSemantic() {
  return (
    <div style={row}>
      <IconButton label="Approve" variant="success">
        <Check size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Flag" variant="warning">
        <Flag size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Delete" variant="error">
        <Trash2 size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}
function IconButtonDesabilitado() {
  return (
    <div style={row}>
      <IconButton label="Back" disabled>
        <ChevronLeft size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Search" variant="secondary" disabled>
        <Search size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="New" variant="primary" disabled>
        <Plus size={18} strokeWidth={1.75} />
      </IconButton>
    </div>
  );
}

function BadgeCiclo() {
  return (
    <div style={row}>
      <Badge tone="success">Confirmed</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="error">Cancelled</Badge>
      <Badge tone="info">Online</Badge>
      <Badge tone="neutral">Completed</Badge>
    </div>
  );
}
function BadgeGenericos() {
  return (
    <div style={row}>
      <Badge tone="info" dot={false}>
        Online
      </Badge>
      <Badge tone="neutral" dot={false}>
        São Paulo
      </Badge>
    </div>
  );
}
function BadgeTamanhos() {
  return (
    <div style={row}>
      <Badge tone="success" size="sm">
        Confirmed
      </Badge>
      <Badge tone="success" size="md">
        Confirmed
      </Badge>
    </div>
  );
}

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--text-primary)',
  margin: 0,
};
const cardText: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  lineHeight: 1.55,
  color: 'var(--text-secondary)',
  margin: '6px 0 0',
};

function CardPadding() {
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      {(['sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} padding={p} style={{ width: 244 }}>
          <Badge tone="neutral" size="sm">
            padding {p}
          </Badge>
          <h4 style={{ ...cardTitle, marginTop: 'var(--space-3)' }}>Weekly summary</h4>
          <p style={cardText}>You saw 18 clients this week — 3 more than last week. Two Friday slots are still open.</p>
        </Card>
      ))}
    </div>
  );
}
function CardElevacao() {
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      {(['none', 'sm', 'md', 'lg'] as const).map((e) => (
        <Card key={e} elevation={e} style={{ width: 216 }}>
          <h4 style={cardTitle}>elevation {e}</h4>
          <p style={cardText}>Short, diffuse shadow. Never stack two levels of it.</p>
        </Card>
      ))}
    </div>
  );
}
function CardInterativo() {
  const [picked, setPicked] = React.useState<string>('year');
  const plans = [
    { id: 'month', name: 'Monthly', price: 'R$ 49 / mo', note: 'Billed every month. Cancel anytime.' },
    { id: 'year', name: 'Yearly', price: 'R$ 39 / mo', note: 'Billed once a year — two months free.' },
  ];
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      {plans.map((p) => (
        <Card key={p.id} interactive selected={picked === p.id} onClick={() => setPicked(p.id)} style={{ width: 256 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <h4 style={cardTitle}>{p.name}</h4>
            {picked === p.id && <Check size={18} color="var(--text-brand)" strokeWidth={2.5} />}
          </div>
          <p style={{ ...cardText, marginTop: 4 }}>{p.note}</p>
          <div
            style={{
              marginTop: 'var(--space-3)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-primary)',
            }}
          >
            {p.price}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AvatarTamanhos() {
  return (
    <div style={{ ...row, alignItems: 'flex-end' }}>
      <Avatar name="Ana Beatriz Ramos" size="xs" />
      <Avatar name="Ana Beatriz Ramos" size="sm" />
      <Avatar name="Ana Beatriz Ramos" size="md" />
      <Avatar name="Ana Beatriz Ramos" size="lg" />
      <Avatar name="Ana Beatriz Ramos" size="xl" />
    </div>
  );
}
function AvatarIniciais() {
  return (
    <div style={row}>
      <Avatar name="Ana Beatriz Ramos" size="lg" />
      <Avatar name="Carlos Dias" size="lg" />
      <Avatar name="Juliana Prado" size="lg" />
    </div>
  );
}
function AvatarStatus() {
  return (
    <div style={row}>
      <Avatar name="Carlos Dias" size="lg" status="confirmed" />
      <Avatar name="Rafael & Bia" size="lg" status="pending" />
      <Avatar name="Helena Costa" size="lg" status="cancelled" />
    </div>
  );
}

function BrandVariantes() {
  return (
    <div style={{ ...row, gap: 32 }}>
      <Brand variant="symbol" size={40} />
      <Brand variant="lockup" size={28} />
      <Brand variant="lockup-vertical" size={40} />
    </div>
  );
}

function BrandMono() {
  return (
    <div style={{ ...row, gap: 32 }}>
      <span style={{ color: 'var(--text-primary)' }}>
        <Brand variant="lockup" size={28} mono />
      </span>
      <span style={{ color: 'var(--text-muted)' }}>
        <Brand variant="lockup" size={28} mono />
      </span>
    </div>
  );
}

function BrandTamanhos() {
  return (
    <div style={{ ...row, alignItems: 'flex-end', gap: 24 }}>
      <Brand variant="symbol" size={16} />
      <Brand variant="symbol" size={24} />
      <Brand variant="symbol" size={32} />
      <Brand variant="symbol" size={48} />
    </div>
  );
}

// ── Table ───────────────────────────────────────────────────────────────────
type Plan = { id: string; name: string; sessions: number; price: string; status: 'success' | 'warning' | 'error' };
const PLAN_ROWS: Plan[] = [
  { id: 'p1', name: 'Marina Alves', sessions: 12, price: 'R$ 2.160', status: 'success' },
  { id: 'p2', name: 'Carlos Dias', sessions: 1, price: 'R$ 180', status: 'warning' },
  { id: 'p3', name: 'Juliana Prado', sessions: 7, price: 'R$ 1.260', status: 'success' },
  { id: 'p4', name: 'Helena Costa', sessions: 3, price: 'R$ 540', status: 'error' },
];
const STATUS_LABEL: Record<Plan['status'], string> = { success: 'Active', warning: 'New', error: 'At risk' };

function TableBasico() {
  return (
    <Table caption="Clients">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell align="right">Total</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {PLAN_ROWS.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">{r.price}</Table.Cell>
            <Table.Cell>
              <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableSortable() {
  const [sort, setSort] = React.useState<TableSort | null>({ key: 'name', direction: 'asc' });
  const rows = React.useMemo(() => {
    if (!sort) return PLAN_ROWS;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...PLAN_ROWS].sort((a, b) => {
      const av = a[sort.key as keyof Plan];
      const bv = b[sort.key as keyof Plan];
      return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'en')) * dir;
    });
  }, [sort]);
  return (
    <Table caption="Clients">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell sortKey="name" sort={sort} onSort={setSort}>Client</Table.HeaderCell>
          <Table.HeaderCell align="right" sortKey="sessions" sort={sort} onSort={setSort}>Sessions</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((r) => (
          <Table.Row key={r.id}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell>
              <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableClicavel() {
  const [selected, setSelected] = React.useState<string | null>('p1');
  return (
    <Table caption="Clients">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell srOnly>Open</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {PLAN_ROWS.map((r) => (
          <Table.Row key={r.id} selected={r.id === selected} onClick={() => setSelected(r.id)}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">
              <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--text-muted)', verticalAlign: 'middle' }} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableCompactSticky() {
  const many = Array.from({ length: 14 }, (_, i) => PLAN_ROWS[i % PLAN_ROWS.length]);
  return (
    <Table caption="Transactions" density="compact" stickyHeader maxHeight={220} zebra>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Client</Table.HeaderCell>
          <Table.HeaderCell align="right">Sessions</Table.HeaderCell>
          <Table.HeaderCell align="right">Total</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {many.map((r, i) => (
          <Table.Row key={i}>
            <Table.Cell>{r.name}</Table.Cell>
            <Table.Cell align="right">{r.sessions}</Table.Cell>
            <Table.Cell align="right">{r.price}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function TableVazia() {
  return (
    <div style={{ ...col, gap: 12 }}>
      <EmptyState icon={<Search size={22} strokeWidth={1.75} />} title="No clients" description="The table has no built-in empty slot — the screen swaps in an EmptyState when there are no rows." />
    </div>
  );
}

const fieldCol: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 };

function InputBasico() {
  return (
    <div style={fieldCol}>
      <Input label="Full name" placeholder="Marina Alves" />
      <Input label="WhatsApp" required hint="We'll send the confirmation here." placeholder="(11) 90000-0000" />
    </div>
  );
}
function InputIconeSufixo() {
  return (
    <div style={fieldCol}>
      <Input label="WhatsApp" iconLeft={<Phone size={16} strokeWidth={1.75} />} placeholder="(11) 90000-0000" />
      <Input label="Duration" suffix="min" defaultValue="50" />
      <Input label="Price" prefix="R$" placeholder="0,00" />
    </div>
  );
}
function InputMascaras() {
  const [phone, setPhone] = React.useState('');
  const [cpf, setCpf] = React.useState('');
  const [cep, setCep] = React.useState('');
  const [price, setPrice] = React.useState('');
  return (
    <div style={fieldCol}>
      <Input label="WhatsApp" mask="phone" iconLeft={<Phone size={16} strokeWidth={1.75} />} placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
      <Input label="CPF" mask="cpf" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.currentTarget.value)} />
      <Input label="CEP" mask="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.currentTarget.value)} />
      <Input label="Price" mask="currency" prefix="R$" placeholder="0,00" value={price} onChange={(e) => setPrice(e.currentTarget.value)} />
    </div>
  );
}
function InputSenha() {
  return (
    <div style={fieldCol}>
      <Input label="Password" type="password" iconLeft={<Lock size={16} strokeWidth={1.75} />} defaultValue="sereno123" />
      <Input label="New password" type="password" hint="At least 8 characters." placeholder="••••••••" />
    </div>
  );
}
function InputContador() {
  const [bio, setBio] = React.useState('Psicóloga clínica, abordagem TCC.');
  return (
    <div style={fieldCol}>
      <Input label="Headline" maxLength={60} value={bio} onChange={(e) => setBio(e.currentTarget.value)} />
    </div>
  );
}
function InputEstados() {
  return (
    <div style={fieldCol}>
      <Input label="Email" iconLeft={<Mail size={16} strokeWidth={1.75} />} error="Enter a valid email." defaultValue="marina@" />
      <Input label="Registration" defaultValue="CRP 06/123456" disabled />
    </div>
  );
}
function InputTamanhos() {
  return (
    <div style={fieldCol}>
      <Input label="Field" size="sm" placeholder="sm" />
      <Input label="Field" size="md" placeholder="md" />
      <Input label="Field" size="lg" placeholder="lg" />
    </div>
  );
}

function TextareaBasico() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea label="Any notes?" rows={3} hint="Optional." placeholder="e.g. first time in therapy." />
    </div>
  );
}
function TextareaErro() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea label="Service description" rows={3} error="The description needs at least 20 characters." defaultValue="Session." />
    </div>
  );
}
function TextareaContador() {
  const [note, setNote] = React.useState('First time in therapy.');
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea label="Any notes?" rows={3} maxLength={140} hint="Optional." value={note} onChange={(e) => setNote(e.currentTarget.value)} />
    </div>
  );
}

const SEL_OPTS = [
  { value: '30 min', label: '30 min' },
  { value: '50 min', label: '50 min' },
  { value: '1h', label: '1 hour' },
];
function SelectBasico() {
  const [v, setV] = React.useState('50 min');
  return (
    <div style={{ maxWidth: 420 }}>
      <Select label="Duration" value={v} onValueChange={setV} options={SEL_OPTS} />
    </div>
  );
}
function SelectHint() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Select
        label="Time zone"
        placeholder="Choose a time zone"
        hint="Used for the times on the public link."
        options={[
          { value: 'sp', label: 'Brasília (GMT-3)' },
          { value: 'mao', label: 'Manaus (GMT-4)' },
        ]}
      />
    </div>
  );
}
function SelectDesabilitado() {
  return (
    <div style={fieldCol}>
      <Select label="Duration" defaultValue="30 min" disabled options={SEL_OPTS} />
      <Select
        label="Plan"
        defaultValue="free"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro (coming soon)', disabled: true },
        ]}
      />
    </div>
  );
}
function SelectTamanhos() {
  return (
    <div style={fieldCol}>
      <Select label="Field" size="sm" defaultValue="30 min" options={SEL_OPTS} />
      <Select label="Field" size="md" defaultValue="30 min" options={SEL_OPTS} />
      <Select label="Field" size="lg" defaultValue="30 min" options={SEL_OPTS} />
    </div>
  );
}
function SelectErro() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Select label="Duration" required placeholder="Pick a duration" error="Choose how long the session lasts." options={SEL_OPTS} />
    </div>
  );
}

function CheckboxBasico() {
  const [a, setA] = React.useState(false);
  const [b, setB] = React.useState(true);
  const [c, setC] = React.useState(true);
  return (
    <div style={col}>
      <Checkbox label="I accept the terms" checked={a} onChange={(e) => setA(e.currentTarget.checked)} />
      <Checkbox label="Subscribe to the newsletter" checked={b} onChange={(e) => setB(e.currentTarget.checked)} />
      <Checkbox
        label="Send me WhatsApp reminders"
        description="Sent 24h and 1h before the session."
        checked={c}
        onChange={(e) => setC(e.currentTarget.checked)}
      />
    </div>
  );
}
function CheckboxEstados() {
  return (
    <div style={col}>
      <Checkbox label="Unavailable on the free plan" disabled />
      <Checkbox label="Included on every plan" disabled defaultChecked />
    </div>
  );
}
const CHANNELS = ['WhatsApp', 'Email', 'SMS'];
function CheckboxIndeterminado() {
  const [on, setOn] = React.useState([true, false, false]);
  const all = on.every(Boolean);
  const none = on.every((v) => !v);
  return (
    <div style={col}>
      <Checkbox label="All channels" checked={all} indeterminate={!all && !none} onChange={(e) => setOn(CHANNELS.map(() => e.target.checked))} />
      <div style={{ ...col, paddingLeft: 32 }}>
        {CHANNELS.map((name, i) => (
          <Checkbox
            key={name}
            label={name}
            checked={on[i]}
            onChange={(e) => {
              const v = e.target.checked;
              setOn((s) => s.map((old, j) => (j === i ? v : old)));
            }}
          />
        ))}
      </div>
    </div>
  );
}
function CheckboxTamanhos() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(true);
  return (
    <div style={col}>
      <Checkbox size="sm" label="Small (16px)" checked={a} onChange={(e) => setA(e.currentTarget.checked)} />
      <Checkbox label="Medium (20px, default)" checked={b} onChange={(e) => setB(e.currentTarget.checked)} />
    </div>
  );
}
function CheckboxGrupo() {
  const OPTS = ['Psychology', 'Nutrition', 'Physiotherapy', 'Speech therapy'];
  const [sel, setSel] = React.useState<string[]>(['Psychology', 'Nutrition']);
  const toggle = (o: string) => setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, ...col }}>
      <legend
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-2xs)',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}
      >
        Filter by specialty
      </legend>
      {OPTS.map((o) => (
        <Checkbox key={o} label={o} checked={sel.includes(o)} onChange={() => toggle(o)} />
      ))}
    </fieldset>
  );
}

function RadioVertical() {
  const [v, setV] = React.useState('online');
  return (
    <div style={col}>
      <Radio name="fmt-v" label="Online" description="By video call." checked={v === 'online'} onChange={() => setV('online')} />
      <Radio name="fmt-v" label="In person" description="At the office, in Pinheiros." checked={v === 'inperson'} onChange={() => setV('inperson')} />
      <Radio name="fmt-v" label="Hybrid" description="First session in person, the rest online." checked={v === 'hybrid'} onChange={() => setV('hybrid')} />
    </div>
  );
}
function RadioHorizontal() {
  const [v, setV] = React.useState('30');
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', width: '100%' }}>
      {['30', '45', '60'].map((m) => (
        <Radio key={m} name="dur-h" label={`${m} min`} checked={v === m} onChange={() => setV(m)} />
      ))}
    </div>
  );
}
function RadioEstados() {
  return (
    <div style={col}>
      <Radio name="plan-d" label="Free" defaultChecked />
      <Radio name="plan-d" label="Pro — coming soon" disabled />
      <Radio name="plan2-d" label="Locked selection" disabled defaultChecked />
    </div>
  );
}
function RadioTamanhos() {
  const [v, setV] = React.useState('a');
  return (
    <div style={col}>
      <Radio name="sz" size="sm" label="Small (16px)" checked={v === 'a'} onChange={() => setV('a')} />
      <Radio name="sz" label="Medium (20px, default)" checked={v === 'b'} onChange={() => setV('b')} />
    </div>
  );
}

function SwitchBasico() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(false);
  return (
    <div style={{ ...col, maxWidth: 360 }}>
      <Switch label="24h reminder" checked={a} onChange={(e) => setA(e.target.checked)} />
      <Switch label="Daily email digest" description="Sent at 7am with the day's agenda." checked={b} onChange={(e) => setB(e.target.checked)} />
    </div>
  );
}
function SwitchSettings() {
  const [s, setS] = React.useState({ online: true, whats: true, reminders: false, digest: false });
  const set = (k: keyof typeof s) => (e: { target: { checked: boolean } }) => setS((v) => ({ ...v, [k]: e.target.checked }));
  return (
    <div style={{ ...col, gap: 20, maxWidth: 420 }}>
      <Switch label="Accept online bookings" description="Your public link takes new appointments." checked={s.online} onChange={set('online')} />
      <Switch label="WhatsApp notifications" description="A message on every new booking or cancellation." checked={s.whats} onChange={set('whats')} />
      <Switch label="Client reminders" description="Sent to the client 24h and 1h before." checked={s.reminders} onChange={set('reminders')} />
      <Switch label="Daily agenda email" description="At 7am, the day's appointments." checked={s.digest} onChange={set('digest')} />
    </div>
  );
}
function SwitchEstados() {
  return (
    <div style={{ ...col, maxWidth: 360 }}>
      <Switch label="Paid-plan feature (off)" disabled />
      <Switch label="Locked on" checked disabled />
    </div>
  );
}
function SwitchTamanhos() {
  const [a, setA] = React.useState(true);
  const [b, setB] = React.useState(true);
  return (
    <div style={{ ...col, maxWidth: 360 }}>
      <Switch size="sm" label="Small track" checked={a} onChange={(e) => setA(e.target.checked)} />
      <Switch label="Medium track (default)" checked={b} onChange={(e) => setB(e.target.checked)} />
    </div>
  );
}

function FileUploadBasico() {
  const [f, setF] = React.useState<File | null>(null);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Attachment" hint="PDF or image, up to 5 MB." accept="image/*,.pdf" value={f} onChange={setF} />
    </div>
  );
}
function FileUploadAvatar() {
  const [f, setF] = React.useState<File | null>(null);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Logo" hint="Square PNG, transparent background." shape="circle" value={f} onChange={setF} />
    </div>
  );
}
function FileUploadErro() {
  const [f, setF] = React.useState<File | null>(null);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Logo" hint="PNG only, up to 1 MB." accept="image/png" maxSizeMB={1} value={f} onChange={setF} />
    </div>
  );
}
function FileUploadMultiplo() {
  const [files, setFiles] = React.useState<File[]>([]);
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Portfolio" hint="Up to 5 MB each." multiple accept="image/*" value={files} onChange={setFiles} />
    </div>
  );
}
function FileUploadDesabilitado() {
  return (
    <div style={{ maxWidth: 440 }}>
      <FileUpload label="Attachment" hint="Locked on the free plan." disabled />
    </div>
  );
}

function AvatarUploadBasico() {
  const [photo, setPhoto] = React.useState<File | null>(null);
  return <AvatarUpload label="Profile photo" name="Ana Beatriz Ramos" value={photo} onChange={setPhoto} />;
}
function AvatarUploadExistente() {
  const [photo, setPhoto] = React.useState<File | string | null>(
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%237C83E8"/><stop offset="1" stop-color="%232FBFA8"/></linearGradient></defs><rect width="200" height="200" fill="url(%23g)"/></svg>',
      ),
  );
  return <AvatarUpload label="Profile photo" name="Marcos Lima" value={photo} onChange={(f) => setPhoto(f)} />;
}
function AvatarUploadTamanhos() {
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <AvatarUpload name="Ana Beatriz" size={64} />
      <AvatarUpload name="Ana Beatriz" size={96} />
      <AvatarUpload name="Ana Beatriz" size={128} />
    </div>
  );
}
function AvatarUploadDesabilitado() {
  return <AvatarUpload label="Profile photo" name="Ana Beatriz Ramos" disabled />;
}

const PEOPLE = ['Emma Johnson', 'James Smith', 'Olivia Brown', 'Michael Davis', 'Sophia Wilson', 'William Miller'];
function SearchInputBasico() {
  const [last, setLast] = React.useState('');
  return (
    <div style={{ ...fieldCol, gap: 8 }}>
      <SearchInput placeholder="Search clients" onSearch={setLast} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>onSearch: {last ? `"${last}"` : '—'}</span>
    </div>
  );
}
function SearchInputLive() {
  const [q, setQ] = React.useState('');
  const rows = q ? PEOPLE.filter((p) => p.toLowerCase().includes(q.toLowerCase())) : PEOPLE;
  return (
    <div style={{ ...fieldCol, gap: 12 }}>
      <SearchInput placeholder="Filter names" onSearch={setQ} />
      {rows.length === 0 ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Nothing for “{q}”.</span>
      ) : (
        <div style={col}>
          {rows.map((p) => (
            <span key={p} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
function SearchInputTamanhos() {
  return (
    <div style={fieldCol}>
      <SearchInput size="sm" placeholder="Search" />
      <SearchInput size="md" placeholder="Search" />
      <SearchInput size="lg" placeholder="Search" />
    </div>
  );
}
function SearchInputDesabilitado() {
  return (
    <div style={fieldCol}>
      <SearchInput placeholder="Search" defaultValue="emma johnson" disabled />
    </div>
  );
}

// Weekend day-numbers for a month — the examples strike those through so the
// pattern stays meaningful as you navigate (recomputed via `onMonthChange`).
const weekendsOf = (y: number, m: number) =>
  Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1).filter((d) => {
    const wd = new Date(y, m, d).getDay();
    return wd === 0 || wd === 6;
  });

function DateTimeCalendario() {
  const [day, setDay] = React.useState<number | undefined>(14);
  const [off, setOff] = React.useState(() => weekendsOf(2026, 7));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        unavailable={off}
        onMonthChange={(y, m) => setOff(weekendsOf(y, m))}
        selectedDate={day}
        onSelectDate={setDay}
      />
    </div>
  );
}
// A full working day at 30-min steps, lunch (12:00–13:00) taken.
const DAY_SLOTS = Array.from({ length: 22 }, (_, i) => {
  const mins = 8 * 60 + i * 30;
  const value = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${mins % 60 === 0 ? '00' : '30'}`;
  return ['12:00', '12:30', '13:00', '16:30'].includes(value) ? { value, disabled: true } : value;
});

function DateTimeComHorarios() {
  const [day, setDay] = React.useState<number | undefined>(14);
  const [time, setTime] = React.useState<string | undefined>('10:00');
  const [off, setOff] = React.useState(() => weekendsOf(2026, 7));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        unavailable={off}
        onMonthChange={(y, m) => setOff(weekendsOf(y, m))}
        times={DAY_SLOTS}
        selectedDate={day}
        selectedTime={time}
        onSelectDate={setDay}
        onSelectTime={setTime}
      />
    </div>
  );
}

// Deterministic sample booking counts for a month — weekdays only, and only
// from a fixed "today" forward, so `renderDay` scoping is visible.
const DEMO_TODAY = { y: 2026, m: 7, d: 14 };
const bookingCountsOf = (y: number, m: number): Record<number, number> => {
  const out: Record<number, number> = {};
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const future = y > DEMO_TODAY.y || (y === DEMO_TODAY.y && (m > DEMO_TODAY.m || (m === DEMO_TODAY.m && d >= DEMO_TODAY.d)));
    const wd = new Date(y, m, d).getDay();
    if (future && wd !== 0 && wd !== 6) out[d] = ((d * 7 + m * 3) % 5) + 1;
  }
  return out;
};

function DateTimeRenderDay() {
  const [day, setDay] = React.useState<number | undefined>(18);
  const [counts, setCounts] = React.useState(() => bookingCountsOf(2026, 7));
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        onMonthChange={(y, m) => setCounts(bookingCountsOf(y, m))}
        renderDay={(d) =>
          counts[d] ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 15,
                height: 13,
                padding: '0 4px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
                // soft accent chip — legible on white and on the selected day
                background: 'var(--bg-accent-soft)',
                color: 'var(--text-accent)',
              }}
            >
              {counts[d]}
            </span>
          ) : null
        }
        selectedDate={day}
        onSelectDate={setDay}
      />
    </div>
  );
}

// A phone-screen frame — the bars sit flush to its edges, so their border reads
// as an in-screen divider, not a broken frame edge.
// A phone-screen frame. box-shadow for the outline (a real border + radius +
// overflow:hidden seams at the corners); no overflow clip — instead the first
// and last child are rounded to match, so an edge-to-edge bar's divider still
// meets the outline cleanly.
const R = 'var(--radius-card)';
function PhoneFrame({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const kids = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ style?: React.CSSProperties }>[];
  return (
    <div style={{ maxWidth: 420, borderRadius: R, boxShadow: '0 0 0 1px var(--border-default)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', ...style }}>
      {kids.map((child, i) =>
        React.cloneElement(child, {
          style: {
            ...(child.props.style || {}),
            ...(i === 0 && { borderTopLeftRadius: R, borderTopRightRadius: R }),
            ...(i === kids.length - 1 && { borderBottomLeftRadius: R, borderBottomRightRadius: R }),
          },
        }),
      )}
    </div>
  );
}
const screenBody: React.CSSProperties = {
  padding: 'var(--space-5)',
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  background: 'var(--bg-surface)',
};
function BodyLines() {
  return (
    <>
      <span style={{ width: '70%', height: 10, borderRadius: 4, background: 'var(--bg-subtle)' }} />
      <span style={{ width: '90%', height: 10, borderRadius: 4, background: 'var(--bg-subtle)' }} />
      <span style={{ width: '55%', height: 10, borderRadius: 4, background: 'var(--bg-subtle)' }} />
    </>
  );
}

function TopBarBasico() {
  return (
    <PhoneFrame>
      <TopBar
        title="Your details"
        sticky={false}
        leading={
          <IconButton label="Back">
            <ChevronLeft size={18} strokeWidth={1.75} />
          </IconButton>
        }
      />
      <div style={screenBody}>
        <BodyLines />
      </div>
    </PhoneFrame>
  );
}
function TopBarCompleto() {
  return (
    <PhoneFrame>
      <TopBar
        title="Pick a time"
        subtitle="Therapy session"
        sticky={false}
        leading={
          <IconButton label="Back">
            <ChevronLeft size={18} strokeWidth={1.75} />
          </IconButton>
        }
        actions={
          <IconButton label="Notifications">
            <Bell size={18} strokeWidth={1.75} />
          </IconButton>
        }
      />
      <div style={screenBody}>
        <BodyLines />
      </div>
    </PhoneFrame>
  );
}
function TopBarTransparente() {
  return (
    <PhoneFrame style={{ background: 'var(--bg-brand-soft)' }}>
      <TopBar
        transparent
        sticky={false}
        leading={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>Sereno</span>}
        actions={
          <IconButton label="Share" variant="secondary">
            <Share2 size={18} strokeWidth={1.75} />
          </IconButton>
        }
      />
      <div style={{ ...screenBody, background: 'var(--bg-brand-soft)' }}>
        <BodyLines />
      </div>
    </PhoneFrame>
  );
}

const TAB_ITEMS = [
  { value: 'agenda', label: 'Calendar' },
  { value: 'clientes', label: 'Clients' },
  { value: 'servicos', label: 'Services' },
];
const tabPanel: React.CSSProperties = {
  marginTop: 'var(--space-4)',
  padding: 'var(--space-4)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-subtle)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-secondary)',
};
function labelOf(items: { value: string; label: string }[], v: string) {
  return items.find((i) => i.value === v)?.label ?? v;
}
function TabsUnderline() {
  const [v, setV] = React.useState('agenda');
  return (
    <div>
      <Tabs value={v} onChange={setV} items={TAB_ITEMS} />
      <div style={tabPanel}>The “{labelOf(TAB_ITEMS, v)}” section — your screen renders this, keyed off the active value.</div>
    </div>
  );
}
function TabsPill() {
  const items = [
    { value: 'today', label: 'Today', count: 5 },
    { value: 'semana', label: 'Week', count: 23 },
    { value: 'mes', label: 'Month' },
  ];
  const [v, setV] = React.useState('today');
  return (
    <div>
      <Tabs variant="pill" value={v} onChange={setV} items={items} />
      <div style={tabPanel}>Showing: {labelOf(items, v)}</div>
    </div>
  );
}
function TabsFullWidth() {
  const [v, setV] = React.useState('agenda');
  return (
    <div style={{ maxWidth: 360 }}>
      <Tabs fullWidth value={v} onChange={setV} items={TAB_ITEMS} />
      <div style={tabPanel}>{labelOf(TAB_ITEMS, v)}</div>
    </div>
  );
}
const MANY_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'agenda', label: 'Calendar' },
  { value: 'clientes', label: 'Clients' },
  { value: 'servicos', label: 'Services' },
  { value: 'financeiro', label: 'Billing' },
  { value: 'relatorios', label: 'Reports' },
  { value: 'integracoes', label: 'Integrations' },
  { value: 'config', label: 'Settings' },
];
function TabsOverflow() {
  const [v, setV] = React.useState('overview');
  return (
    <div style={{ maxWidth: 380 }}>
      <Tabs value={v} onChange={setV} items={MANY_TABS} />
      <div style={tabPanel}>{labelOf(MANY_TABS, v)}</div>
    </div>
  );
}

function BottomNavBasico() {
  const [tab, setTab] = React.useState('agenda');
  const items = [
    { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} strokeWidth={1.75} /> },
    { value: 'clientes', label: 'Clients', icon: <Users size={22} strokeWidth={1.75} /> },
    { value: 'servicos', label: 'Services', icon: <Sparkles size={22} strokeWidth={1.75} /> },
  ];
  return (
    <PhoneFrame>
      <div style={{ ...screenBody, minHeight: 140 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{labelOf(items, tab)}</span>
        <BodyLines />
      </div>
      <BottomNav value={tab} onChange={setTab} items={items} />
    </PhoneFrame>
  );
}
function BottomNavBadge() {
  const [tab, setTab] = React.useState('agenda');
  const items = [
    { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} strokeWidth={1.75} /> },
    { value: 'clientes', label: 'Clients', icon: <Users size={22} strokeWidth={1.75} />, badge: true },
    { value: 'search', label: 'Search', icon: <Search size={22} strokeWidth={1.75} /> },
  ];
  return (
    <PhoneFrame>
      <div style={{ ...screenBody, minHeight: 140 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{labelOf(items, tab)}</span>
        <BodyLines />
      </div>
      <BottomNav value={tab} onChange={setTab} items={items} />
    </PhoneFrame>
  );
}

const SIDE_SECTIONS: SidebarNavSection[] = [
  {
    label: 'Workspace',
    items: [
      { value: 'agenda', label: 'Calendar', icon: <Calendar size={18} strokeWidth={1.75} /> },
      { value: 'clients', label: 'Clients', icon: <Users size={18} strokeWidth={1.75} />, count: 12 },
      { value: 'services', label: 'Services', icon: <Sparkles size={18} strokeWidth={1.75} /> },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        value: 'finance',
        label: 'Finance',
        icon: <Wallet size={18} strokeWidth={1.75} />,
        children: [
          { value: 'finance:incoming', label: 'Incoming' },
          { value: 'finance:payouts', label: 'Payouts', count: 3 },
          { value: 'finance:invoices', label: 'Invoices' },
        ],
      },
      { value: 'reports', label: 'Reports', icon: <BarChart3 size={18} strokeWidth={1.75} /> },
    ],
  },
  {
    label: 'Account',
    items: [{ value: 'settings', label: 'Settings', icon: <Settings size={18} strokeWidth={1.75} /> }],
  },
];

function SideFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        height: 460,
        maxWidth: 640,
        borderRadius: R,
        boxShadow: '0 0 0 1px var(--border-default)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
      }}
    >
      {children}
    </div>
  );
}
function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: compact ? 18 : 20, letterSpacing: '-0.03em', color: 'var(--text-brand)' }}>
      {compact ? 'S' : 'Sereno'}
    </span>
  );
}
function SideUser() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0 var(--space-1)' }}>
      <Avatar name="Emma Johnson" size="sm" />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Emma Johnson
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>Owner</span>
      </div>
    </div>
  );
}
function SidePane({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--bg-canvas)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
      <BodyLines />
    </div>
  );
}
function sidePaneLabel(v: string) {
  for (const it of SIDE_SECTIONS.flatMap((s) => s.items)) {
    if (it.value === v) return it.label;
    const sub = it.children?.find((c) => c.value === v);
    if (sub) return `${it.label} · ${sub.label}`;
  }
  return v;
}
function SidebarNavBasico() {
  const [view, setView] = React.useState('finance:payouts');
  return (
    <SideFrame>
      <SidebarNav collapsible={false} value={view} onChange={setView} header={<Wordmark />} sections={SIDE_SECTIONS} />
      <SidePane label={sidePaneLabel(view)} />
    </SideFrame>
  );
}
function SidebarNavColapsavel() {
  const [view, setView] = React.useState('agenda');
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SideFrame>
      <SidebarNav
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        labels={{ expand: 'Expand', collapse: 'Collapse' }}
        value={view}
        onChange={setView}
        header={<Wordmark compact={collapsed} />}
        footer={<SideUser />}
        sections={SIDE_SECTIONS}
      />
      <SidePane label={sidePaneLabel(view)} />
    </SideFrame>
  );
}

const STEP_ITEMS = [
  { value: 'perfil', label: 'Your profile' },
  { value: 'servico', label: 'First service' },
  { value: 'grade', label: 'Your schedule' },
  { value: 'review', label: 'Review & finish' },
];
function StepperWizard({ variant, clickable }: { variant?: 'bar' | 'dots'; clickable?: boolean }) {
  const [step, setStep] = React.useState(0);
  const last = STEP_ITEMS.length - 1;
  return (
    <div style={{ ...col, maxWidth: variant === 'dots' ? 340 : 460 }}>
      <Stepper steps={STEP_ITEMS} current={step} variant={variant} onStepClick={clickable ? setStep : undefined} />
      <div
        style={{
          marginTop: 'var(--space-1)',
          padding: 'var(--space-4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          minHeight: 92,
        }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
          {STEP_ITEMS[step].label}
        </span>
        <BodyLines />
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button size="sm" variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setStep((s) => (s === last ? 0 : s + 1))}>
          {step === last ? 'Start over' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
function StepperBar() {
  return <StepperWizard variant="bar" />;
}
function StepperDots() {
  return <StepperWizard variant="dots" />;
}
function StepperClicavel() {
  return <StepperWizard variant="bar" clickable />;
}

function AlertTons() {
  return (
    <div style={{ ...col, maxWidth: 520 }}>
      <Alert tone="info" title="You've used 18 of 20 bookings this month" icon={<Bell size={18} strokeWidth={1.75} />}>
        On the free plan the limit resets on the 1st.
      </Alert>
      <Alert tone="warning" title="Your schedule isn't set up" icon={<CalendarOff size={18} strokeWidth={1.75} />}>
        Without a schedule, your public link shows no times.
      </Alert>
      <Alert tone="error" title="The last charge failed" icon={<CalendarOff size={18} strokeWidth={1.75} />}>
        Update your payment method to keep the subscription.
      </Alert>
    </div>
  );
}
function AlertComAcao() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Alert
        tone="warning"
        title="Your schedule isn't set up"
        icon={<CalendarOff size={18} strokeWidth={1.75} />}
        action={<Button size="sm">Set up now</Button>}
      >
        Without a schedule, your public link shows no times.
      </Alert>
    </div>
  );
}
function AlertDispensavel() {
  const [shown, setShown] = React.useState(true);
  return (
    <div style={{ maxWidth: 520 }}>
      {shown ? (
        <Alert tone="info" title="Novidade" onDismiss={() => setShown(false)}>
          You can now export your clients as CSV.
        </Alert>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setShown(true)}>
          Show again
        </Button>
      )}
    </div>
  );
}

function ToastTons() {
  return (
    <div style={{ ...col, maxWidth: 420 }}>
      <Toast tone="success" title="Booking cancelled" description="The client was notified via WhatsApp." icon={<Check size={18} strokeWidth={1.75} />} />
      <Toast tone="neutral" title="Link copied" />
    </div>
  );
}
function ToastComAcao() {
  const [toast, setToast] = React.useState(true);
  return (
    <div style={{ maxWidth: 420 }}>
      {toast ? (
        <Toast
          tone="success"
          title="Service removed"
          action={
            <Button variant="link" size="sm">
              Undo
            </Button>
          }
          onClose={() => setToast(false)}
        />
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setToast(true)}>
          Show again
        </Button>
      )}
    </div>
  );
}

function DialogCenter() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        title="Cancel booking?"
        description="The client will be notified via WhatsApp and the slot frees up."
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Back
            </Button>
            <Button variant="error" onClick={() => setOpen(false)}>
              Cancel booking
            </Button>
          </>
        }
      />
    </div>
  );
}
function DialogSheet() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open sheet</Button>
      <Dialog
        open={open}
        variant="sheet"
        title="Filter calendar"
        description="Choose the period and the booking status."
        onClose={() => setOpen(false)}
        footer={
          <Button variant="accent" onClick={() => setOpen(false)}>
            Apply
          </Button>
        }
      />
    </div>
  );
}

const DIALOG_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
function DialogSizes() {
  const [size, setSize] = React.useState<(typeof DIALOG_SIZES)[number] | null>(null);
  return (
    <div style={row}>
      {DIALOG_SIZES.map((s) => (
        <Button key={s} variant="secondary" onClick={() => setSize(s)}>
          {s}
        </Button>
      ))}
      <Dialog
        open={size !== null}
        size={size ?? 'sm'}
        title={`size="${size ?? 'sm'}"`}
        description="The centered modal caps at a fixed max-width per size and still shrinks to fit narrow screens."
        onClose={() => setSize(null)}
        footer={
          <Button variant="secondary" onClick={() => setSize(null)}>
            Close
          </Button>
        }
      />
    </div>
  );
}

function DialogDividers() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        dividers
        showClose
        size="md"
        title="Terms of service"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Decline
            </Button>
            <Button onClick={() => setOpen(false)}>Accept</Button>
          </>
        }
      >
        <div style={{ ...col, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <p key={i} style={{ margin: 0 }}>
              {i + 1}. Cras mattis consectetur purus sit amet fermentum. Morbi leo risus, porta ac
              consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl
              consectetur et. Donec ullamcorper nulla non metus auctor fringilla.
            </p>
          ))}
        </div>
      </Dialog>
    </div>
  );
}

function DialogForm() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>New booking</Button>
      <Dialog
        open={open}
        showClose
        size="md"
        title="New booking"
        description="Forms sit inside a Dialog without ceremony — inputs, selects and checkboxes all work."
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Create</Button>
          </>
        }
      >
        <div style={col}>
          <Input label="Client" placeholder="Full name" />
          <Select
            label="Service"
            placeholder="Pick one"
            options={[
              { value: 'assessment', label: 'First assessment (60 min)' },
              { value: 'session', label: 'Therapy session (50 min)' },
              { value: 'followup', label: 'Follow-up (30 min)' },
            ]}
          />
          <Select
            label="Professional"
            placeholder="Pick one"
            options={[
              'Ana Beatriz Ramos',
              'Bruno Katsumata',
              'Carla Nogueira',
              'Diego Martins',
              'Elisa Fontanella',
              'Helena Prado',
              'Igor Salvatori',
              'Júlia Menezes',
              'Lucas Andrade',
              'Marina Okafor',
              'Nina Vasconcelos',
              'Otávio Ribeiro',
              'Paula Sciarra',
              'Rafael Bittencourt',
            ].map((n) => ({ value: n.toLowerCase().split(' ')[0], label: n }))}
          />
          <Checkbox label="Notify the client on WhatsApp" defaultChecked />
        </div>
      </Dialog>
    </div>
  );
}

function DialogFullscreen() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open full screen</Button>
      <Dialog
        open={open}
        variant="fullscreen"
        dividers
        title="Edit availability"
        description="Fills the viewport — for immersive, multi-section flows on any screen size."
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Discard
            </Button>
            <Button onClick={() => setOpen(false)}>Save changes</Button>
          </>
        }
      >
        <div style={{ ...col, maxWidth: 560 }}>
          <Input label="Working hours" placeholder="09:00 – 18:00" />
          <Select
            label="Days off"
            placeholder="Pick days"
            options={[
              { value: 'sat', label: 'Saturday' },
              { value: 'sun', label: 'Sunday' },
              { value: 'mon', label: 'Monday' },
            ]}
          />
          <Input label="Notes" placeholder="Visible to clients" />
        </div>
      </Dialog>
    </div>
  );
}

function SkeletonVariantes() {
  return (
    <div style={{ ...col, maxWidth: 460 }}>
      <Skeleton variant="text" />
      <Skeleton variant="card" />
      <div style={row}>
        <Skeleton variant="avatar" />
        <Skeleton variant="block" width={220} height={64} />
      </div>
    </div>
  );
}
function SkeletonLinhas() {
  return (
    <div style={{ ...col, maxWidth: 460 }}>
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="block" width={220} height={64} />
    </div>
  );
}

function EmptyStateBasico() {
  return (
    <div style={{ maxWidth: 460 }}>
      <EmptyState icon={<CalendarCheck size={22} strokeWidth={1.75} />} title="No bookings today" description="A good time to review your services." />
    </div>
  );
}
function EmptyStateComAcao() {
  return (
    <div style={{ maxWidth: 460 }}>
      <EmptyState
        icon={<Users size={22} strokeWidth={1.75} />}
        title="No clients yet"
        description="Your clients show up here after the first booking."
        action={<Button size="sm">Share my link</Button>}
      />
    </div>
  );
}
function EmptyStateCompact() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Card padding="none">
        <EmptyState compact icon={<BarChart3 size={22} strokeWidth={1.75} />} title="Reports coming soon" description="Revenue and occupancy charts aren't defined yet." />
      </Card>
    </div>
  );
}

/**
 * Live demos keyed by component slug, then by example id (matching `Example.id`
 * in catalog.ts).
 */
export const DEMOS: Record<string, Record<string, React.FC>> = {
  button: {
    basic: ButtonBasico,
    variants: ButtonVariantes,
    semantic: ButtonSemantic,
    sizes: ButtonTamanhos,
    'with-icon': ButtonComIcone,
    states: ButtonEstados,
    'full-width': ButtonFullWidth,
  },
  'icon-button': {
    variants: IconButtonVariantes,
    semantic: IconButtonSemantic,
    sizes: IconButtonTamanhos,
    disabled: IconButtonDesabilitado,
  },
  badge: { tones: BadgeCiclo, labels: BadgeGenericos, sizes: BadgeTamanhos },
  card: { padding: CardPadding, elevation: CardElevacao, interactive: CardInterativo },
  avatar: { sizes: AvatarTamanhos, 'initials-photo': AvatarIniciais, status: AvatarStatus },
  brand: { variants: BrandVariantes, mono: BrandMono, sizes: BrandTamanhos },
  table: { basic: TableBasico, sortable: TableSortable, interactive: TableClicavel, 'compact-sticky': TableCompactSticky, empty: TableVazia },
  input: {
    basic: InputBasico,
    'icon-suffix': InputIconeSufixo,
    masked: InputMascaras,
    password: InputSenha,
    count: InputContador,
    states: InputEstados,
    sizes: InputTamanhos,
  },
  textarea: { basic: TextareaBasico, count: TextareaContador, error: TextareaErro },
  select: { basic: SelectBasico, placeholder: SelectHint, error: SelectErro, disabled: SelectDesabilitado, sizes: SelectTamanhos },
  checkbox: {
    basic: CheckboxBasico,
    states: CheckboxEstados,
    indeterminate: CheckboxIndeterminado,
    sizes: CheckboxTamanhos,
    group: CheckboxGrupo,
  },
  radio: { vertical: RadioVertical, horizontal: RadioHorizontal, states: RadioEstados, sizes: RadioTamanhos },
  switch: { basic: SwitchBasico, settings: SwitchSettings, states: SwitchEstados, sizes: SwitchTamanhos },
  'file-upload': {
    basic: FileUploadBasico,
    avatar: FileUploadAvatar,
    multiple: FileUploadMultiplo,
    error: FileUploadErro,
    disabled: FileUploadDesabilitado,
  },
  'avatar-upload': {
    basic: AvatarUploadBasico,
    existing: AvatarUploadExistente,
    sizes: AvatarUploadTamanhos,
    disabled: AvatarUploadDesabilitado,
  },
  'search-input': {
    basic: SearchInputBasico,
    live: SearchInputLive,
    sizes: SearchInputTamanhos,
    disabled: SearchInputDesabilitado,
  },
  'date-time-picker': { calendar: DateTimeCalendario, 'render-day': DateTimeRenderDay, 'with-times': DateTimeComHorarios },
  'top-bar': { basic: TopBarBasico, full: TopBarCompleto, transparent: TopBarTransparente },
  tabs: { underline: TabsUnderline, pill: TabsPill, 'full-width': TabsFullWidth, overflow: TabsOverflow },
  'bottom-nav': { basic: BottomNavBasico, 'with-badge': BottomNavBadge },
  'sidebar-nav': { basic: SidebarNavBasico, collapsible: SidebarNavColapsavel },
  stepper: { bar: StepperBar, dots: StepperDots, clickable: StepperClicavel },
  alert: { tones: AlertTons, 'with-action': AlertComAcao, dismissible: AlertDispensavel },
  toast: { tones: ToastTons, 'with-action': ToastComAcao },
  dialog: {
    center: DialogCenter,
    sheet: DialogSheet,
    sizes: DialogSizes,
    dividers: DialogDividers,
    form: DialogForm,
    fullscreen: DialogFullscreen,
  },
  skeleton: { variants: SkeletonVariantes, lines: SkeletonLinhas },
  'empty-state': { basic: EmptyStateBasico, 'with-action': EmptyStateComAcao, compact: EmptyStateCompact },
};
