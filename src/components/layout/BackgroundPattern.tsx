import { Shirt, Recycle, Leaf, ShoppingBag, Tag, Sparkles } from "lucide-react"

const ICONS = [
  { Icon: Shirt, top: "6%", left: "8%", size: 46, rotate: -18 },
  { Icon: Leaf, top: "16%", left: "78%", size: 34, rotate: 12 },
  { Icon: Recycle, top: "30%", left: "20%", size: 38, rotate: 8 },
  { Icon: Tag, top: "42%", left: "82%", size: 30, rotate: -10 },
  { Icon: ShoppingBag, top: "56%", left: "10%", size: 42, rotate: 20 },
  { Icon: Sparkles, top: "68%", left: "70%", size: 28, rotate: -6 },
  { Icon: Leaf, top: "80%", left: "30%", size: 36, rotate: -22 },
  { Icon: Shirt, top: "92%", left: "72%", size: 40, rotate: 14 },
]

export function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="md:hidden fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {ICONS.map(({ Icon, top, left, size, rotate }, i) => (
        <Icon
          key={i}
          size={size}
          strokeWidth={1.5}
          className="absolute text-sage opacity-[0.08]"
          style={{ top, left, transform: `rotate(${rotate}deg)` }}
        />
      ))}
    </div>
  )
}
