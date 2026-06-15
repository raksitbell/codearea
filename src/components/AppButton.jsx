import { Button as UiButton } from './ui/button';

export function AppButton({ children, large = false, variant = 'primary', ...props }) {
  const mappedVariant = variant === 'ghost' ? 'outline' : variant === 'danger' ? 'danger' : 'default';
  return (
    <UiButton size={large ? 'lg' : 'default'} variant={mappedVariant} {...props}>
      {children}
    </UiButton>
  );
}
