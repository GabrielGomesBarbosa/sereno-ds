// Mock data for the three product screens. No backend in this phase (SS-39 §8) —
// every screen reads from here. Copy tuned to the DS content rules: sentence case,
// 24h times, "R$ 180" with a non-breaking space, closed status vocabulary.

import type { WeekSchedule } from '@/domain/WeeklyScheduleEditor';

export interface Professional {
  slug: string;
  name: string;
  specialty: string;
  credential: string;
  location: string;
  channels: string[];
  bio: string;
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description?: string;
  tag?: string;
}

export interface Appointment {
  time: string;
  date: string;
  client: string;
  service: string;
  channel: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

export const PROFESSIONALS: Professional[] = [
  {
    slug: 'ana-ramos',
    name: 'Ana Beatriz Ramos',
    specialty: 'Psicóloga clínica',
    credential: 'CRP 06/123456',
    location: 'São Paulo',
    channels: ['Online', 'Presencial'],
    bio: 'Atendimento individual para adultos, com foco em ansiedade, carreira e relações. Abordagem cognitivo-comportamental.',
  },
  {
    slug: 'marcos-lima',
    name: 'Marcos Lima',
    specialty: 'Nutricionista',
    credential: 'CRN 3 12345',
    location: 'Campinas',
    channels: ['Online'],
    bio: 'Reeducação alimentar sem dietas restritivas. Acompanhamento quinzenal e ajustes de plano conforme a sua rotina.',
  },
  {
    slug: 'julia-souza',
    name: 'Júlia Souza',
    specialty: 'Esteticista',
    credential: 'Registro 4567-SP',
    location: 'São Paulo',
    channels: ['Presencial'],
    bio: 'Protocolos faciais e corporais personalizados. Avaliação de pele na primeira sessão, sempre presencial.',
  },
];

export const SERVICES_BY_SLUG: Record<string, Service[]> = {
  'ana-ramos': [
    { id: 'psi', name: 'Sessão de psicoterapia', duration: '50 min', price: 'R$ 180', tag: 'Online', description: 'Atendimento individual por vídeo.' },
    { id: 'aval', name: 'Primeira consulta', duration: '1h', price: 'R$ 220', description: 'Acolhimento inicial e plano de acompanhamento.' },
    { id: 'casal', name: 'Terapia de casal', duration: '1h30', price: 'R$ 300', tag: 'Presencial', description: 'Consultório em Pinheiros, São Paulo.' },
  ],
  'marcos-lima': [
    { id: 'nutri-1', name: 'Primeira avaliação nutricional', duration: '1h', price: 'R$ 250', tag: 'Online', description: 'Anamnese, medidas e plano inicial.' },
    { id: 'nutri-2', name: 'Retorno', duration: '40 min', price: 'R$ 160', tag: 'Online', description: 'Ajuste de plano e acompanhamento.' },
  ],
  'julia-souza': [
    { id: 'limpeza', name: 'Limpeza de pele profunda', duration: '1h20', price: 'R$ 190', tag: 'Presencial' },
    { id: 'peeling', name: 'Peeling de diamante', duration: '50 min', price: 'R$ 230', tag: 'Presencial' },
    { id: 'aval-pele', name: 'Avaliação de pele', duration: '30 min', price: 'R$ 90', tag: 'Presencial', description: 'Obrigatória antes do primeiro procedimento.' },
  ],
};

export function getProfessional(slug: string): Professional | undefined {
  return PROFESSIONALS.find((p) => p.slug === slug);
}

export function getServices(slug: string): Service[] {
  return SERVICES_BY_SLUG[slug] ?? [];
}

// August 2026 sample availability for the DateTimePicker (month index 7).
export const BOOKING_MONTH = { year: 2026, month: 7 };
/** Weekend day-numbers of a month — sample "no availability" days that stay
 *  meaningful when the calendar is navigated (feed via `onMonthChange`). */
export const weekendsOf = (y: number, m: number): number[] =>
  Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1).filter((d) => {
    const wd = new Date(y, m, d).getDay();
    return wd === 0 || wd === 6;
  });
export const UNAVAILABLE_DAYS = weekendsOf(2026, 7);
/** The demo's "today" — Mon 24 Aug 2026 (matches the Agenda header). */
export const DEMO_TODAY = { year: 2026, month: 7, day: 24 };
/** Deterministic sample booking counts per day for a month — weekdays only, and
 *  only from DEMO_TODAY forward, so a `renderDay` badge reads as "upcoming load". */
export const bookingCountsOf = (y: number, m: number): Record<number, number> => {
  const out: Record<number, number> = {};
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
    const future =
      y > DEMO_TODAY.year ||
      (y === DEMO_TODAY.year && (m > DEMO_TODAY.month || (m === DEMO_TODAY.month && d >= DEMO_TODAY.day)));
    const wd = new Date(y, m, d).getDay();
    if (future && wd !== 0 && wd !== 6) out[d] = ((d * 5 + m * 3) % 6) + 1;
  }
  return out;
};
export const TIME_SLOTS = ['09:00', '10:00', { value: '11:00', disabled: true }, '14:00', '15:00', '16:00', '17:00', { value: '18:00', disabled: true }];

export const TODAY_APPOINTMENTS: Appointment[] = [
  { time: '09:00', date: 'seg, 24', client: 'Marina Alves', service: 'Sessão de psicoterapia', channel: 'Online', status: 'completed' },
  { time: '11:00', date: 'seg, 24', client: 'Carlos Dias', service: 'Primeira consulta', channel: 'Presencial', status: 'confirmed' },
  { time: '14:30', date: 'seg, 24', client: 'Juliana Prado', service: 'Sessão de psicoterapia', channel: 'Online', status: 'confirmed' },
  { time: '16:00', date: 'seg, 24', client: 'Rafael e Bia', service: 'Terapia de casal', channel: 'Presencial', status: 'pending' },
  { time: '18:00', date: 'seg, 24', client: 'Helena Costa', service: 'Sessão de psicoterapia', channel: 'Online', status: 'cancelled' },
];

export interface DayGroup {
  key: string;
  weekday: string;
  date: string;
  relative?: string;
  items: Appointment[];
}

/** A working week for the agenda view. The first group reuses TODAY_APPOINTMENTS. */
export const AGENDA_SCHEDULE: DayGroup[] = [
  { key: 'seg', weekday: 'Segunda-feira', date: '24 de agosto', relative: 'Hoje', items: TODAY_APPOINTMENTS },
  {
    key: 'ter',
    weekday: 'Terça-feira',
    date: '25 de agosto',
    relative: 'Amanhã',
    items: [
      { time: '09:00', date: 'ter, 25', client: 'Marina Alves', service: 'Sessão de psicoterapia', channel: 'Online', status: 'confirmed' },
      { time: '10:00', date: 'ter, 25', client: 'Diego Martins', service: 'Primeira consulta', channel: 'Online', status: 'pending' },
      { time: '15:00', date: 'ter, 25', client: 'Juliana Prado', service: 'Sessão de psicoterapia', channel: 'Presencial', status: 'confirmed' },
    ],
  },
  {
    key: 'qua',
    weekday: 'Quarta-feira',
    date: '26 de agosto',
    items: [
      { time: '09:00', date: 'qua, 26', client: 'Rafael e Bia', service: 'Terapia de casal', channel: 'Presencial', status: 'confirmed' },
      { time: '14:30', date: 'qua, 26', client: 'Camila Rocha', service: 'Sessão de psicoterapia', channel: 'Online', status: 'confirmed' },
    ],
  },
  {
    key: 'qui',
    weekday: 'Quinta-feira',
    date: '27 de agosto',
    items: [
      { time: '11:00', date: 'qui, 27', client: 'Carlos Dias', service: 'Sessão de psicoterapia', channel: 'Presencial', status: 'confirmed' },
      { time: '16:00', date: 'qui, 27', client: 'Beatriz Nunes', service: 'Sessão de psicoterapia', channel: 'Online', status: 'pending' },
    ],
  },
  {
    key: 'sex',
    weekday: 'Sexta-feira',
    date: '28 de agosto',
    items: [{ time: '09:00', date: 'sex, 28', client: 'Juliana Prado', service: 'Sessão de psicoterapia', channel: 'Online', status: 'confirmed' }],
  },
];

export interface ClientRow {
  name: string;
  sessions: string;
  last: string;
  status: 'success' | 'warning' | 'error';
}

export const CLIENTS: ClientRow[] = [
  { name: 'Marina Alves', sessions: '12 sessões', last: 'Última: 24 ago', status: 'success' },
  { name: 'Carlos Dias', sessions: '1 sessão', last: 'Primeira consulta hoje', status: 'warning' },
  { name: 'Juliana Prado', sessions: '7 sessões', last: 'Última: 24 ago', status: 'success' },
  { name: 'Helena Costa', sessions: '3 sessões', last: 'Faltou em 24 ago', status: 'error' },
  { name: 'Rafael e Bia', sessions: '2 sessões', last: 'Última: 17 ago', status: 'success' },
];

export const CLIENT_STATUS_LABEL: Record<ClientRow['status'], string> = {
  success: 'Ativo',
  warning: 'Novo',
  error: 'Atenção',
};

export interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export const REVIEWS: Review[] = [
  { name: 'Marina Alves', rating: 5, comment: 'Profissional muito atenciosa — me senti acolhida desde a primeira sessão.', date: 'ago 2026' },
  { name: 'Carlos Dias', rating: 5, comment: 'Ótima escuta e sempre pontual. Recomendo bastante.', date: 'jul 2026' },
  { name: 'Juliana Prado', rating: 4, comment: 'Bom atendimento; só gostaria de mais horários disponíveis à noite.', date: 'jun 2026' },
  { name: 'Rafael e Bia', rating: 5, comment: 'A terapia de casal mudou nossa comunicação. Muito grata.', date: 'mai 2026' },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const PROFESSIONAL_FAQ: FaqItem[] = [
  { question: 'Preciso de indicação médica para agendar?', answer: 'Não. Você pode marcar uma primeira consulta diretamente por aqui, sem encaminhamento.' },
  { question: 'Como funciona o atendimento online?', answer: 'Por videochamada, num link que chega por e-mail e WhatsApp 15 minutos antes do horário marcado.' },
  { question: 'Posso remarcar ou cancelar?', answer: 'Sim, gratuitamente até 24h antes do horário. Depois disso a sessão é cobrada normalmente.' },
];

export const PROFESSIONAL_INSURANCE = ['Unimed', 'Bradesco Saúde', 'SulAmérica', 'Amil'];

export const DASHBOARD_STATS = [
  { label: 'Hoje', value: '5', delta: '1 pendente de confirmação' },
  { label: 'Esta semana', value: '23', delta: '+4 vs. semana passada', tone: 'up' as const },
  { label: 'Taxa de comparecimento', value: '94%', delta: 'Últimos 30 dias' },
  { label: 'Receita do mês', value: 'R$ 4.180', delta: '+12% vs. julho', tone: 'up' as const },
];

export interface NotificationItem {
  id: string;
  kind: 'booking' | 'payment' | 'client' | 'alert';
  title: string;
  time: string;
  unread: boolean;
}

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', kind: 'booking', title: 'Rafael e Bia confirmaram o horário de quarta, 26', time: 'há 12 min', unread: true },
  { id: 'n2', kind: 'payment', title: 'Pagamento de R$ 180 recebido de Marina Alves', time: 'há 1 h', unread: true },
  { id: 'n3', kind: 'client', title: 'Diego Martins agendou uma primeira consulta', time: 'há 3 h', unread: true },
  { id: 'n4', kind: 'alert', title: 'Helena Costa faltou ao atendimento de 24 ago', time: 'ontem', unread: false },
  { id: 'n5', kind: 'booking', title: 'Lembrete: você tem 5 atendimentos amanhã', time: 'ontem', unread: false },
];

export const DEFAULT_WEEK: WeekSchedule = {
  mon: { enabled: true, start: '09:00', end: '18:00' },
  tue: { enabled: true, start: '09:00', end: '18:00' },
  wed: { enabled: true, start: '09:00', end: '18:00' },
  thu: { enabled: true, start: '09:00', end: '18:00' },
  fri: { enabled: true, start: '09:00', end: '17:00' },
  sat: { enabled: false, start: '09:00', end: '13:00' },
  sun: { enabled: false, start: '09:00', end: '13:00' },
};
