import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COMPONENTS, getComponent } from '@/design-system/catalog';
import { ComponentView } from '@/design-system/ComponentView';

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ category: c.category, slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params;
  const meta = getComponent(category, slug);
  if (!meta) return { title: 'Componente' };
  return { title: `${meta.name} · Design System`, robots: { index: false, follow: false } };
}

export default async function ComponentPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const meta = getComponent(category, slug);
  if (!meta) notFound();
  return <ComponentView meta={meta} />;
}
