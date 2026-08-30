/**
 * Hand-rolled input masks — no dependency. `formatMask` takes a preset name (or a
 * custom `#`-per-digit pattern) and a raw string, and returns the formatted value.
 * Extra characters are dropped; separators are inserted positionally.
 */

export type MaskName = 'phone' | 'cpf' | 'cep' | 'currency';

const onlyDigits = (s: string) => s.replace(/\D/g, '');

/** Apply a positional pattern where `#` is one digit and everything else is a literal. */
function applyPattern(pattern: string, raw: string): string {
  const d = onlyDigits(raw);
  let out = '';
  let i = 0;
  for (const ch of pattern) {
    if (i >= d.length) break;
    if (ch === '#') out += d[i++];
    else out += ch;
  }
  return out;
}

const PHONE_10 = '(##) ####-####'; // landline
const PHONE_11 = '(##) #####-####'; // mobile

/**
 * BR currency amount — digits are read as cents. "1234" → "12,34". No symbol:
 * pair it with `prefix="R$"` on the field so the value stays a plain number string.
 */
function currencyBRL(raw: string): string {
  const cents = (onlyDigits(raw).replace(/^0+/, '') || '0').padStart(3, '0');
  const int = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${int},${cents.slice(-2)}`;
}

export function formatMask(name: MaskName | string, raw: string): string {
  if (!raw) return '';
  switch (name) {
    case 'phone':
      return applyPattern(onlyDigits(raw).length > 10 ? PHONE_11 : PHONE_10, raw);
    case 'cpf':
      return applyPattern('###.###.###-##', raw);
    case 'cep':
      return applyPattern('#####-###', raw);
    case 'currency':
      return currencyBRL(raw);
    default:
      return applyPattern(name, raw); // custom '#' pattern
  }
}

/** Max length of the fully-formatted value, so the field stops accepting input. */
export const MASK_MAXLENGTH: Record<string, number> = {
  phone: 15, // "(11) 99999-9999"
  cpf: 14, // "000.000.000-00"
  cep: 9, // "00000-000"
  currency: 14, // "999.999.999,99"
};

export const MASK_INPUTMODE: Record<string, 'numeric' | 'tel'> = {
  phone: 'tel',
  cpf: 'numeric',
  cep: 'numeric',
  currency: 'numeric',
};
