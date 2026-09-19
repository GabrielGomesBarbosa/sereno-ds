'use client';

import * as React from 'react';
import { Calendar, CalendarPlus, CheckCircle2, ChevronLeft, Clock, CreditCard, HelpCircle, Info, Mail, MapPin, Navigation, Phone, Share2, ShieldCheck, Star, User, Video } from 'lucide-react';
import { Avatar, Badge, Brand, Button, Card, Checkbox, DateTimePicker, IconButton, Input, Tabs, Textarea, TopBar, Typography } from '@sereno-ds/ui';
import { ServiceCard } from '@/domain/ServiceCard';
import { ProfessionalCard } from '@/domain/ProfessionalCard';
import { vcol } from '@/domain/layout';
import type { Professional, Service } from '@/lib/mock';
import { BOOKING_MONTH, PROFESSIONAL_FAQ, PROFESSIONAL_INSURANCE, REVIEWS, TIME_SLOTS, UNAVAILABLE_DAYS } from '@/lib/mock';

type Step = 'profile' | 'schedule' | 'details' | 'confirmed';

const DATE_LONG = '14 de agosto de 2026, sexta';

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
        <Brand variant="lockup" size={22} />
        <IconButton label="Compartilhar" variant="secondary">
          <Share2 size={20} strokeWidth={1.75} />
        </IconButton>
      </div>
      <ProfessionalCard
        name={professional.name}
        specialty={professional.specialty}
        credential={professional.credential}
        location={professional.location}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
        {professional.channels.map((c) => (
          <Badge key={c} tone="info" dot={false}>
            {c}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/** Desktop persistent left panel: identity + a summary that fills in as you go. */
function Rail({ professional, service, day, time }: { professional: Professional; service: Service | null; day: number | null; time: string | null }) {
  return (
    <>
      <Brand variant="lockup" size={22} />
      <div style={vcol('var(--space-3)')}>
        <ProfessionalCard
          name={professional.name}
          specialty={professional.specialty}
          credential={professional.credential}
          location={professional.location}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {professional.channels.map((c) => (
            <Badge key={c} tone="info" dot={false}>
              {c}
            </Badge>
          ))}
        </div>
      </div>

      {(service || (day && time)) && (
        <div style={{ ...vcol('var(--space-4)'), paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-default)' }}>
          {service && (
            <div style={vcol('4px')}>
              <Typography variant="eyebrow">Serviço</Typography>
              <Typography variant="h3" style={{ fontSize: 'var(--text-base)' }}>
                {service.name}
              </Typography>
              <Typography variant="bodySm">
                {service.duration} · {service.price}
              </Typography>
            </div>
          )}
          {day && time && (
            <div style={vcol('4px')}>
              <Typography variant="eyebrow">Quando</Typography>
              <Typography variant="bodySm">
                {day} de agosto · {time}
              </Typography>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function BookingFlow({ professional, services }: { professional: Professional; services: Service[] }) {
  const [step, setStep] = React.useState<Step>('profile');
  const [profileTab, setProfileTab] = React.useState('servicos');
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
              <TopBar>
                <TopBar.Leading>
                  <IconButton label="Voltar" onClick={() => setStep(step === 'schedule' ? 'profile' : 'schedule')}>
                    <ChevronLeft size={20} strokeWidth={1.75} />
                  </IconButton>
                </TopBar.Leading>
                <TopBar.Title subtitle={step === 'schedule' ? service?.name : undefined}>
                  {step === 'schedule' ? 'Escolha o horário' : 'Seus dados'}
                </TopBar.Title>
              </TopBar>
              <Progress step={step === 'schedule' ? 0 : 1} />
            </div>
          )}
          {step === 'confirmed' && (
            <div className="booking-chrome">
              <TopBar>
                <TopBar.Leading>
                  <Brand variant="lockup" size={22} />
                </TopBar.Leading>
              </TopBar>
            </div>
          )}

          {/* Desktop back link for inner steps */}
          {(step === 'schedule' || step === 'details') && (
            <Button
              className="booking-backbtn"
              variant="ghost"
              size="sm"
              iconLeft={<ChevronLeft size={16} strokeWidth={1.75} />}
              onClick={() => setStep(step === 'schedule' ? 'profile' : 'schedule')}
            >
              Voltar
            </Button>
          )}

          {step === 'profile' && (
            <div className="booking-scroll" style={{ paddingBlock: 'var(--space-5) var(--space-8)', gap: 0 }}>
              {/* The public profile's real sections — page-level, exactly what
                  `underline` is for. Narrow enough on this booking card that
                  it overflows on its own, no forced narrowing needed. */}
              <Tabs value={profileTab} onChange={setProfileTab}>
                <Tabs.List>
                  <Tabs.Tab value="servicos">Serviços</Tabs.Tab>
                  <Tabs.Tab value="sobre">Sobre</Tabs.Tab>
                  <Tabs.Tab value="avaliacoes" count={REVIEWS.length}>
                    Avaliações
                  </Tabs.Tab>
                  <Tabs.Tab value="localizacao">Localização</Tabs.Tab>
                  <Tabs.Tab value="horarios">Horários</Tabs.Tab>
                  <Tabs.Tab value="convenios">Convênios</Tabs.Tab>
                  <Tabs.Tab value="faq">Perguntas frequentes</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="servicos" style={{ ...vcol('var(--space-3)'), paddingTop: 'var(--space-4)' }}>
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
                  <Typography variant="caption" as="p" style={{ margin: 'var(--space-2) 0 0' }}>
                    Cancelamentos gratuitos até 24h antes do horário marcado.
                  </Typography>
                </Tabs.Panel>

                <Tabs.Panel value="sobre" style={{ ...vcol('var(--space-4)'), paddingTop: 'var(--space-4)' }}>
                  <Typography variant="bodySm" style={{ lineHeight: 1.6 }}>
                    {professional.bio}
                  </Typography>
                  <Card padding="md" style={vcol('var(--space-2)')}>
                    {[
                      ['Especialidade', professional.specialty],
                      ['Registro', professional.credential],
                      ['Atendimento', professional.channels.join(' · ')],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                        <Typography variant="bodySm" color="muted">
                          {label}
                        </Typography>
                        <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                          {value}
                        </Typography>
                      </div>
                    ))}
                  </Card>
                </Tabs.Panel>

                <Tabs.Panel value="avaliacoes" style={{ ...vcol('var(--space-4)'), paddingTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Star size={20} strokeWidth={1.75} fill="currentColor" style={{ color: 'var(--status-warning-dot)' }} />
                    <Typography as="span" variant="h2" style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>
                      {(REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1)}
                    </Typography>
                    <Typography variant="bodySm" color="muted">
                      · {REVIEWS.length} avaliações
                    </Typography>
                  </div>
                  <div style={vcol('var(--space-3)')}>
                    {REVIEWS.map((r) => (
                      <Card key={r.name} padding="md" style={vcol('var(--space-2)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <Avatar name={r.name} size="sm" />
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                            <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                              {r.name}
                            </Typography>
                            <span style={{ display: 'flex', gap: 1 }}>
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} size={12} strokeWidth={1.75} fill={i < r.rating ? 'currentColor' : 'none'} style={{ color: 'var(--status-warning-dot)' }} />
                              ))}
                            </span>
                          </div>
                          <Typography variant="caption">{r.date}</Typography>
                        </div>
                        <Typography variant="bodySm">{r.comment}</Typography>
                      </Card>
                    ))}
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="localizacao" style={{ ...vcol('var(--space-3)'), paddingTop: 'var(--space-4)' }}>
                  <Card padding="md" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <MapPin size={20} strokeWidth={1.75} style={{ color: 'var(--text-brand)', flexShrink: 0, marginTop: 2 }} />
                    <div style={vcol('2px')}>
                      <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }}>
                        Consultório — {professional.location}
                      </Typography>
                      <Typography variant="bodySm">Rua Fradique Coutinho, 501 — Pinheiros</Typography>
                    </div>
                  </Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Navigation size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <Typography variant="bodySm">
                      {professional.channels.includes('Online') ? 'Também atende por videochamada, em qualquer cidade.' : 'Atendimento só presencial, neste endereço.'}
                    </Typography>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="horarios" style={{ ...vcol('var(--space-2)'), paddingTop: 'var(--space-4)' }}>
                  <Card padding="md" style={vcol('var(--space-2)')}>
                    {[
                      ['Segunda a sexta', '9h às 18h'],
                      ['Sábado', '9h às 13h'],
                      ['Domingo', 'Fechado'],
                    ].map(([day, hours]) => (
                      <div key={day} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                        <Typography variant="bodySm">{day}</Typography>
                        <Typography variant="h3" style={{ fontSize: 'var(--text-sm)' }} color={hours === 'Fechado' ? 'muted' : 'primary'}>
                          {hours}
                        </Typography>
                      </div>
                    ))}
                  </Card>
                  <Typography as="span" variant="caption" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Clock size={14} strokeWidth={1.75} /> Horário de Brasília.
                  </Typography>
                </Tabs.Panel>

                <Tabs.Panel value="convenios" style={{ ...vcol('var(--space-3)'), paddingTop: 'var(--space-4)' }}>
                  <Card padding="md" style={vcol('var(--space-3)')}>
                    {PROFESSIONAL_INSURANCE.map((plan) => (
                      <div key={plan} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <CheckCircle2 size={16} strokeWidth={1.75} style={{ color: 'var(--status-success-dot)', flexShrink: 0 }} />
                        <Typography variant="bodySm" color="primary">
                          {plan}
                        </Typography>
                      </div>
                    ))}
                  </Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <ShieldCheck size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <Typography variant="bodySm">Consulta particular também disponível, com recibo para reembolso.</Typography>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="faq" style={{ ...vcol('var(--space-4)'), paddingTop: 'var(--space-4)' }}>
                  {PROFESSIONAL_FAQ.map((item) => (
                    <div key={item.question} style={vcol('4px')}>
                      <Typography as="span" variant="h3" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                        <HelpCircle size={16} strokeWidth={1.75} style={{ color: 'var(--text-brand)', flexShrink: 0, marginTop: 2 }} />
                        {item.question}
                      </Typography>
                      <Typography variant="bodySm" style={{ paddingLeft: 24 }}>
                        {item.answer}
                      </Typography>
                    </div>
                  ))}
                </Tabs.Panel>
              </Tabs>
            </div>
          )}

          {step === 'schedule' && service && (
            <div className="booking-scroll" style={{ paddingBlock: '0 var(--space-8)' }}>
              <Typography as="span" variant="h2" className="booking-step-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-4)' }}>
                Escolha o horário
              </Typography>
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
                <Typography variant="caption">Horários no fuso de Brasília (GMT-3).</Typography>
              </div>
            </div>
          )}

          {step === 'details' && service && (
            <div className="booking-scroll" style={{ paddingBlock: '0 var(--space-8)', gap: 'var(--space-4)' }}>
              <Typography as="span" variant="h2" className="booking-step-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
                Seus dados
              </Typography>
              {/* Recap of the choice so far — the desktop rail already shows it, so mobile/tablet only. */}
              <div className="booking-chrome">
                <Card padding="md" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', background: 'var(--bg-brand-soft)', border: '1px solid transparent' }}>
                  <Calendar size={20} strokeWidth={1.75} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h3" style={{ fontSize: 'var(--text-base)' }}>
                      {service.name}
                    </Typography>
                    <Typography variant="bodySm">
                      {day ?? 14} de agosto · {time} · {service.duration}
                    </Typography>
                  </div>
                </Card>
              </div>
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
              <Typography as="span" variant="h2" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                Agendamento confirmado
              </Typography>
              <Typography variant="body" color="secondary" style={{ maxWidth: 320 }}>
                Enviamos os detalhes no seu WhatsApp. {professional.name.split(' ')[0]} já foi avisada.
              </Typography>
              <Card padding="md" style={{ ...vcol('var(--space-3)'), width: '100%', maxWidth: 380, textAlign: 'left', marginTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h3">{service.name}</Typography>
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
                    <Typography variant="bodySm">{text}</Typography>
                  </div>
                ))}
              </Card>
              <div style={{ ...vcol('var(--space-2)'), width: '100%', maxWidth: 380, marginTop: 'var(--space-2)' }}>
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
                  <Typography variant="caption" as="p" style={{ fontSize: 'var(--text-2xs)', textAlign: 'center', margin: 'var(--space-2) 0 0' }}>
                    Ao confirmar, você aceita os termos de uso.
                  </Typography>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
