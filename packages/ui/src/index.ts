// Sereno Design System — public component surface.
// 25 primitives ported 1:1 from the approved DS source, plus FileUpload (SS-49),
// AvatarUpload (SS-146), SearchInput (SS-50) and SidebarNav (SS-52) — all
// net-new. Icons are passed in as props (lucide-react), never imported here;
// theming is 100% CSS custom properties.

// core
export { Button, type ButtonProps } from './core/Button';
export { IconButton, type IconButtonProps } from './core/IconButton';
export { Badge, type BadgeProps } from './core/Badge';
export { Card, type CardProps } from './core/Card';
export { Avatar, type AvatarProps } from './core/Avatar';
export { Brand, type BrandProps } from './core/Brand';

// forms
export { Input, type InputProps } from './forms/Input';
export { Textarea, type TextareaProps } from './forms/Textarea';
export { Select, type SelectProps, type SelectOption } from './forms/Select';
export { Checkbox, type CheckboxProps } from './forms/Checkbox';
export { Radio, type RadioProps } from './forms/Radio';
export { Switch, type SwitchProps } from './forms/Switch';
export { DateTimePicker, type DateTimePickerProps, type TimeSlot } from './forms/DateTimePicker';
export { FileUpload, type FileUploadProps } from './forms/FileUpload';
export { AvatarUpload, type AvatarUploadProps } from './forms/AvatarUpload';
export { SearchInput, type SearchInputProps } from './forms/SearchInput';

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
export {
  SidebarNav,
  type SidebarNavProps,
  type SidebarNavSection,
  type SidebarNavItem,
  type SidebarNavSubItem,
} from './navigation/SidebarNav';
export { Stepper, type StepperProps, type StepperStep } from './navigation/Stepper';

// feedback
export { Alert, type AlertProps } from './feedback/Alert';
export { Toast, type ToastProps } from './feedback/Toast';
export { Dialog, type DialogProps } from './feedback/Dialog';
export { Skeleton, type SkeletonProps } from './feedback/Skeleton';
export { EmptyState, type EmptyStateProps } from './feedback/EmptyState';

// theme — the `data-theme` provider (next-themes) + the light/dark toggle
export { ThemeProvider } from './theme/ThemeProvider';
export { ThemeToggle } from './theme/ThemeToggle';
