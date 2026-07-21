import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";

export function Footer() {
  return (
    <footer className="relative z-10 flex w-full flex-col items-center justify-between border-t border-line bg-surface/70 px-6 py-12 backdrop-blur-xl md:flex-row">
      <CodeAreaLogo
        showText
        className="mb-4 md:mb-0 flex items-center gap-2"
        iconClassName="h-6 w-6"
        textClassName="text-xl sm:text-xl xl:text-2xl font-bold text-foreground"
      />
      <p className="mt-4 text-[10px] font-medium uppercase tracking-widest text-text-muted md:mt-0">
        &copy; {new Date().getFullYear()} CodeArea. Global Coding Standard.
      </p>
    </footer>
  );
}
