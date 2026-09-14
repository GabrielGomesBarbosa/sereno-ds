import type { Metadata } from 'next';
import { CheckInKiosk } from '@/screens/CheckInKiosk';
import { DemoNav } from '@/src/DemoNav';

const title = 'Painel de chamada';
const description = 'Um painel para a sala de espera — anuncia a senha e o horário de quem está sendo chamado, sem expor nome ou motivo da consulta.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/kiosk' },
  openGraph: { title, description, url: '/kiosk', images: ['/opengraph-image.png'] },
};

export default function KioskPage() {
  return (
    <>
      <CheckInKiosk />
      <DemoNav />
    </>
  );
}
