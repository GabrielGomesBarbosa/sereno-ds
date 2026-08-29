// Sereno Design System — public component surface.
// Ported 1:1 from the approved DS source (25 primitives). Icons are passed in as
// props (lucide-react), never imported here; theming is 100% CSS custom properties.

// core
export { Button, type ButtonProps } from './core/Button';
export { IconButton, type IconButtonProps } from './core/IconButton';
export { Badge, type BadgeProps } from './core/Badge';
export { Card, type CardProps } from './core/Card';
export { Avatar, type AvatarProps } from './core/Avatar';

// forms
export { Input, type InputProps } from './forms/Input';
export { Textarea, type TextareaProps } from './forms/Textarea';
export { Select, type SelectProps, type SelectOption } from './forms/Select';
export { Checkbox, type CheckboxProps } from './forms/Checkbox';
export { Radio, type RadioProps } from './forms/Radio';
export { Switch, type SwitchProps } from './forms/Switch';
export { DateTimePicker, type DateTimePickerProps, type TimeSlot } from './forms/DateTimePicker';

// domain
export { ServiceCard, type ServiceCardProps } from './domain/ServiceCard';
export { ProfessionalCard, type ProfessionalCardProps } from './domain/ProfessionalCard';
export { AppointmentCard, type AppointmentCardProps } from './domain/AppointmentCard';
export {
  WeeklyScheduleEditor,
  type WeeklyScheduleEditorProps,
  type WeekSchedule,
  type DaySchedule,
  type DayKey,
} from './domain/WeeklyScheduleEditor';

// navigation
export { TopBar, type TopBarProps } from './navigation/TopBar';
export { Tabs, type TabsProps, type TabItem } from './navigation/Tabs';
export { BottomNav, type BottomNavProps, type BottomNavItem } from './navigation/BottomNav';
export { Stepper, type StepperProps, type StepperStep } from './navigation/Stepper';

// feedback
export { Alert, type AlertProps } from './feedback/Alert';
export { Toast, type ToastProps } from './feedback/Toast';
export { Dialog, type DialogProps } from './feedback/Dialog';
export { Skeleton, type SkeletonProps } from './feedback/Skeleton';
export { EmptyState, type EmptyStateProps } from './feedback/EmptyState';
