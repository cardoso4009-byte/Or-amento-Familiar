'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, FileSpreadsheet, PiggyBank, Wallet } from 'lucide-react'
import { ESTRUTURA_ORCAMENTO, MESES_2026, REGRAS_APLICACAO } from '@/lib/modelo-orcamento'

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const modulos = [
  { id: 'visao', titulo: 'Visão geral', descricao: 'Resumo mensal e anual da família', icon: BarChart3 },
  { id: 'receitas', titulo: 'Receitas', descricao: 'Renda de Léo, Nat e receitas extraordinárias', icon: ArrowDownLeft },
  { id: 'despesas', titulo: 'Despesas', descricao: 'Despesas familiares e compromissos', icon: ArrowUpRight },
  { id: 'contas', titulo: 'Contas', descricao: 'Saldos, movimentações e transferências', icon: Wallet },
  { id: 'investimentos', titulo: 'Investimentos', descricao: 'Acompanhamento patrimonial separado do consumo', icon: PiggyBank },
  { id: 'homologacao', titulo: 'Homologação', descricao: 'Conferência da aplicação contra a planilha real', icon: FileSpreadsheet },
]

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [modulo, setModulo] = useState('visao')
  const indice = MESES_2026.indexOf(mes)
  const grupos = useMemo(() => {
    const map = new Map<string, typeof ESTRUTURA_ORCAMENTO>()
    ESTRUTURA_ORCAMENTO.forEach((linha) => {
      if (!map.has(linha.grupo)) map.set(linha.grupo, [])
      map.get(linha.grupo)!.push(linha)
    })
    return [...map.entries()]
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Orçamento Familiar</p>
            <h1 className="text-3xl font-bold tracking-tight">Estrutura de Controle</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">A aplicação será construída para acompanhar o mesmo raciocínio da planilha. Primeiro estruturamos o controle; depois homologamos os números.</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-slate-500" />
            <select value={mes} onChange={(e) => setMes(e.target.value as typeof mes)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
              {MESES_2026.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => {
            const Icon = m.icon
            const ativo = modulo === m.id
            return <button key={m.id} onClick={() => setModulo(m.id)} className={`rounded-xl border p-4 text-left transition ${ativo ? 'border-slate-400 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><Icon size={18} /></div>
              <strong className="block text-sm">{m.titulo}</strong>
              <span className="mt-1 block text-xs text-slate-500">{m.descricao}</span>
            </button>
          })}
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-sm text-slate-500">Receitas</span><strong className="mt-2 block text-2xl">—</strong><small className="text-xs text-slate-400">Aguardando homologação dos valores</small></article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-sm text-slate-500">Despesas familiares</span><strong className="mt-2 block text-2xl">—</strong><small className="text-xs text-slate-400">Aguardando homologação dos valores</small></article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-sm text-slate-500">Resultado</span><strong className="mt-2 block text-2xl"><CircleDollarSign className="inline mr-2" size={20} />—</strong><small className="text-xs text-slate-400">Será calculado com a base homologada</small></article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold">Estrutura da base de controle</h2>
              <p className="mt-1 text-sm text-slate-500">{modulos.find((m) => m.id === modulo)?.titulo} · {mes}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {grupos.map(([grupo, linhas]) => <div key={grupo} className="p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{grupo}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {linhas.map((linha) => <div key={linha.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div><span className="text-sm font-medium">{linha.nome}</span>{linha.responsavel && <span className="ml-2 text-xs text-slate-400">{linha.responsavel}</span>}</div>
                    <span className="text-sm tabular-nums text-slate-400">—</span>
                  </div>)}
                </div>
              </div>)}
            </div>
          </article>

          <aside className="space-y-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Regras do aplicativo</h2>
              <ul className="mt-4 space-y-3">
                {REGRAS_APLICACAO.map((regra) => <li key={regra} className="flex gap-2 text-sm text-slate-600"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />{regra}</li>)}
              </ul>
            </article>
            <article className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <strong>Fase atual</strong>
              <p className="mt-1">Estruturação funcional. Os valores reais ficam fora do código público. A homologação numérica será a próxima fase, após validarmos o comportamento da aplicação.</p>
            </article>
          </aside>
        </section>
      </div>
    </main>
  )
}
