import type { ComponentMeta } from '../catalog';
import { R } from './_shared';

export const avatarMeta: ComponentMeta = {
  slug: 'avatar',
  name: 'Avatar',
  category: 'core',
  summary: 'Circular professional/client identity. Falls back to initials on a brand tint when there is no photo.',
  props: [
    R('name', 'string', 'Full name: drives the initials and the image alt.'),
    R('src', 'string', 'Photo URL. Without it, shows initials.'),
    R('size', "'xs' | 'sm' | 'md' | 'lg' | 'xl'", 'Diameter (24 → 80px).', "'md'"),
    R('status', "'confirmed' | 'pending' | 'cancelled'", 'Lifecycle dot in the lower-right corner (a domain concept).'),
  ],
  code: `<Avatar name="Ana Beatriz Ramos" size="xl" />`,
  examples: [
    {
      id: 'sizes',
      title: 'Sizes',
      description: 'xs 24 · sm 32 · md 40 · lg 56 · xl 80. The initials font size scales with it.',
      code: `<Avatar name="Ana Beatriz Ramos" size="xs" />
<Avatar name="Ana Beatriz Ramos" size="sm" />
<Avatar name="Ana Beatriz Ramos" size="md" />
<Avatar name="Ana Beatriz Ramos" size="lg" />
<Avatar name="Ana Beatriz Ramos" size="xl" />`,
    },
    {
      id: 'initials-photo',
      title: 'Initials and photo',
      description: 'Without `src`, shows the first two initials in Manrope on a brand tint, legible even on a tinted surface.',
      code: `<Avatar name="Ana Beatriz Ramos" size="lg" />
<Avatar name="Carlos Dias" src="/foto.jpg" size="lg" />`,
    },
    {
      id: 'status',
      title: 'With status',
      description: 'A lifecycle dot in the lower-right corner. Use sparingly: only where the avatar’s status matters.',
      code: `<Avatar name="Carlos Dias" size="lg" status="confirmed" />
<Avatar name="Rafael & Bia" size="lg" status="pending" />`,
    },
  ],
  guidelines: {
    do: ['Let the initials fallback do its job when there is no photo.', 'Crop photos to a circle (`radius-avatar`).'],
    dont: ['A generic illustration/blob in place of the photo.', '`status` on every avatar: only where it says something.'],
  },
};
