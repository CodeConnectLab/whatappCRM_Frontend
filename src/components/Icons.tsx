/**
 * Inline SVGs — no extra dependency.
 *
 * Drawn on the App Design 16×16 grid with a 1.4–1.5 hairline stroke so they sit
 * at the same optical weight as the rest of the interface. Size is controlled by
 * the caller through `className` (e.g. `h-4 w-4`).
 */
import type { SVGProps } from 'react';

type IconProps = { className?: string } & Omit<SVGProps<SVGSVGElement>, 'className' | 'strokeWidth'> & {
    strokeWidth?: number;
  };

function Icon({ className, children, strokeWidth = 1.4, ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 6.8 8 2.5l5.5 4.3v6a.7.7 0 0 1-.7.7H3.2a.7.7 0 0 1-.7-.7v-6Z" />
    </Icon>
  );
}

export function IconChat(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 3.5h11v9h-11z" />
      <path d="M2.5 8.5h3l1 2h3l1-2h3" />
    </Icon>
  );
}

export function IconContact(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6.2" cy="6" r="2.5" />
      <path d="M1.8 13c.4-2.3 2.2-3.6 4.4-3.6S10.2 10.7 10.6 13" />
      <path d="M10.6 4.2a2.3 2.3 0 0 1 0 4.4M11.8 13h2.4c-.2-1.6-.9-2.7-2.2-3.2" />
    </Icon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6.2" cy="6" r="2.5" />
      <path d="M1.8 13c.4-2.3 2.2-3.6 4.4-3.6S10.2 10.7 10.6 13" />
      <path d="M10.6 4.2a2.3 2.3 0 0 1 0 4.4M11.8 13h2.4c-.2-1.6-.9-2.7-2.2-3.2" />
    </Icon>
  );
}

export function IconGroups(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.2" y="2.4" width="5" height="5" rx="1" />
      <rect x="8.8" y="2.4" width="5" height="5" rx="1" />
      <rect x="2.2" y="8.8" width="5" height="5" rx="1" />
      <rect x="8.8" y="8.8" width="5" height="5" rx="1" />
    </Icon>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 6.2v3.6h2.3l4.8 2.9V3.3L4.8 6.2H2.5Z" />
      <path d="M12 5.6a3.4 3.4 0 0 1 0 4.8" />
    </Icon>
  );
}

export function IconTemplate(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 3.2h11v9.6h-11z" />
      <path d="M2.5 6.4h11M6.2 6.4v6.4" />
    </Icon>
  );
}

export function IconReports(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.6 13.2V9.4M6.4 13.2V4.2M10.2 13.2V7M14 13.2V2.8" />
    </Icon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="2.1" />
      <path d="M8 1.9v1.6M8 12.5v1.6M14.1 8h-1.6M3.5 8H1.9M12.3 3.7l-1.1 1.1M4.8 11.2l-1.1 1.1M12.3 12.3l-1.1-1.1M4.8 4.8 3.7 3.7" />
    </Icon>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.4 4.6a1 1 0 0 1 1-1h8.2a1 1 0 0 1 1 1v1.2" />
      <rect x="2.4" y="4.6" width="11.2" height="8.2" rx="1.2" />
      <path d="M13.6 7.6h-2.7a1.4 1.4 0 0 0 0 2.8h2.7" />
    </Icon>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.6" />
      <path d="M8 5.2v3.4l2 1.2" />
    </Icon>
  );
}

export const IconClock = IconActivity;

export function IconBuilding(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.6 13.4V3.4a.8.8 0 0 1 .8-.8h5.4a.8.8 0 0 1 .8.8v10" />
      <path d="M9.6 6.6h3a.8.8 0 0 1 .8.8v6M1.6 13.4h12.8" />
      <path d="M4.8 5.2h1.4M4.8 7.8h1.4M4.8 10.4h1.4" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <circle cx="7.2" cy="7.2" r="4.3" />
      <path d="m10.5 10.5 3 3" />
    </Icon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="m4 6.5 4 4 4-4" />
    </Icon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="m6.5 4 4 4-4 4" />
    </Icon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Icon strokeWidth={1.8} {...props}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon strokeWidth={1.8} {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="m3.5 8.4 3 3 6-6.4" />
    </Icon>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 7.2v3.6M8 5.1v.6" />
    </Icon>
  );
}

export function IconImport(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="M8 2.4v7.6M4.6 6.6 8 10l3.4-3.4M2.8 13.2h10.4" />
    </Icon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="M2.6 4.4h10.8M2.6 8h10.8M2.6 11.6h10.8" />
    </Icon>
  );
}

export function IconPaperclip(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <path d="M11.6 7.4 7.5 11.5a2.4 2.4 0 0 1-3.4-3.4l4.6-4.6a1.6 1.6 0 1 1 2.3 2.3L6.4 10.4a.8.8 0 0 1-1.1-1.1l4.1-4.1" />
    </Icon>
  );
}

export function IconSmile(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <circle cx="8" cy="8" r="5.8" />
      <path d="M5.6 9.4a2.9 2.9 0 0 0 4.8 0" />
      <path d="M6.1 6.3v.5M9.9 6.3v.5" />
    </Icon>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M8 1.6v1.4M8 13v1.4M14.4 8H13M3 8H1.6M12.5 3.5l-1 1M4.5 11.5l-1 1M12.5 12.5l-1-1M4.5 4.5l-1-1" />
    </Icon>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.7 5.7 0 1 0 6.8 6.8Z" />
    </Icon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <path d="M9.8 4.6V3.4a.9.9 0 0 0-.9-.9H3.6a.9.9 0 0 0-.9.9v9.2a.9.9 0 0 0 .9.9h5.3a.9.9 0 0 0 .9-.9v-1.2" />
      <path d="M7.4 8h6.2M11.4 5.8 13.6 8l-2.2 2.2" />
    </Icon>
  );
}

export function LogoMark(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-brand" />
      <path
        d="M8 10c0-.5.4-1 1-1h4l2 4 2-4h4c.6 0 1 .5 1 1v12c0 .6-.4 1-1 1h-3v-7l-2 3-2-3v7h-3c-.6 0-1-.4-1-1V10Z"
        fill="#fff"
      />
    </svg>
  );
}
