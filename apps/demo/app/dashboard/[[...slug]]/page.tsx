import type { Metadata } from 'next';
import { Dashboard } from '@/screens/Dashboard';
import { DemoNav } from '@/src/DemoNav';
import { DASHBOARD_VIEWS, pathForView } from '@/lib/dashboardNav';

const title = 'Dashboard do profissional';
const description =
  'Agenda do dia, clientes, catálogo de serviços, financeiro e configurações — incluindo a grade horária semanal.';

// A route per nav destination (plus the bare `/dashboard`, i.e. Agenda) — this
// is a static export, so every URL `Dashboard` can push to via `router.push`
// must be pre-rendered, or a direct visit / an F5 there 404s.
export function generateStaticParams() {
  return [{ slug: [] }, ...DASHBOARD_VIEWS.map((view) => ({ slug: pathForView(view).replace('/dashboard/', '').split('/') }))];
}

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/dashboard' },
  openGraph: { title, description, url: '/dashboard', images: ['/opengraph-image.png'] },
};

export default function DashboardPage() {
  return (
    <>
      <Dashboard />
      <DemoNav />
    </>
  );
}
