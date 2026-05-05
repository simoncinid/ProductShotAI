'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { brandIdentityApi, productsApi, userApi } from '@/lib/api'

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userApi.getMe,
    retry: false,
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.list,
  })

  const { data: brandIdentity, error: brandError, isLoading: brandLoading } = useQuery({
    queryKey: ['brand-identity'],
    queryFn: brandIdentityApi.get,
    retry: false,
  })

  if (userLoading || productsLoading || brandLoading) {
    return <p className="text-muted">Loading...</p>
  }

  const hasBrandIdentity = !!brandIdentity && !brandError
  const hasProducts = products.length > 0
  const hasCredits = (user?.credits_balance ?? 0) > 0

  const blockers = [
    {
      title: 'Brand identity',
      done: hasBrandIdentity,
      description: 'Serve per mantenere stile coerente automaticamente.',
      href: '/dashboard/brand-identity',
      cta: hasBrandIdentity ? 'Aggiorna brand' : 'Configura brand',
    },
    {
      title: 'Catalogo prodotti',
      done: hasProducts,
      description: 'Almeno un prodotto con immagini reference velocizza tutto il flusso.',
      href: '/dashboard/products',
      cta: hasProducts ? 'Gestisci catalogo' : 'Crea prodotto',
    },
    {
      title: 'Crediti',
      done: hasCredits,
      description: 'Ti servono crediti per generare immagini 4K o 8K.',
      href: '/pricing',
      cta: hasCredits ? 'Vedi piani' : 'Acquista crediti',
    },
  ]

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Flusso consigliato</p>
        <h2 className="mt-2 text-2xl font-bold">Come generare in modo rapido e pulito</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/15 bg-black/20 p-4">
            <p className="text-xs text-cyan-100">Step 1</p>
            <p className="mt-1 font-semibold">Setup base</p>
            <p className="mt-1 text-sm text-white/70">Brand e catalogo prodotto.</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/20 p-4">
            <p className="text-xs text-cyan-100">Step 2</p>
            <p className="mt-1 font-semibold">Scegli obiettivo</p>
            <p className="mt-1 text-sm text-white/70">Foto singola o shooting.</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/20 p-4">
            <p className="text-xs text-cyan-100">Step 3</p>
            <p className="mt-1 font-semibold">Genera</p>
            <p className="mt-1 text-sm text-white/70">Prompt guidato e output immediato.</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/20 p-4">
            <p className="text-xs text-cyan-100">Step 4</p>
            <p className="mt-1 font-semibold">Itera in Hub</p>
            <p className="mt-1 text-sm text-white/70">Varianti e modifiche veloci.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-white p-6 text-primary shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4a6283]">Percorso veloce</p>
          <h3 className="mt-2 text-2xl font-bold">Genera una foto adesso</h3>
          <p className="mt-2 text-sm text-[#3e516c]">
            Carica una reference o scegli dal catalogo, imposta obiettivo e genera in 1 click.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#3e516c]">
            <li>Reference + obiettivo creativo guidato</li>
            <li>Impostazioni avanzate opzionali</li>
            <li>Riapertura immediata nel Creative Hub</li>
          </ul>
          <Link
            href="/dashboard/create"
            className="mt-5 inline-flex rounded-full bg-[#13223a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1b2f]"
          >
            Vai a Genera foto
          </Link>
        </article>

        <article className="rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-[#10213a] to-[#1f3b63] p-6 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Percorso batch</p>
          <h3 className="mt-2 text-2xl font-bold">Crea uno shooting completo</h3>
          <p className="mt-2 text-sm text-white/85">
            Definisci il set e lascia che l’AI generi un pacchetto coerente di immagini.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>Scelta prodotto e reference in pochi click</li>
            <li>Stile, quantità e costo sempre visibili</li>
            <li>Monitoraggio live avanzamento shooting</li>
          </ul>
          <Link
            href="/dashboard/shooting"
            className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#122035] hover:bg-white/90"
          >
            Vai a Crea shooting
          </Link>
        </article>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Checklist operativa</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {blockers.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/15 bg-black/20 p-4 text-white">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className={`mt-1 text-xs ${item.done ? 'text-emerald-300' : 'text-amber-300'}`}>
                {item.done ? 'Completato' : 'Da completare'}
              </p>
              <p className="mt-2 text-xs text-white/70">{item.description}</p>
              <Link href={item.href} className="mt-3 inline-flex text-sm font-semibold text-cyan-100 hover:underline">
                {item.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/products" className="rounded-xl border border-white/15 bg-white/5 p-5 text-white transition hover:bg-white/10">
          <h4 className="font-semibold">Catalogo prodotti</h4>
          <p className="mt-1 text-sm text-white/70">Prepara una volta i prodotti e riusa prompt/reference in ogni generazione.</p>
        </Link>
        <Link href="/dashboard/generations" className="rounded-xl border border-white/15 bg-white/5 p-5 text-white transition hover:bg-white/10">
          <h4 className="font-semibold">Libreria risultati</h4>
          <p className="mt-1 text-sm text-white/70">Filtra output per prodotto, scarica e riapri nel Creative Hub.</p>
        </Link>
      </section>
    </div>
  )
}
