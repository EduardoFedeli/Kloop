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
      <path d="M8 9V6.5a4 4 0 0 1 8 0V9" />
      <rect x="4" y="9" width="16" height="11" rx="3" />
      <path d="M4 13.5h16" />
      <circle cx="12" cy="16.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SandaliaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Sandália</title>
      <ellipse cx="12" cy="13" rx="5.5" ry="8.7" />
      <path d="M12 5v3" />
      <path d="M12 8 7 12" />
      <path d="M12 8 17 12" />
    </svg>
  )
}

export function GestanteIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Maternidade</title>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M9.2 20.5v-3.8c-1.3-.6-2-1.9-2-3.7 0-3.3 2.1-5 4.8-5s4.8 1.7 4.8 5c0 1.9-.8 3.2-2.2 3.8" />
      <path d="M9.2 20.5h5.6" />
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

export function CamaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Cama</title>
      <path d="M3 5v14" />
      <path d="M3 15h18v4" />
      <path d="M3 11h14a4 4 0 0 1 4 4" />
      <path d="M6 11V9.5A1.5 1.5 0 0 1 7.5 8h3A1.5 1.5 0 0 1 12 9.5V11" />
    </svg>
  )
}

export function CarteiraIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Carteira</title>
      <path d="M7 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M22 10h-5a2 2 0 0 0-2 2a2 2 0 0 0 2 2h5" />
      <path d="M18 12h.01" />
    </svg>
  )
}

export function ChapeuIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Chapéu</title>
      <path d="M2 14.5c3 4 17 4 20 0" />
      <path d="M6.5 15.5l.8-5.5c.2-3.5 2.5-4 4.7-2 2.2-2 4.5-1.5 4.7 2l.8 5.5" />
      <path d="M6.9 12.8c3.1 1 7.1 1 10.2 0" />
    </svg>
  )
}

export function CortinaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Cortina</title>
      <path d="M12 7v8" />
      <path d="M9 11h6" />
      <path d="M2 3h20" />
      <path d="M4 3v17c2 1 4 1 6 0c-1.5-2.5-4-4.5-4-7c0-3.5 4.5-6 6-7Z" />
      <path d="M8 3c-1 4-3 6-3 10c0 3 1.5 5.5 2 7" />
      <path d="M3.5 13c1 1 2.5 1 3.5 0" />
      <path d="M20 3v17c-2 1-4 1-6 0c1.5-2.5 4-4.5 4-7c0-3.5-4.5-6-6-7Z" />
      <path d="M16 3c1 4 3 6 3 10c0 3-1.5 5.5-2 7" />
      <path d="M20.5 13c-1 1-2.5 1-3.5 0" />
    </svg>
  )
}

export function EscritorioIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Escritório</title>
      <rect x="6" y="3" width="12" height="7" rx="1" />
      <path d="M12 10v4" />
      <path d="M2 14h20" />
      <path d="M5 14v7" />
      <path d="M14 14v7h5v-7" />
      <path d="M14 17h5" />
    </svg>
  )
}

export function EspelhoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Espelho</title>
      <circle cx="12" cy="3" r="1" />
      <path d="M6.5 11.5L12 4l5.5 7.5" />
      <circle cx="12" cy="14" r="6.5" />
      <path d="M10.5 15.5l4-4" />
      <path d="M9 12l2.5-2.5" />
    </svg>
  )
}

export function JoiaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Joia</title>
      <path d="M8 3h8l3 4-7 5-7-5Z M5 7h14 M8 3l4 4 4-4 M12 7v5 M6.5 8.5a7.5 7.5 0 1 0 11 0" />
    </svg>
  )
}

export function LencolIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Lençol</title>
      <path d="M4 8l4-4h12l-4 4H4z" />
      <path d="M16 8a2 2 0 0 1 0 4H6a2 2 0 0 0 0 4h10a2 2 0 0 1 0 4H4" />
      <path d="M20 4v12" />
      <path d="M16 12l4-4" />
      <path d="M16 16l4-4" />
      <path d="M16 20l4-4" />
    </svg>
  )
}

export function MesaJantarIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Mesa de jantar</title>
      <path d="M3 7v13M3 14h3v6M7 11h10M10 11v9M14 11v9M21 7v13M21 14h-3v6" />
    </svg>
  )
}

export function QuadroIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Quadro</title>
      <path d="M12 2.5v2" />
      <path d="M7 8l5-3.5 5 3.5" />
      <rect x="3.5" y="8" width="17" height="13" rx="1.5" />
      <path d="M6.5 17l4-4.5 3 3 2.5-3 3.5 4.5" />
      <circle cx="8.5" cy="11.5" r="1.5" />
    </svg>
  )
}

export function SapatilhaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Sapatilha</title>
      <path d="M 3 10.5 C 6.5 9.2 11 9.8 14.5 11.2" />
      <path d="M 3 10.5 C 2.5 14 2.5 16.5 4.5 18 C 7 19.5 14 19.5 18 18 C 20.2 17.2 21.5 15.8 21.5 14.2 C 21.5 12.8 19 11.8 16 11.8 C 11.5 14.2 7 13.8 3 10.5 Z" />
      <path d="M 16 11.8 C 13.8 10.2 13.5 13 16 11.8 C 18.2 10.2 18.5 13 16 11.8 Z" />
      <path d="M 15.2 12.2 L 14 14.2 M 16.8 12.2 L 18 14.2" />
    </svg>
  )
}

export function TapeteIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Tapete</title>
      <rect x="5" y="5" width="14" height="14" rx="1" />
      <path d="M6 2v3M9 2v3M12 2v3M15 2v3M18 2v3" />
      <path d="M6 19v3M9 19v3M12 19v3M15 19v3M18 19v3" />
      <path d="M5 9h14M5 15h14" />
      <path d="M12 9l3 3-3 3-3-3z" />
    </svg>
  )
}

export function TravesseiroIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Travesseiro</title>
      <path d="M 4.5 7 Q 12 4.5 19.5 7 Q 22 12 19.5 17 Q 12 19.5 4.5 17 Q 2 12 4.5 7 Z" />
      <path d="M 4.5 7 Q 7.5 9 9.5 10.5" />
      <path d="M 19.5 7 Q 16.5 9 14.5 10.5" />
      <path d="M 4.5 17 Q 7.5 15 9.5 13.5" />
      <path d="M 19.5 17 Q 16.5 15 14.5 13.5" />
    </svg>
  )
}

export function VarandaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Varanda</title>
      <path d="M6 11h12M7.5 11l1 7h7l1-7M9 18v3M15 18v3" />
      <path d="M12 11V4M12 10.5c-3.5 0-6-1.5-6.5-5 2.5 0 5 1.5 6.5 5M12 8.5c3.5 0 6-1.5 6.5-5-2.5 0-5 1.5-6.5 5M12 6c-1.5-2-1.5-3.5 0-4.5 1.5 1 1.5 2.5 0 4.5" />
    </svg>
  )
}

export function ImpulsoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Impulso</title>
      <path d="M12 2c3 2 4.5 5.5 4.5 9.5c0 2.5-1 5-2.5 7l-2-1.5l-2 1.5c-1.5-2-2.5-4.5-2.5-7C7.5 7.5 9 4 12 2Z" />
      <circle cx="12" cy="10" r="1.8" />
      <path d="M7.5 13c-2 .5-3 2-3 4.5" />
      <path d="M16.5 13c2 .5 3 2 3 4.5" />
      <path d="M10 18.5l1 3l1-1.5l1 1.5l1-3" />
    </svg>
  )
}

export function ComboIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Combo</title>
      <path d="M15.5 4c-2-2.2-3.5-.2 0 0M15.5 4c2-2.2 3.5-.2 0 0" />
      <path d="M10 4h11v3H10z" />
      <path d="M11 7v4M20 7v9h-7M15.5 7v9" />
      <path d="M8 11c-2-2.2-3.5-.2 0 0M8 11c2-2.2 3.5-.2 0 0" />
      <path d="M2 11h12v3H2z" />
      <path d="M3 14v7h10v-7M8 11v10" />
    </svg>
  )
}

export function SapatoSocialIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Sapato social</title>
      <path d="M4 13.5c-1.3 0-1.8 1.8-1.8 4.3v1.7c0 .6.4 1 1 1h14.8c1.4 0 2.4-.9 2.4-2.2 0-1.4-1-3.2-6-3.2L9.5 12c-2 1.8-4 1.5-5.5 1.5z" />
      <path d="M2.2 17.5h16" />
      <path d="M9 12.8c1 .8 2.3 2 3.3 3" />
    </svg>
  )
}

export function ChineloIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Chinelo</title>
      <path d="M11 3c4 0 6.5 2.5 6.5 6 0 3-2 4.5-2 8 0 2.2-1.7 4-3.8 4-2.3 0-4.2-1.8-4.2-4 0-3 1.7-4.5 1-8.5C7.8 5.5 8.8 3 11 3Z" />
      <path d="M10.5 5v2.5c0 2.5-1.5 4-2 6" />
      <path d="M10.5 7.5c0 2.5 4 4 5 6.5" />
      <path d="M9.5 17.5c1.5.5 3.5.5 5 0" />
    </svg>
  )
}

export function PanelaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Panela</title>
      <path d="M10 5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4 9c0-2.2 3.6-4 8-4s8 1.8 8 4M3 9h18M4 9v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9M4 12H2.5A1.5 1.5 0 0 0 1 13.5A1.5 1.5 0 0 0 2.5 15H4M20 12h1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5H20" />
    </svg>
  )
}

export function FormaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Forma</title>
      <ellipse cx="12" cy="7" rx="9" ry="3" />
      <ellipse cx="12" cy="6.5" rx="2.5" ry="1" />
      <path d="M 9.5 6.5 v 4 c 0 1.2 5 1.2 5 0 v -4" />
      <path d="M 3 7 l 1.5 8 c 0 4.5 15 4.5 15 0 l 1.5 -8" />
      <path d="M 6.5 9.4 L 7.8 17.2 M 9.5 9.9 L 10.4 18.3 M 14.5 9.9 L 13.6 18.3 M 17.5 9.4 L 16.2 17.2" />
    </svg>
  )
}

export function CopoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Copo</title>
      <path d="M5 4h14l-1.8 14.4c-.1.9-.9 1.6-1.8 1.6H8.6c-.9 0-1.7-.7-1.8-1.6L5 4z" />
      <path d="M5.8 10h12.4" />
      <path d="M6.5 16h11" />
    </svg>
  )
}

export function LuminariaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Luminária</title>
      <path d="M9 4h6l3 6H6z" />
      <path d="M12 10v11" />
      <path d="M7 21h10" />
      <path d="M15 10v3" />
    </svg>
  )
}

export function AbajurIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Abajur</title>
      <path d="M8 3h8l4 7H4z" />
      <path d="M12 10v7" />
      <path d="M9 20a3 3 0 0 1 6 0" />
      <path d="M7 20h10" />
      <path d="M16 10v4" />
    </svg>
  )
}

export function EducativoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Educativo</title>
      <path d="M 6.5 3 L 10 9.5 H 3 Z" />
      <circle cx="17.5" cy="6.25" r="3.25" />
      <rect x="3" y="13.5" width="7" height="7.5" rx="1" />
      <path d="M 14 21 V 13.5 H 21 V 21 H 19.5 A 2 2 0 0 0 15.5 21 H 14 Z" />
    </svg>
  )
}

export function AventuraIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Aventura</title>
      <circle cx="12" cy="12" r="10" />
      <path d="M 12 2 C 6.5 6.5 6.5 17.5 12 22" />
      <path d="M 12 2 C 17.5 6.5 17.5 17.5 12 22" />
      <path d="M 2.5 9 C 7.5 12.5 16.5 12.5 21.5 9" />
      <path d="M 2.5 15 C 7.5 18.5 16.5 18.5 21.5 15" />
    </svg>
  )
}

export function PocheteIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Pochete</title>
      <path d="M2 9l3.5 1" />
      <path d="M22 9l-3.5 1" />
      <path d="M4 10c0-1 2-2 8-2s8 1 8 2c0 5.5-3.5 8.5-8 8.5S4 15.5 4 10z" />
      <path d="M5 11.5c3 1.5 11 1.5 14 0" />
      <path d="M9 12.5v2" />
    </svg>
  )
}

export function BotaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Bota</title>
      <path d="M 8.5 5 H 12.5 C 13.5 8 15 11 18 13 C 20 14.3 21.5 15.5 21.5 17 C 21.5 18.5 20 19 18.5 19 H 16 C 15 17.5 12 17.5 11 19 H 6 C 5.5 19 5.5 18 5.5 17 C 5.5 13 6.5 8 8.5 5 Z" />
      <path d="M 5.5 16.5 H 10.5" />
      <path d="M 10.5 5 L 9 9.5 C 9.8 10.3 11 10.3 11.8 9.5" />
    </svg>
  )
}

export function CachecolIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Cachecol</title>
      <path d="M 5 8 C 5 4.5, 19 4.5, 19 8 C 19 11.5, 5 11.5, 5 8 Z" />
      <path d="M 7 11 V 19 H 11 V 11" />
      <path d="M 13 11 V 15 H 17 V 10.5" />
      <path d="M 7 15.5 H 11 M 13 13 H 17" />
      <path d="M 8 19 V 21.5 M 10 19 V 21.5 M 14 15 V 17.5 M 16 15 V 17.5" />
    </svg>
  )
}

export function VelaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Vela</title>
      <path d="M12 2c-2 3-3 4.8-3 6.5a3 3 0 0 0 6 0C15 6.8 14 5 12 2z" />
      <path d="M12 8.5v3" />
      <path d="M8 11c2 1.5 6 1.5 8 0v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" />
    </svg>
  )
}

export function FlorIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Flor</title>
      <path d="M9 13h6c1.5 0 2.5 1.5 2.5 3.5 0 2.5-1 4.5-2.5 4.5h-6c-1.5 0-2.5-2-2.5-4.5 0-2 1-3.5 2.5-3.5Z M12 13V7.5 M12 7.5c-3 0-4-2.5-4-4 1.5 0 3 1 4 2.5 1-1.5 2.5-2.5 4-2.5 0 1.5-1 4-4 4Z M12 6V2.5 M12 11.5c-2 0-3.5-1-4-2 1.5 0 3 .5 4 2 M12 9.5c2 0 3.5-1 4-2-1.5 0-3 .5-4 2" />
    </svg>
  )
}

export function CobertorIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Cobertor</title>
      <path d="M 7 5 H 17 A 3 3 0 0 1 20 8 A 3 3 0 0 1 17 11 H 7 A 3 3 0 0 0 4 14 A 3 3 0 0 0 7 17 H 17 A 3 3 0 0 0 20 14 A 3 3 0 0 0 17 11" />
      <path d="M 7 5 V 11" />
      <path d="M 10 8 H 14" strokeDasharray="1 1" />
      <path d="M 10 14 H 14" strokeDasharray="1 1" />
    </svg>
  )
}

export function ToalhaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Toalha</title>
      <path d="M4 3.5V6M20 3.5V6M2.5 6H6M18 6h3.5M6 6v10a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V6c0-1.66-1.34-3-3-3h-6c-1.66 0-3 1.34-3 3zM8 17.5v2a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5v-2M6 13h12" />
    </svg>
  )
}

export function XicaraIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Xícara</title>
      <path d="M8 6c-1-1.5 1-2.5 0-4" />
      <path d="M12 6c-1-1.5 1-2.5 0-4" />
      <path d="M5 9h10v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
      <path d="M15 11h1a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1" />
      <path d="M4 20h12" />
    </svg>
  )
}

export function TalherIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Talher</title>
      <path d="M4 3v4.5c0 4 6 4 6 0V3M7 3v4.5M7 10.5V21M17 3c-2.5 0-3 2-3 4.5 0 2.2 1.5 3 3 3s3-.8 3-3c0-2.5-.5-4.5-3-4.5zM17 10.5V21" />
    </svg>
  )
}

export function LustreIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Lustre</title>
      <path d="M9 2h6" />
      <path d="M12 2v17" />
      <path d="M12 19c-.7.8-.7 1.7 0 2.5c.7-.8.7-1.7 0-2.5" />
      <path d="M5 15c0 4 4 4 7 1" />
      <path d="M19 15c0 4-4 4-7 1" />
      <path d="M3 15h4M10 13h4M17 15h4" />
      <path d="M5 11.5v3.5M12 9.5v3.5M19 11.5v3.5" />
      <path d="M5 8c-.7 1-.7 2.5 0 3.5c.7-1 .7-2.5 0-3.5" />
      <path d="M12 6c-.7 1-.7 2.5 0 3.5c.7-1 .7-2.5 0-3.5" />
      <path d="M19 8c-.7 1-.7 2.5 0 3.5c.7-1 .7-2.5 0-3.5" />
    </svg>
  )
}

export function PeluciaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Pelúcia</title>
      <path d="M 5 11.5 A 4 4 0 1 1 10.5 6.5 M 13.5 6.5 A 4 4 0 1 1 19 11.5 M 6.8 9.5 A 2 2 0 0 1 9 7.3 M 15 7.3 A 2 2 0 0 1 17.2 9.5 M 12 6.5 v 2" />
      <circle cx="12" cy="13.5" r="7" />
      <path d="M 8.5 11.5 v 0.01 M 15.5 11.5 v 0.01" />
      <ellipse cx="12" cy="15.3" rx="3.2" ry="2.2" />
      <path d="M 11 14.3 h 2 l -1 1 z M 12 15.3 v 0.7 M 10 16.3 a 1.2 1.2 0 0 0 2 -0.2 a 1.2 1.2 0 0 0 2 0.2" />
    </svg>
  )
}

export function CasinhaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Casinha</title>
      <path d="M16 5.5V3h2.5v4.5" />
      <path d="M3 11L12 2l9 9" />
      <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M10 20v-4a2 2 0 0 1 4 0v4" />
      <circle cx="12" cy="7.5" r="1.5" />
    </svg>
  )
}

export function CadeirinhaIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Cadeirinha</title>
      <rect x="7.5" y="3" width="9" height="5" rx="2" />
      <path d="M 7 7.5 C 4.5 7.5 3.5 9.5 3.5 12 V 16 C 3.5 18.2 5.3 20 7.5 20 H 16.5 C 18.7 20 20.5 18.2 20.5 16 V 12 C 20.5 9.5 19.5 7.5 17 7.5" />
      <path d="M 9.5 8 V 11.5 C 9.5 13 10.5 14 12 14 C 13.5 14 14.5 13 14.5 11.5 V 8" />
      <path d="M 9.5 11 H 14.5" />
      <path d="M 12 14 V 17" />
    </svg>
  )
}

export function ArtisticoIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Artístico</title>
      <path d="M9 15c-4-1-6.5-4.5-6-8.5C4.8 3 8.5 2 12 3.5c4 1.7 6 5.5 4.5 9C15.3 15.3 13 16 11 15.5" />
      <circle cx="7.5" cy="8" r="1" />
      <circle cx="11" cy="6.5" r="1" />
      <circle cx="14.5" cy="8" r="1" />
      <path d="M9 15l-6 6" />
      <path d="M3 21l1.5-4.5L9 15z" />
    </svg>
  )
}

export function FitaLedIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <title>Fita LED</title>
      <path d="M2 8c3-4 7-4 10 0s7 4 10 0" />
      <path d="M2 16c3-4 7-4 10 0s7 4 10 0" />
      <path d="M6 8v0M12 8v0M18 8v0" strokeWidth="3" />
      <path d="M4 16v0M10 16v0M16 16v0" strokeWidth="3" />
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
