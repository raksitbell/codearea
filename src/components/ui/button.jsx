import { cn } from '../../lib/utils';

export function Button({ className, size = 'default', variant = 'default', asChild = false, children, ...props }) {
  const Comp = asChild ? 'span' : 'button';

  return (
    <Comp className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)} {...props}>
      {children}
    </Comp>
  );
}
