import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookingFlow } from '@/screens/BookingFlow';
import { PROFESSIONALS, getProfessional, getServices } from '@/lib/mock';

export function generateStaticParams() {
  return PROFESSIONALS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const professional = getProfessional(slug);
  if (!professional) return { title: 'Agendar' };
  const title = `Agendar com ${professional.name} — ${professional.specialty}`;
  const description = `${professional.bio} Escolha o serviço, a data e o horário e confirme em poucos toques.`;
  return {
    title,
    description,
    alternates: { canonical: `/agendar/${slug}` },
    openGraph: { type: 'profile', title, description, url: `/agendar/${slug}`, images: ['/opengraph-image.png'] },
  };
}

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const professional = getProfessional(slug);
  if (!professional) notFound();
  return <BookingFlow professional={professional} services={getServices(slug)} />;
}
