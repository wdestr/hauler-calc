// Line-icon set — one consistent stroke system, replacing every emoji in the app.
import type { SVGProps } from 'react';

type IconName =
  | 'coins' | 'crew' | 'fuel' | 'shield' | 'truck' | 'wrench' | 'clip'
  | 'chart' | 'lock' | 'check' | 'bolt' | 'route' | 'download' | 'share'
  | 'arrow' | 'menu' | 'x' | 'spark' | 'scale' | 'flag';

const PATHS: Record<IconName, React.ReactNode> = {
  coins: <><ellipse cx="8" cy="6" rx="5.5" ry="2.5" /><path d="M2.5 6v4c0 1.38 2.46 2.5 5.5 2.5" /><ellipse cx="15" cy="13" rx="5.5" ry="2.5" /><path d="M9.5 13v4c0 1.38 2.46 2.5 5.5 2.5s5.5-1.12 5.5-2.5v-4" /></>,
  crew: <><circle cx="9" cy="7" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 4.5a3 3 0 0 1 0 5.6" /><path d="M17 14.2a5.5 5.5 0 0 1 3.5 5.1" /></>,
  fuel: <><rect x="3" y="4" width="10" height="16" rx="1.5" /><path d="M3 11h10" /><path d="M13 8h3.2a2 2 0 0 1 2 2v6.5a1.8 1.8 0 0 0 3.6 0V9L18 5.5" /></>,
  shield: <><path d="M12 2.5 4.5 5.5v5.2c0 4.8 3.2 8.4 7.5 10.3 4.3-1.9 7.5-5.5 7.5-10.3V5.5L12 2.5Z" /><path d="m8.8 11.8 2.2 2.2 4-4.4" /></>,
  truck: <><path d="M2.5 5.5h11v10h-11z" /><path d="M13.5 9h3.7l3.3 3.3v3.2h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  wrench: <path d="M15.5 5.5a4 4 0 0 1-5.1 5.1l-6 6a2 2 0 1 0 2.9 2.9l6-6a4 4 0 0 0 5.1-5.1l-2.2 2.2-2.1-.6-.6-2.1 2.1-2.3Z" />,
  clip: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4a3 3 0 0 1 6 0" /><path d="M8.5 11h7M8.5 15h5" /></>,
  chart: <><path d="M4 4v16h16" /><path d="M8 15l3-4 3 2 4-6" /></>,
  lock: <><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15" r="1.3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  bolt: <path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" />,
  route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.5" /></>,
  download: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="5.5" r="2.5" /><circle cx="17" cy="18.5" r="2.5" /><path d="m8.3 10.7 6.4-3.9M8.3 13.3l6.4 3.9" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  spark: <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-6.5-2.8 2.8m-3.4 3.4-2.8 2.8m9-.1-2.8-2.8m-3.4-3.4L7.5 5.5" />,
  scale: <><path d="M12 3v18M7 21h10" /><path d="M12 5 5 8l-2.5 5a3 3 0 0 0 5 0L5 8m14 0-2.5 5a3 3 0 0 0 5 0L19 8l-7-3" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 5h11l-2 3 2 3H5" /></>,
};

export default function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };
