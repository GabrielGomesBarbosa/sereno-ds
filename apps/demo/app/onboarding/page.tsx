import type { Metadata } from 'next';
import { Onboarding } from '@/screens/Onboarding';
import { DemoNav } from '@/src/DemoNav';

const title = 'Onboarding do profissional';
const description =
  'Três passos guiados — perfil, primeiro serviço e grade horária — antes de o link público aceitar agendamentos.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/onboarding' },
  openGraph: { title, description, url: '/onboarding', images: ['/opengraph-image.png'] },
};

export default function OnboardingPage() {
  return (
    <>
      <Onboarding />
      <DemoNav />
    </>
  );
}
