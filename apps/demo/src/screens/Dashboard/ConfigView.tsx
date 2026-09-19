'use client';

import * as React from 'react';
import { Button, Card, Input, Select, Switch, Typography } from '@sereno-ds/ui';
import { WeeklyScheduleEditor } from '@/domain/WeeklyScheduleEditor';
import { DEFAULT_WEEK } from '@/lib/mock';
import { vcol, ComingSoon } from './shared';
import { KNOWN_CONFIG } from './constants';

export function ConfigView({ section, title }: { section: string; title: string }) {
  const [week, setWeek] = React.useState(DEFAULT_WEEK);
  const [buffer, setBuffer] = React.useState('10');
  const [r24, setR24] = React.useState(true);
  const [r1, setR1] = React.useState(true);
  const [daily, setDaily] = React.useState(false);

  if (!KNOWN_CONFIG.has(section)) {
    return (
      <div style={{ ...vcol('var(--space-4)'), maxWidth: 600 }}>
        <ComingSoon label={title} />
      </div>
    );
  }

  return (
    <div style={{ ...vcol('var(--space-4)'), maxWidth: 600 }}>
      {section === 'perfil' && (
        <>
          <Card padding="md" style={vcol('var(--space-4)')}>
            <Typography variant="h3" style={{ fontSize: 'var(--text-lg)' }}>
              Perfil público
            </Typography>
            <Input label="Nome exibido" defaultValue="Ana Beatriz Ramos" />
            <Input label="Registro profissional" defaultValue="CRP 06/123456" />
            <Select label="Fuso horário" defaultValue="sp" options={[{ value: 'sp', label: 'Brasília (GMT-3)' }, { value: 'mao', label: 'Manaus (GMT-4)' }]} />
          </Card>
          <Card padding="md" style={vcol('var(--space-3)')}>
            <Typography variant="h3" style={{ fontSize: 'var(--text-lg)' }}>
              Encerrar conta
            </Typography>
            <Typography variant="bodySm">Seus agendamentos futuros serão cancelados e os clientes avisados.</Typography>
            <Button variant="error" style={{ alignSelf: 'flex-start' }}>
              Excluir conta
            </Button>
          </Card>
        </>
      )}
      {section === 'grade' && (
        <Card padding="md" style={vcol('var(--space-4)')}>
          <Typography variant="h3" style={{ fontSize: 'var(--text-lg)' }}>
            Grade horária
          </Typography>
          <Typography variant="bodySm" style={{ marginTop: -8 }}>
            Só os horários dentro da sua grade aparecem no link público.
          </Typography>
          <WeeklyScheduleEditor value={week} buffer={buffer} onChange={setWeek} onBufferChange={setBuffer} />
        </Card>
      )}
      {section === 'lembretes' && (
        <Card padding="md" style={vcol('var(--space-4)')}>
          <Typography variant="h3" style={{ fontSize: 'var(--text-lg)' }}>
            Lembretes e avisos
          </Typography>
          <Switch label="Lembrete 24h antes" description="Enviado por WhatsApp ao cliente." checked={r24} onChange={(e) => setR24(e.target.checked)} />
          <Switch label="Lembrete 1h antes" checked={r1} onChange={(e) => setR1(e.target.checked)} />
          <Switch label="Resumo diário por e-mail" checked={daily} onChange={(e) => setDaily(e.target.checked)} />
        </Card>
      )}
    </div>
  );
}
