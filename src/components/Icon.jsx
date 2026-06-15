export function Icon({ children, filled = false }) {
  return (
    <span className="material-symbols-outlined" style={{ fontVariationSettings: filled ? "'FILL' 1" : undefined }}>
      {children}
    </span>
  );
}
