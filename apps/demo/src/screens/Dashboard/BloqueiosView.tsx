import { ScheduleExceptions } from '@/domain/ScheduleExceptions';
import { DEFAULT_EXCEPTIONS } from '@/lib/mock';
import { vcol } from './shared';

export function BloqueiosView() {
  return (
    <div style={{ ...vcol('var(--space-2)'), maxWidth: 640 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
        Sua grade horária (em Configurações → Grade horária) define os dias e turnos recorrentes. Bloqueie aqui as
        exceções — feriados, viagens, imprevistos — sem mexer nela.
      </p>
      <div style={{ height: 'var(--space-3)' }} />
      <ScheduleExceptions defaultValue={DEFAULT_EXCEPTIONS} />
    </div>
  );
}
