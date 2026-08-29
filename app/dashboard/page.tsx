import type { Metadata } from 'next';
import { Dashboard } from '@/screens/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard do profissional',
  description: 'Agenda do dia, clientes, catálogo de serviços, financeiro e configurações — incluindo a grade horária semanal.',
  alternates: { canonical: '/dashboard' },
};

export default function DashboardPage() {
  return <Dashboard />;
}
