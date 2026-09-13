import { Plus } from 'lucide-react';
import { Button } from '@sereno-ds/ui';
import { ServiceCard } from '@/domain/ServiceCard';
import { SERVICES_BY_SLUG } from '@/lib/mock';
import { vcol, ViewHeader } from './shared';

export function ServicosView() {
  return (
    <div style={{ ...vcol('var(--space-4)'), maxWidth: 720 }}>
      <ViewHeader action={<Button iconLeft={<Plus size={18} strokeWidth={1.75} />}>Novo serviço</Button>} />
      {SERVICES_BY_SLUG['ana-ramos'].map((s) => (
        <ServiceCard key={s.id} name={s.name} duration={s.duration} price={s.price} description={s.description} tag={s.tag} />
      ))}
    </div>
  );
}
