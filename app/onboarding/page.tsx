import type { Metadata } from 'next';
import { Onboarding } from '@/screens/Onboarding';

export const metadata: Metadata = {
  title: 'Onboarding do profissional',
  description: 'Três passos guiados — perfil, primeiro serviço e grade horária — antes de o link público aceitar agendamentos.',
  alternates: { canonical: '/onboarding' },
};

export default function OnboardingPage() {
  return <Onboarding />;
}
