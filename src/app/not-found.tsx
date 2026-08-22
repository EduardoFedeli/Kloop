import Link from "next/link"
import Image from "next/image"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 text-center">
      <Image src="/logo-extensa.png" alt="Kloop" width={790} height={316} className="h-8 w-auto mb-8 opacity-80" />

      <p className="text-[64px] font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)] leading-none tracking-tight">
        404
      </p>
      <h1 className="text-[20px] font-black text-[var(--foreground)] mt-3">
        essa página saiu de circulação
      </h1>
      <p className="text-[14px] text-gray-400 dark:text-sage mt-2 max-w-xs">
        o link pode estar errado ou o anúncio já não existe mais por aqui.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[var(--color-teal)] text-white font-black px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all text-[13px]"
        >
          <Home size={15} />
          voltar pro início
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 border border-gray-200 dark:border-white/10 text-[var(--foreground)] font-bold px-6 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all text-[13px]"
        >
          <Search size={15} />
          buscar produtos
        </Link>
      </div>
    </div>
  )
}
