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
  MoreVertical,
  Phone,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Alert,
  AppointmentCard,
  Avatar,
  Badge,
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
  ProfessionalCard,
  Radio,
  ServiceCard,
  Select,
  Skeleton,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  Toast,
  TopBar,
  WeeklyScheduleEditor,
  type WeekSchedule,
} from '@/components';
import { DEFAULT_WEEK } from '@/lib/mock';

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

function CardPadding() {
  return (
    <div style={row}>
      <Card padding="sm">sm</Card>
      <Card padding="md">md</Card>
      <Card padding="lg">lg</Card>
    </div>
  );
}
function CardElevacao() {
  return (
    <div style={row}>
      <Card elevation="none">none</Card>
      <Card elevation="sm">sm</Card>
      <Card elevation="md">md</Card>
      <Card elevation="lg">lg</Card>
    </div>
  );
}
function CardInterativo() {
  const [picked, setPicked] = React.useState(false);
  return (
    <div style={{ ...row, alignItems: 'stretch' }}>
      <Card interactive style={{ minWidth: 160 }}>
        Hover me
      </Card>
      <Card interactive selected={picked} onClick={() => setPicked((v) => !v)} style={{ minWidth: 160 }}>
        {picked ? 'Selected' : 'Click to select'}
      </Card>
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
      <FileUpload label="Profile photo" hint="A square image works best." shape="circle" value={f} onChange={setF} />
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
      <FileUpload label="Profile photo" hint="Locked on the free plan." shape="circle" disabled />
    </div>
  );
}

function DateTimeCalendario() {
  const [day, setDay] = React.useState<number | undefined>(14);
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker year={2026} month={7} unavailable={[1, 2, 8, 9, 15, 16, 22, 23, 29, 30]} selectedDate={day} onSelectDate={setDay} />
    </div>
  );
}
function DateTimeComHorarios() {
  const [day, setDay] = React.useState<number | undefined>(14);
  const [time, setTime] = React.useState<string | undefined>('10:00');
  return (
    <div style={{ maxWidth: 380 }}>
      <DateTimePicker
        year={2026}
        month={7}
        unavailable={[1, 2, 8, 9, 15, 16, 22, 23, 29, 30]}
        times={['09:00', '10:00', { value: '11:00', disabled: true }, '14:00', '15:00', '16:00']}
        selectedDate={day}
        selectedTime={time}
        onSelectDate={setDay}
        onSelectTime={setTime}
      />
    </div>
  );
}

function ServiceCardBasico() {
  return (
    <div style={{ maxWidth: 460 }}>
      <ServiceCard name="Therapy session" duration="50 min" price="R$ 180" tag="Online" description="One-on-one session by video." />
    </div>
  );
}
function ServiceCardSelectable() {
  const [id, setId] = React.useState('psi');
  return (
    <div style={{ ...col, maxWidth: 460 }}>
      <ServiceCard name="Therapy session" duration="50 min" price="R$ 180" selected={id === 'psi'} onSelect={() => setId('psi')} />
      <ServiceCard name="First consultation" duration="1h" price="R$ 220" selected={id === 'aval'} onSelect={() => setId('aval')} />
    </div>
  );
}

function ProfessionalCardBasico() {
  return (
    <div style={{ maxWidth: 480 }}>
      <ProfessionalCard name="Ana Beatriz Ramos" specialty="Clinical psychologist" credential="CRP 06/123456" location="São Paulo" rating="4,9 (128)" />
    </div>
  );
}
function ProfessionalCardComAcao() {
  return (
    <div style={{ maxWidth: 480 }}>
      <ProfessionalCard
        name="Ana Beatriz Ramos"
        specialty="Clinical psychologist"
        credential="CRP 06/123456"
        action={<Button size="sm">View calendar</Button>}
      />
    </div>
  );
}

function AppointmentCardEstados() {
  return (
    <div style={{ ...col, maxWidth: 520 }}>
      <AppointmentCard time="09:00" date="Mon, 24" client="Marina Alves" service="Therapy session" channel="Online" status="completed" />
      <AppointmentCard time="11:00" date="Mon, 24" client="Carlos Dias" service="First consultation" channel="In person" status="confirmed" />
      <AppointmentCard time="16:00" date="Mon, 24" client="Rafael & Bia" service="Couples therapy" channel="In person" status="pending" />
    </div>
  );
}
function AppointmentCardComAcoes() {
  return (
    <div style={{ maxWidth: 520 }}>
      <AppointmentCard
        time="16:00"
        date="Mon, 24"
        client="Rafael & Bia"
        service="Couples therapy"
        status="pending"
        actions={
          <>
            <Button size="sm">Confirm</Button>
            <IconButton label="More">
              <MoreVertical size={18} strokeWidth={1.75} />
            </IconButton>
          </>
        }
      />
    </div>
  );
}

function WeekControlado() {
  const [week, setWeek] = React.useState<WeekSchedule>(DEFAULT_WEEK);
  const [buffer, setBuffer] = React.useState('10');
  return (
    <div style={{ maxWidth: 640 }}>
      <WeeklyScheduleEditor value={week} buffer={buffer} onChange={setWeek} onBufferChange={setBuffer} />
    </div>
  );
}
function WeekNaoControlado() {
  return (
    <div style={{ maxWidth: 640 }}>
      <WeeklyScheduleEditor defaultBuffer="15" showSummary={false} />
    </div>
  );
}

const framed: React.CSSProperties = { maxWidth: 520, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden' };

function TopBarBasico() {
  return (
    <div style={framed}>
      <TopBar
        title="Your details"
        sticky={false}
        leading={
          <IconButton label="Back">
            <ChevronLeft size={18} strokeWidth={1.75} />
          </IconButton>
        }
      />
    </div>
  );
}
function TopBarCompleto() {
  return (
    <div style={framed}>
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
    </div>
  );
}
function TopBarTransparente() {
  return (
    <div style={{ ...framed, background: 'var(--bg-brand-soft)' }}>
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
    </div>
  );
}

const TAB_ITEMS = [
  { value: 'agenda', label: 'Calendar' },
  { value: 'clientes', label: 'Clients' },
  { value: 'servicos', label: 'Services' },
];
function TabsUnderline() {
  const [v, setV] = React.useState('agenda');
  return <Tabs value={v} onChange={setV} items={TAB_ITEMS} />;
}
function TabsPill() {
  const [v, setV] = React.useState('today');
  return (
    <Tabs
      variant="pill"
      value={v}
      onChange={setV}
      items={[
        { value: 'today', label: 'Today', count: 5 },
        { value: 'semana', label: 'Week', count: 23 },
        { value: 'mes', label: 'Month' },
      ]}
    />
  );
}
function TabsFullWidth() {
  const [v, setV] = React.useState('agenda');
  return (
    <div style={{ maxWidth: 360 }}>
      <Tabs fullWidth value={v} onChange={setV} items={TAB_ITEMS} />
    </div>
  );
}

function BottomNavBasico() {
  const [tab, setTab] = React.useState('agenda');
  return (
    <div style={{ maxWidth: 420, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
      <BottomNav
        value={tab}
        onChange={setTab}
        items={[
          { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} strokeWidth={1.75} /> },
          { value: 'clientes', label: 'Clients', icon: <Users size={22} strokeWidth={1.75} /> },
          { value: 'servicos', label: 'Services', icon: <Sparkles size={22} strokeWidth={1.75} /> },
        ]}
      />
    </div>
  );
}
function BottomNavBadge() {
  const [tab, setTab] = React.useState('agenda');
  return (
    <div style={{ maxWidth: 420, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
      <BottomNav
        value={tab}
        onChange={setTab}
        items={[
          { value: 'agenda', label: 'Calendar', icon: <Calendar size={22} strokeWidth={1.75} /> },
          { value: 'clientes', label: 'Clients', icon: <Users size={22} strokeWidth={1.75} />, badge: true },
          { value: 'search', label: 'Search', icon: <Search size={22} strokeWidth={1.75} /> },
        ]}
      />
    </div>
  );
}

const STEP_ITEMS = [
  { value: 'perfil', label: 'Your profile' },
  { value: 'servico', label: 'First service' },
  { value: 'grade', label: 'Your schedule' },
];
function StepperBar() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Stepper steps={STEP_ITEMS} current={1} />
    </div>
  );
}
function StepperDots() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Stepper steps={STEP_ITEMS} current={1} variant="dots" />
    </div>
  );
}
function StepperClicavel() {
  const [step, setStep] = React.useState(2);
  return (
    <div style={{ ...col, maxWidth: 460 }}>
      <Stepper steps={STEP_ITEMS} current={step} onStepClick={setStep} />
      <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.min(2, s + 1))}>
        Next
      </Button>
    </div>
  );
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
    <div style={{ position: 'relative', minHeight: open ? 300 : undefined }}>
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
    <div style={{ position: 'relative', minHeight: open ? 320 : undefined }}>
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
  'date-time-picker': { calendar: DateTimeCalendario, 'with-times': DateTimeComHorarios },
  'service-card': { basic: ServiceCardBasico, selectable: ServiceCardSelectable },
  'professional-card': { basic: ProfessionalCardBasico, 'with-action': ProfessionalCardComAcao },
  'appointment-card': { states: AppointmentCardEstados, 'with-actions': AppointmentCardComAcoes },
  'weekly-schedule-editor': { controlled: WeekControlado, uncontrolled: WeekNaoControlado },
  'top-bar': { basic: TopBarBasico, full: TopBarCompleto, transparent: TopBarTransparente },
  tabs: { underline: TabsUnderline, pill: TabsPill, 'full-width': TabsFullWidth },
  'bottom-nav': { basic: BottomNavBasico, 'with-badge': BottomNavBadge },
  stepper: { bar: StepperBar, dots: StepperDots, clickable: StepperClicavel },
  alert: { tones: AlertTons, 'with-action': AlertComAcao, dismissible: AlertDispensavel },
  toast: { tones: ToastTons, 'with-action': ToastComAcao },
  dialog: { center: DialogCenter, sheet: DialogSheet },
  skeleton: { variants: SkeletonVariantes, lines: SkeletonLinhas },
  'empty-state': { basic: EmptyStateBasico, 'with-action': EmptyStateComAcao, compact: EmptyStateCompact },
};
