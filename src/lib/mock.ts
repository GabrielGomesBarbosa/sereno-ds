// Mock data for the three product screens. No backend in this phase (SS-39 §8) —
// every screen reads from here. Copy tuned to the DS content rules: sentence case,
// 24h times, "R$ 180" with a non-breaking space, closed status vocabulary.

import type { WeekSchedule } from '@/components';

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
export const UNAVAILABLE_DAYS = [1, 2, 8, 9, 15, 16, 22, 23, 29, 30];
export const TIME_SLOTS = ['09:00', '10:00', { value: '11:00', disabled: true }, '14:00', '15:00', '16:00', '17:00', { value: '18:00', disabled: true }];

export const TODAY_APPOINTMENTS: Appointment[] = [
  { time: '09:00', date: 'seg, 24', client: 'Marina Alves', service: 'Sessão de psicoterapia', channel: 'Online', status: 'completed' },
  { time: '11:00', date: 'seg, 24', client: 'Carlos Dias', service: 'Primeira consulta', channel: 'Presencial', status: 'confirmed' },
  { time: '14:30', date: 'seg, 24', client: 'Juliana Prado', service: 'Sessão de psicoterapia', channel: 'Online', status: 'confirmed' },
  { time: '16:00', date: 'seg, 24', client: 'Rafael e Bia', service: 'Terapia de casal', channel: 'Presencial', status: 'pending' },
  { time: '18:00', date: 'seg, 24', client: 'Helena Costa', service: 'Sessão de psicoterapia', channel: 'Online', status: 'cancelled' },
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

export const DASHBOARD_STATS = [
  { label: 'Hoje', value: '5', delta: '1 pendente de confirmação' },
  { label: 'Esta semana', value: '23', delta: '+4 vs. semana passada', tone: 'up' as const },
  { label: 'Taxa de comparecimento', value: '94%', delta: 'Últimos 30 dias' },
  { label: 'Receita do mês', value: 'R$ 4.180', delta: '+12% vs. julho', tone: 'up' as const },
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
