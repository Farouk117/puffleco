function IconBase({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function PancakeIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <ellipse cx="12" cy="17.2" rx="7.5" ry="2" />
      <ellipse cx="12" cy="13.4" rx="6.4" ry="1.8" />
      <ellipse cx="12" cy="9.8" rx="5.3" ry="1.6" />
      <path d="M8.3 7.8c.9-1.6 2.1-2.9 3.8-4.2" />
    </IconBase>
  );
}

export function ToppingIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 3.2c2.6 3.3 4.3 5.9 4.3 8.3a4.3 4.3 0 1 1-8.6 0c0-2.4 1.7-5 4.3-8.3Z" />
    </IconBase>
  );
}

export function TrackIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 3 4.5 6.8v10.4L12 21l7.5-3.8V6.8L12 3Z" />
      <path d="M4.5 6.8 12 10.6l7.5-3.8" />
      <path d="M12 10.6V21" />
    </IconBase>
  );
}

export function ContactIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="M4.3 7 12 12.6 19.7 7" />
    </IconBase>
  );
}

export function LocationIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 21s7-6.4 7-11.6A7 7 0 0 0 5 9.4C5 14.6 12 21 12 21Z" />
      <circle cx="12" cy="9.4" r="2.4" />
    </IconBase>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="0.6" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function DeliveryIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </IconBase>
  );
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconBase>
  );
}

export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c-.7 2.6-3.4 4.8-3.4 8.2a3.4 3.4 0 0 0 6.8 0c0-1-.2-1.8-.6-2.5.2 1.5-.8 2.1-1.3 1.7-.6-.5-.1-1.4-.3-2.3C12.8 5.4 12.5 3.7 12 2Zm-4.3 8.9A5.6 5.6 0 0 0 6 15.4 6 6 0 0 0 12 21.4a6 6 0 0 0 6-6c0-.9-.2-1.6-.5-2.3a4.6 4.6 0 0 1-8-2.3c-.3.4-.5.8-.8 1.1Z" />
    </svg>
  );
}
