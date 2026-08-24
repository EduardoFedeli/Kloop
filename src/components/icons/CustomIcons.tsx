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

export function BodyBebeIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Body de bebê</title>
      <path d="M8 4L4 6L3 9.5L7 11V14C7 17 8.5 19.5 10 20H14C15.5 19.5 17 17 17 14V11L21 9.5L20 6L16 4" />
      <path d="M8 4C8 8 16 8 16 4" />
      <path d="M5.5 5.25C7.5 5.25 9.5 6.25 10.5 7.5" />
      <path d="M18.5 5.25C16.5 5.25 14.5 6.25 13.5 7.5" />
      <path d="M9 17C10.5 18 13.5 18 15 17" />
    </svg>
  )
}

export function PijamaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Pijama</title>
      <path d="M 17 2 A 3.5 3.5 0 0 0 20.5 5.5 A 2.8 2.8 0 0 1 17 2 Z" />
      <path d="M 5 2 v 3 M 3.5 3.5 h 3" />
      <path d="M 6 17 v 2 a 2 2 0 0 0 2 2 h 8 a 2 2 0 0 0 2 -2 v -2" />
      <path d="M 12 19 v 2" />
      <rect x="4" y="8" width="16" height="9" rx="2" />
      <path d="M 8.5 8 L 12 11.5 L 15.5 8" />
      <path d="M 9.5 9 L 7.5 9.5" />
      <path d="M 14.5 9 L 16.5 9.5" />
      <path d="M 12 11.5 V 17" />
      <path d="M 6.5 13 H 9.5" />
      <path d="M 12 14.5 h 0.01" />
    </svg>
  )
}

export function MaquiagemIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Maquiagem</title>
      <path d="M9 10V3l6 4v3" />
      <path d="M8 14v-4h8v4" />
      <path d="M6 14h12v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-6z" />
    </svg>
  )
}

export function SkincareIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Skincare</title>
      <path d="M7 6h7.5V3.5h-3L7 6z" />
      <path d="M12 6v3" />
      <path d="M9 11V9h6v2" />
      <rect x="6" y="11" width="12" height="10" rx="2" />
      <path d="M12 13.5c0 0-2 2.3-2 3.5a2 2 0 0 0 4 0c0-1.2-2-3.5-2-3.5z" />
    </svg>
  )
}

export function CamisaSocialIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Camisa social</title>
      <path d="M8 3.5L2.5 6.5L4 11.5L7 10.5V20.5H17V10.5L20 11.5L21.5 6.5L16 3.5" />
      <path d="M8 3.5Q12 1.8 16 3.5" />
      <path d="M8 3.5L9.5 9L12 6.5L14.5 9L16 3.5" />
      <path d="M12 6.5V20.5" />
      <path d="M13.5 12H16V15.5H13.5Z" />
    </svg>
  )
}

export function UnhaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Esmalte</title>
      <rect x="9" y="3" width="6" height="7" rx="1" />
      <path d="M10 10v2H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-3v-2" />
      <path d="M8 15v3" />
    </svg>
  )
}

export function CabeloIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Secador de cabelo</title>
      <path d="M 5 9 L 8 8 H 15 A 3 3 0 0 1 15 14 L 13 21 A 1.5 1.5 0 0 1 10 21 L 12 14 H 8 L 5 13 Z" />
      <path d="M 8 8 V 14" />
      <path d="M 15 8 V 14" />
      <path d="M 11.5 16.5 L 11 18.5" />
      <path d="M 2 9 H 3.5" />
      <path d="M 0.5 11 H 3.5" />
      <path d="M 2 13 H 3.5" />
    </svg>
  )
}

export function MochilaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Mochila</title>
      <path d="M 6 8.5 C 3.5 8.5 2 10.2 2 12.5 C 2 14.8 3.5 16.5 6 16.5" />
      <path d="M 18 8.5 C 20.5 8.5 22 10.2 22 12.5 C 22 14.8 20.5 16.5 18 16.5" />
      <path d="M 9 4.5 C 9 3.1 10.3 2 12 2 C 13.7 2 15 3.1 15 4.5" />
      <path d="M 6 20 V 10 C 6 6.7 8.7 4 12 4 C 15.3 4 18 6.7 18 10 V 20 C 18 20.6 17.6 21 17 21 H 7 C 6.4 21 6 20.6 6 20 Z" />
      <path d="M 9 10 H 15" />
      <rect x="8" y="13" width="8" height="6" rx="1.5" />
    </svg>
  )
}

export function ClutchIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Clutch</title>
      <path d="M 5 10 C 1.5 10 1.5 17 5 17" />
      <rect x="5" y="8" width="16" height="12" rx="2" />
      <path d="M 11.5 8 V 5.5 C 11.5 4.67 12.17 4 13 4 C 13.83 4 14.5 4.67 14.5 5.5 V 8" />
      <path d="M 5 8 L 13 14 L 21 8" />
    </svg>
  )
}

export function ToteIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Tote</title>
      <path d="M5 8h14l1 12H4z" />
      <path d="M8 11V6a4 4 0 0 1 8 0v5" />
    </svg>
  )
}

export function CrossbodyIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Crossbody</title>
      <path d="M 9 13 L 4.8 5.2 C 3.8 3.6 5.2 2 6.8 2.8 L 19 13" />
      <path d="M 8 13 h 12 v 5 a 2 2 0 0 1 -2 2 h -8 a 2 2 0 0 1 -2 -2 z" />
      <path d="M 8 13 l 6 4 l 6 -4" />
      <path d="M 13 18.5 h 2" />
    </svg>
  )
}

export function MaletaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Maleta</title>
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 13h18" />
      <path d="M8 11v4" />
      <path d="M16 11v4" />
    </svg>
  )
}

export function BolsaMaternidadeIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Bolsa maternidade</title>
      <path d="M9 9V5a3 3 0 0 1 6 0v4" />
      <rect x="6" y="9" width="12" height="12" rx="2" />
      <path d="M6 14H4.5A1.5 1.5 0 0 0 3 15.5v3A1.5 1.5 0 0 0 4.5 20H6" />
      <path d="M18 14h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H18" />
      <path d="M8 14h8v6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-6Z" />
      <path d="M8 14l4 2.5 4-2.5" />
    </svg>
  )
}

export function SandaliaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Sandália</title>
      <path d="M12 3c3 0 5 1.5 5 4.5 0 3.5-1.5 6.5-2.5 9.5 1 2 1 3.5-.5 4.5-1.5 1-4 1.5-7 0-1.5-1-1.5-2.5-.5-4.5C5.5 14 4 11 4 7.5 4 4.5 9 3 12 3z" />
    </svg>
  )
}

export function MuleIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Mule</title>
      <path d="M 3 14.5 H 9 C 10 12 11.2 9 13.5 8 C 16.8 8 19.8 11 21.5 14.5" />
      <path d="M 3 14.5 V 20.5 H 6.5 L 6 18 C 9.5 18 13 19 16.5 19 C 18.8 19 20.3 17.5 21.5 14.5" />
    </svg>
  )
}

export function RelogioIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Relógio</title>
      <path d="M9 6.5L9.5 3.5A1.5 1.5 0 0 1 11 2h2a1.5 1.5 0 0 1 1.5 1.5L15 6.5" />
      <path d="M9 17.5l0.5 3A1.5 1.5 0 0 0 11 22h2a1.5 1.5 0 0 0 1.5-1.5l0.5-3" />
      <circle cx="12" cy="12" r="6" />
      <path d="M9.5 9.5L12 12l3.5-2" />
      <path d="M18 12h1.5" />
    </svg>
  )
}
