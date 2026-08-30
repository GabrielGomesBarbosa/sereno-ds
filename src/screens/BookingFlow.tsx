'use client';

import * as React from 'react';
import { Calendar, CalendarPlus, CheckCircle2, ChevronLeft, CreditCard, Info, Mail, Phone, Share2, User, Video } from 'lucide-react';
import { Avatar, Badge, Button, Card, Checkbox, DateTimePicker, IconButton, Input, ServiceCard, Textarea, TopBar } from '@/components';
import type { Professional, Service } from '@/lib/mock';
import { BOOKING_MONTH, TIME_SLOTS, UNAVAILABLE_DAYS } from '@/lib/mock';

type Step = 'profile' | 'schedule' | 'details' | 'confirmed';

const DATE_LONG = '14 de agosto de 2026, sexta';

const display = (size: string, weight = 800): React.CSSProperties => ({
  fontFamily: 'var(--font-display)',
  fontSize: size,
  fontWeight: weight,
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
});
const railLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-2xs)',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};
const wordmark: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--text-brand)' };

function Progress({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 var(--gutter-mobile) var(--space-3)' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 999,
            background: i <= step ? 'var(--interactive-primary)' : 'var(--border-default)',
            transition: 'background-color var(--duration-normal) var(--ease-standard)',
          }}
        />
      ))}
    </div>
  );
}

/** Mobile / tablet brand-soft header for step 0. */
function Hero({ professional }: { professional: Professional }) {
  return (
    <div style={{ background: 'var(--bg-brand-soft)', padding: 'var(--space-6) var(--gutter-mobile) var(--space-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <span style={wordmark}>Sereno</span>
        <IconButton label="Compartilhar" variant="secondary">
          <Share2 size={20} strokeWidth={1.75} />
        </IconButton>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <Avatar name={professional.name} size="xl" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ ...display('var(--text-2xl)'), lineHeight: 1.1 }}>{professional.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {professional.specialty} · {professional.credential}
          </span>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {professional.channels.map((c) => (
              <Badge key={c} tone="info" dot={false}>
                {c}
              </Badge>
            ))}
            <Badge tone="neutral" dot={false}>
              {professional.location}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Desktop persistent left panel: identity + a summary that fills in as you go. */
function Rail({ professional, service, day, time }: { professional: Professional; service: Service | null; day: number | null; time: string | null }) {
  return (
    <>
      <span style={wordmark}>Sereno</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Avatar name={professional.name} size="xl" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={display('var(--text-xl)')}>{professional.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{professional.specialty}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{professional.credential}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {professional.channels.map((c) => (
            <Badge key={c} tone="info" dot={false}>
              {c}
            </Badge>
          ))}
          <Badge tone="neutral" dot={false}>
            {professional.location}
          </Badge>
        </div>
      </div>

      {(service || (day && time)) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-default)' }}>
          {service && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={railLabel}>Serviço</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{service.name}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {service.duration} · {service.price}
              </span>
            </div>
          )}
          {day && time && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={railLabel}>Quando</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {day} de agosto · {time}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function BookingFlow({ professional, services }: { professional: Professional; services: Service[] }) {
  const [step, setStep] = React.useState<Step>('profile');
  const [serviceId, setServiceId] = React.useState<string | null>(null);
  const [day, setDay] = React.useState<number | null>(null);
  const [time, setTime] = React.useState<string | null>(null);
  const [reminders, setReminders] = React.useState(true);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const restart = () => {
    setStep('profile');
    setServiceId(null);
    setDay(null);
    setTime(null);
  };

  return (
    <div className="booking-shell">
      <div className="booking-card">
        <aside className="booking-rail">
          <Rail professional={professional} service={service} day={day} time={time} />
        </aside>

        <div className="booking-stepcol">
          {/* Mobile / tablet chrome — hidden on desktop, where the rail takes over */}
          {step === 'profile' && (
            <div className="booking-chrome">
              <Hero professional={professional} />
            </div>
          )}
          {(step === 'schedule' || step === 'details') && (
            <div className="booking-chrome">
              <TopBar
                title={step === 'schedule' ? 'Escolha o horário' : 'Seus dados'}
                subtitle={step === 'schedule' ? service?.name : undefined}
                leading={
                  <IconButton label="Voltar" onClick={() => setStep(step === 'schedule' ? 'profile' : 'schedule')}>
                    <ChevronLeft size={20} strokeWidth={1.75} />
                  </IconButton>
                }
              />
              <Progress step={step === 'schedule' ? 0 : 1} />
            </div>
          )}
          {step === 'confirmed' && (
            <div className="booking-chrome">
              <TopBar leading={<span style={wordmark}>Sereno</span>} />
            </div>
          )}

          {/* Desktop back link for inner steps */}
          {(step === 'schedule' || step === 'details') && (
            <button className="booking-backbtn" onClick={() => setStep(step === 'schedule' ? 'profile' : 'schedule')}>
              <ChevronLeft size={16} strokeWidth={1.75} />
              Voltar
            </button>
          )}

          {step === 'profile' && (
            <div className="booking-scroll" style={{ paddingBlock: 'var(--space-5) var(--space-8)', gap: 'var(--space-3)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>Escolha o serviço</span>
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  name={s.name}
                  duration={s.duration}
                  price={s.price}
                  description={s.description}
                  tag={s.tag}
                  selected={serviceId === s.id}
                  onSelect={() => setServiceId(s.id)}
                />
              ))}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5, margin: 'var(--space-2) 0 0' }}>
                Cancelamentos gratuitos até 24h antes do horário marcado.
              </p>
            </div>
          )}

          {step === 'schedule' && service && (
            <div className="booking-scroll" style={{ paddingBlock: '0 var(--space-8)' }}>
              <span className="booking-step-title" style={{ ...display('var(--text-xl)'), marginBottom: 'var(--space-4)' }}>
                Escolha o horário
              </span>
              <DateTimePicker
                year={BOOKING_MONTH.year}
                month={BOOKING_MONTH.month}
                unavailable={UNAVAILABLE_DAYS}
                times={TIME_SLOTS}
                selectedDate={day ?? undefined}
                selectedTime={time ?? undefined}
                onSelectDate={setDay}
                onSelectTime={setTime}
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>
                <Info size={16} strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)' }}>Horários no fuso de Brasília (GMT-3).</span>
              </div>
            </div>
          )}

          {step === 'details' && service && (
            <div className="booking-scroll" style={{ paddingBlock: '0 var(--space-8)', gap: 'var(--space-4)' }}>
              <span className="booking-step-title" style={{ ...display('var(--text-xl)'), marginBottom: 'var(--space-2)' }}>
                Seus dados
              </span>
              <Card padding="md" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', background: 'var(--bg-brand-soft)', border: '1px solid transparent' }}>
                <Calendar size={20} strokeWidth={1.75} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{service.name}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {day ?? 14} de agosto · {time} · {service.duration}
                  </span>
                </div>
              </Card>
              <Input label="Nome completo" required size="lg" placeholder="Marina Alves" iconLeft={<User size={16} strokeWidth={1.75} />} />
              <Input
                label="WhatsApp"
                required
                size="lg"
                mask="phone"
                placeholder="(11) 90000-0000"
                iconLeft={<Phone size={16} strokeWidth={1.75} />}
                hint="Enviaremos a confirmação e os lembretes por aqui."
              />
              <Input label="E-mail" size="lg" placeholder="marina@email.com" iconLeft={<Mail size={16} strokeWidth={1.75} />} />
              <Textarea label="Alguma observação?" rows={3} hint="Opcional." />
              <Checkbox
                label="Quero receber lembretes por WhatsApp"
                description="Enviamos 24h e 1h antes da sessão."
                checked={reminders}
                onChange={(e) => setReminders(e.currentTarget.checked)}
              />
            </div>
          )}

          {step === 'confirmed' && service && (
            <div className="booking-scroll booking-scroll--center" style={{ paddingBlock: 'var(--space-8)', gap: 'var(--space-4)', textAlign: 'center' }}>
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
              <span style={display('var(--text-2xl)')}>Agendamento confirmado</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 320 }}>
                Enviamos os detalhes no seu WhatsApp. {professional.name.split(' ')[0]} já foi avisada.
              </span>
              <Card padding="md" style={{ width: '100%', maxWidth: 380, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{service.name}</span>
                  <Badge tone="success">Confirmado</Badge>
                </div>
                {(
                  [
                    [<Calendar key="c" size={18} strokeWidth={1.75} />, DATE_LONG],
                    [<Info key="i" size={18} strokeWidth={1.75} />, `${time} · ${service.duration}`],
                    [<Video key="v" size={18} strokeWidth={1.75} />, 'Link enviado por WhatsApp'],
                    [<CreditCard key="p" size={18} strokeWidth={1.75} />, `Pagamento no atendimento · ${service.price}`],
                  ] as [React.ReactNode, string][]
                ).map(([icon, text], i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {icon}
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>{text}</span>
                  </div>
                ))}
              </Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', maxWidth: 380, marginTop: 'var(--space-2)' }}>
                <Button size="lg" fullWidth iconLeft={<CalendarPlus size={18} strokeWidth={1.75} />}>
                  Adicionar ao calendário
                </Button>
                <Button variant="ghost" size="lg" fullWidth onClick={restart}>
                  Agendar outro horário
                </Button>
              </div>
            </div>
          )}

          {step !== 'confirmed' && (
            <div className="booking-footer">
              {step === 'profile' && (
                <Button variant="accent" size="lg" fullWidth disabled={!serviceId} onClick={() => setStep('schedule')}>
                  Continuar
                </Button>
              )}
              {step === 'schedule' && (
                <Button variant="accent" size="lg" fullWidth disabled={!day || !time} onClick={() => setStep('details')}>
                  Continuar
                </Button>
              )}
              {step === 'details' && (
                <>
                  <Button variant="accent" size="lg" fullWidth onClick={() => setStep('confirmed')}>
                    Confirmar agendamento
                  </Button>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', textAlign: 'center', margin: 'var(--space-2) 0 0' }}>
                    Ao confirmar, você aceita os termos de uso.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
