/** Which nav destinations have a real screen — everything else falls back to `ComingSoonView` /
 * `ComingSoon`. Kept as `Set`s next to the views that actually read them. */
export const KNOWN_BASES = new Set(['agenda', 'clientes', 'servicos', 'financeiro', 'relatorios', 'config', 'bloqueios']);
export const KNOWN_CONFIG = new Set(['perfil', 'grade', 'lembretes']);
export const KNOWN_FINANCE = new Set(['resumo', 'receber']);

/** Today's date, pt-BR — `short` picks the abbreviated weekday ("Seg" vs "Segunda-feira"). */
export function todayLabel(short: boolean): string {
  const s = new Date().toLocaleDateString('pt-BR', {
    weekday: short ? 'short' : 'long',
    day: 'numeric',
    month: 'long',
  });
  const clean = s.replace(/\./g, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
