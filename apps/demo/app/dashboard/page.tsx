import type { Metadata } from 'next';
import { Dashboard } from '@/screens/Dashboard';

const title = 'Dashboard do profissional';
const description =
  'Agenda do dia, clientes, catálogo de serviços, financeiro e configurações — incluindo a grade horária semanal.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/dashboard' },
  openGraph: { title, description, url: '/dashboard', images: ['/opengraph-image.png'] },
};

export default function DashboardPage() {
  return <Dashboard />;
}
