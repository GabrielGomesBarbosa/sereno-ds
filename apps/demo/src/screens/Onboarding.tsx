'use client';

import * as React from 'react';
import { Calendar, CheckCircle2, Link2, Share2, Sparkles, User } from 'lucide-react';
import { AvatarUpload, Badge, Brand, Button, Card, Input, Select, Stepper, Textarea, Typography } from '@sereno-ds/ui';
import { ServiceCard } from '@/domain/ServiceCard';
import { WeeklyScheduleEditor, type WeekSchedule } from '@/domain/WeeklyScheduleEditor';
import { vcol } from '@/domain/layout';
import { DEFAULT_WEEK } from '@/lib/mock';

interface Data {
  name: string;
  photo: File | null;
  council: string;
  credential: string;
  svcName: string;
  svcDesc: string;
  duration: string;
  price: string;
  mode: string;
  week: WeekSchedule;
  buffer: string;
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div style={vcol('var(--space-2)')}>
      <Typography variant="display" style={{ fontSize: 'var(--text-2xl)' }}>
        {title}
      </Typography>
      <Typography variant="body" color="secondary">
        {description}
      </Typography>
    </div>
  );
}

export function Onboarding() {
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [data, setData] = React.useState<Data>({
    name: '',
    photo: null,
    council: 'crp',
    credential: '',
    svcName: '',
    svcDesc: '',
    duration: '50 min',
    price: '',
    mode: 'Online',
    week: DEFAULT_WEEK,
    buffer: '10',
  });
  const set = (p: Partial<Data>) => setData((d) => ({ ...d, ...p }));

  const valid = [
    () => data.name.trim() !== '' && data.credential.trim() !== '',
    () => data.svcName.trim() !== '' && data.price.trim() !== '',
    () => Object.values(data.week).some((d) => d.enabled),
  ][step];

  return (
    <div className="onb-shell">
      <div className="onb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Brand variant="lockup" size={22} />
          <Badge tone="neutral" dot={false}>
            Configuração inicial
          </Badge>
        </div>

        {done ? (
          <DoneScreen
            data={data}
            onRestart={() => {
              setDone(false);
              setStep(0);
            }}
          />
        ) : (
          <>
            <Stepper current={step} onStepClick={setStep} stepLabel={(c, t) => `Passo ${c} de ${t}`}>
              <Stepper.Step value="perfil" label="Seu perfil" />
              <Stepper.Step value="servico" label="Primeiro serviço" />
              <Stepper.Step value="grade" label="Sua grade" />
            </Stepper>
            {step === 0 && <PerfilStep data={data} set={set} />}
            {step === 1 && <ServicoStep data={data} set={set} />}
            {step === 2 && <GradeStep data={data} set={set} />}
            <div className="onb-footer">
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {step > 0 && (
                  <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
                    Voltar
                  </Button>
                )}
                <Button
                  variant={step === 2 ? 'accent' : 'primary'}
                  size="lg"
                  fullWidth
                  disabled={!valid()}
                  onClick={() => (step < 2 ? setStep(step + 1) : setDone(true))}
                >
                  {step < 2 ? 'Continuar' : 'Concluir configuração'}
                </Button>
              </div>
              {step < 2 && (
                <Button variant="ghost" size="sm" style={{ alignSelf: 'center' }} onClick={() => setStep(step + 1)}>
                  Preencher depois
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PerfilStep({ data, set }: { data: Data; set: (p: Partial<Data>) => void }) {
  return (
    <div style={vcol('var(--space-5)')}>
      <StepHeader title="Vamos começar pelo seu perfil" description="É o que seus clientes veem antes de agendar. Você pode ajustar depois nas configurações." />
      <AvatarUpload
        label="Foto de perfil"
        hint="JPG ou PNG. Opcional — dá para ajustar o enquadramento."
        name={data.name}
        value={data.photo}
        onChange={(f) => set({ photo: f })}
        labels={{
          trigger: 'Trocar foto',
          upload: 'Enviar foto',
          takePhoto: 'Tirar foto',
          remove: 'Remover foto',
          cropTitle: 'Ajustar a foto',
          cropHint: 'Arraste para reposicionar · role para dar zoom.',
          cameraTitle: 'Tirar foto',
          cameraHint: 'Alinhe o rosto com o círculo.',
          capture: 'Capturar',
          cancel: 'Cancelar',
          save: 'Salvar',
          zoom: 'Zoom',
          heicError: 'Esse formato (HEIC) não abre no navegador — envie JPG ou PNG.',
          notImage: 'Escolha um arquivo de imagem.',
          tooLarge: (mb) => `A imagem passa de ${mb} MB.`,
          unreadable: 'Não foi possível ler essa imagem. Tente um JPG ou PNG.',
          cameraError: 'Não foi possível abrir a câmera — envie uma foto da galeria.',
        }}
      />
      <Input label="Nome completo" required size="lg" placeholder="Ana Beatriz Ramos" value={data.name} onChange={(e) => set({ name: e.currentTarget.value })} />
      <div className="onb-row">
        <Select
          label="Conselho"
          size="lg"
          value={data.council}
          onValueChange={(v) => set({ council: v })}
          options={[
            { value: 'crp', label: 'CRP' },
            { value: 'crn', label: 'CRN' },
            { value: 'cref', label: 'CREF' },
            { value: 'none', label: 'Sem registro' },
          ]}
        />
        <Input
          label="Número de registro"
          required
          size="lg"
          placeholder="06/123456"
          value={data.credential}
          onChange={(e) => set({ credential: e.currentTarget.value })}
          hint="Fica visível no seu perfil público."
        />
      </div>
    </div>
  );
}

function ServicoStep({ data, set }: { data: Data; set: (p: Partial<Data>) => void }) {
  return (
    <div style={vcol('var(--space-5)')}>
      <StepHeader title="Cadastre seu primeiro serviço" description="Um serviço é o que o cliente escolhe ao agendar. Cadastre mais depois, quando quiser." />
      <Input label="Nome do serviço" required size="lg" placeholder="Sessão de psicoterapia" value={data.svcName} onChange={(e) => set({ svcName: e.currentTarget.value })} />
      <Textarea
        label="Descrição"
        rows={2}
        placeholder="Atendimento individual por vídeo, com foco em ansiedade e carreira."
        hint="Aparece no card que o cliente vê ao agendar. Opcional."
        value={data.svcDesc}
        onChange={(e) => set({ svcDesc: e.currentTarget.value })}
      />
      <div className="onb-row-2">
        <Select
          label="Duração"
          size="lg"
          value={data.duration}
          onValueChange={(v) => set({ duration: v })}
          options={[
            { value: '30 min', label: '30 min' },
            { value: '50 min', label: '50 min' },
            { value: '1h', label: '1 hora' },
            { value: '1h30', label: '1h30' },
          ]}
        />
        <Input
          label="Valor"
          required
          size="lg"
          mask="currency"
          prefix="R$"
          placeholder="0,00"
          value={data.price}
          onChange={(e) => set({ price: e.currentTarget.value })}
        />
      </div>
      <Select
        label="Formato"
        size="lg"
        value={data.mode}
        onValueChange={(v) => set({ mode: v })}
        options={[
          { value: 'Online', label: 'Online' },
          { value: 'Presencial', label: 'Presencial' },
          { value: 'Presencial/Online', label: 'Online e presencial' },
        ]}
      />
      <div style={vcol('var(--space-2)')}>
        <Typography variant="eyebrow" style={{ fontWeight: 'var(--weight-bold)' }}>
          Como o cliente vai ver
        </Typography>
        <ServiceCard
          name={data.svcName || 'Nome do serviço'}
          description={data.svcDesc || undefined}
          duration={data.duration}
          price={data.price ? 'R$ ' + data.price : 'R$ —'}
          tag={data.mode}
        />
      </div>
    </div>
  );
}

function GradeStep({ data, set }: { data: Data; set: (p: Partial<Data>) => void }) {
  return (
    <div style={vcol('var(--space-5)')}>
      <StepHeader title="Quando você atende?" description="Só os horários dentro da sua grade aparecem no link público. Dá para mudar quando quiser." />
      <WeeklyScheduleEditor value={data.week} buffer={data.buffer} onChange={(w) => set({ week: w })} onBufferChange={(b) => set({ buffer: b })} />
    </div>
  );
}

function DoneScreen({ data, onRestart }: { data: Data; onRestart: () => void }) {
  const rows: [React.ReactNode, string][] = [
    [<User key="u" size={18} strokeWidth={1.75} />, data.name || 'Seu perfil'],
    [<Sparkles key="s" size={18} strokeWidth={1.75} />, `${data.svcName || 'Primeiro serviço'} · ${data.duration} · R$ ${data.price || '—'}`],
    [<Calendar key="c" size={18} strokeWidth={1.75} />, 'Grade semanal configurada'],
    [<Link2 key="l" size={18} strokeWidth={1.75} />, 'sereno.app/ana-ramos'],
  ];
  return (
    <div style={{ ...vcol('var(--space-4)'), alignItems: 'center', textAlign: 'center', padding: 'var(--space-3) 0' }}>
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--status-success-bg)',
          color: 'var(--status-success-fg)',
        }}
      >
        <CheckCircle2 size={30} strokeWidth={1.75} />
      </span>
      <Typography variant="display" style={{ fontSize: 'var(--text-2xl)' }}>
        Tudo pronto
      </Typography>
      <Typography variant="body" color="secondary" style={{ maxWidth: 400 }}>
        Seu link já aceita agendamentos. Compartilhe com seus clientes quando quiser.
      </Typography>
      <Card padding="md" elevation="none" style={{ width: '100%', textAlign: 'left', ...vcol('var(--space-3)'), marginTop: 'var(--space-2)' }}>
        {rows.map(([icon, text], i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', color: 'var(--text-secondary)' }}>
            {icon}
            <Typography variant="bodySm" style={{ lineHeight: 'normal' }}>
              {text}
            </Typography>
          </div>
        ))}
      </Card>
      <div style={{ display: 'flex', gap: 'var(--space-2)', width: '100%', marginTop: 'var(--space-2)' }}>
        <Button variant="accent" size="lg" fullWidth iconLeft={<Share2 size={18} strokeWidth={1.75} />}>
          Compartilhar meu link
        </Button>
        <Button variant="ghost" size="lg" onClick={onRestart}>
          Rever
        </Button>
      </div>
    </div>
  );
}
