type IconProps = { size?: number; className?: string }

const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

export function VestidoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Vestido</title>
      <path d="M12 6V4.2a1.8 1.8 0 1 1 3 1.3" />
      <path d="M6 8.5L12 6l6 2.5" />
      <path d="M8.5 7v3" />
      <path d="M15.5 7v3" />
      <path d="M8.5 10q3.5 2.5 7 0l-.5 3 4.5 8q-7.5 1.5-15 0l4.5-8z" />
      <path d="M9 13q3 1.5 6 0" />
    </svg>
  )
}

export function TenisIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Tênis</title>
      <path d="M5 10c-1.5 0-2 2-2 5v3c0 .6.4 1 1 1h14.5c1.5 0 2.5-1 2.5-2.5 0-1.5-1-3.5-6.5-3.5L10.5 9.5C8.5 11.5 6.5 11.5 5 10z" />
      <path d="M3 16h15c1.5 0 2.5-.5 2.8-1" />
      <path d="M10 11.5l2.5 1.3" />
      <path d="M12 9.5l2.5 1.3" />
    </svg>
  )
}

export function SofaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Sofá</title>
      <path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M5 12h14M5 16h14M12 5v11M5 9H3.5A1.5 1.5 0 0 0 2 10.5v4A1.5 1.5 0 0 0 3.5 16H5zM19 9h1.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H19zM6 16l-1 3.5M18 16l1 3.5" />
    </svg>
  )
}

export function PerfumeIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Perfume</title>
      <path d="M2 3l2.5 1.5M1.5 5h2.5M2 7l2.5-1.5" />
      <path d="M7.5 5H10" />
      <path d="M10 7V3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V7" />
      <path d="M9 9V7h6v2" />
      <path d="M8 9h8c1.5 0 3 1.5 3 3v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7c0-1.5 1.5-3 3-3z" />
      <path d="M12 9v9" />
    </svg>
  )
}

export function BolsaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Bolsa</title>
      <path d="M8 10V6a4 4 0 0 1 8 0v4" />
      <path d="M5 10h14l1 7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3l1-7z" />
      <path d="M5 10l7 4.5 7-4.5" />
      <path d="M12 14.5v2.5" />
    </svg>
  )
}

export function OculosIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Óculos</title>
      <path d="M2 7l2 3.5 M4 10.5h6.5v3c0 2.5-1.5 4-3.25 4S4 16 4 13.5z M10.5 11.5c.75-1.3 2.25-1.3 3 0 M13.5 10.5H20v3c0 2.5-1.5 4-3.25 4s-3.25-1.5-3.25-4z M22 7l-2 3.5" />
    </svg>
  )
}

export function CalcaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Calça</title>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M5 8h14 M8 4v4 M16 4v4 M12 6h.01 M12 8v3.5a1.5 1.5 0 0 1-1.5 1.5 M5 11c2 0 3.5-1 3.5-3 M19 11c-2 0-3.5-1-3.5-3 M5 15h14 M12 15v5" />
    </svg>
  )
}

export function BlusaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Blusa</title>
      <path d="M9 4L4 6L2 10.5L6 12V20H18V12L22 10.5L20 6L15 4Q12 2.5 9 4Z" />
      <path d="M9 4C9 7.5 15 7.5 15 4" />
    </svg>
  )
}

export function CasacoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Casaco</title>
      <path d="M7.5 6.5C7.5 3.2 16.5 3.2 16.5 6.5" />
      <path d="M8 6.5L3 13.5L6 14.5L7 10.5V21H17V10.5L18 14.5L21 13.5L16 6.5" />
      <path d="M8 6.5L12 10L16 6.5" />
      <path d="M12 10V21" />
      <path d="M8.5 15.5H10.5" />
      <path d="M13.5 15.5H15.5" />
    </svg>
  )
}

export function SaiaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Saia</title>
      <path d="M 8 4 Q 12 5.5 16 4 L 20 19 Q 12 21 4 19 Z" />
      <path d="M 7.5 7.5 Q 12 9 16.5 7.5" />
      <path d="M 12 8.5 V 20.5" />
      <path d="M 9.5 8.2 Q 7 10.5 5.8 12.5" />
      <path d="M 14.5 8.2 Q 17 10.5 18.2 12.5" />
    </svg>
  )
}

export function ShortsIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Shorts</title>
      <path d="M6 6h12l1.5 11h-6L12 13.5 10.5 17h-6L6 6z" />
      <path d="M5.6 9h12.8" />
      <path d="M12 9v3.5" />
      <path d="M8.5 9c0 1.2-1 2.2-3.2 2.4" />
      <path d="M15.5 9c0 1.2 1 2.2 3.2 2.4" />
    </svg>
  )
}

export function TernoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Terno</title>
      <path d="M3 8l5-5h8l5 5-1 13H4L3 8zM8 3l3 3m5-3l-3 3M8 3l-2.5 5.5L7.5 9 12 15v6m4-18l2.5 5.5L16.5 9 12 15m-1-9h2l-.5 2 1 4-1 2-1-2-.5-4h1zM11.5 8h1m4 4h2" />
    </svg>
  )
}

export function MamadeiraIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Mamadeira</title>
      <path d="M9.5 7c0-1.5 1-2 1-3.5a1.5 1.5 0 0 1 3 0c0 1.5 1 2 1 3.5" />
      <rect x="6.5" y="7" width="11" height="3" rx="1" />
      <path d="M7.5 10v9.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V10" />
      <path d="M7.5 13h3M7.5 16h2M7.5 19h3" />
    </svg>
  )
}
