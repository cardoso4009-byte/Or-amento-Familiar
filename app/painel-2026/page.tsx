'use client'

import { useEffect, useMemo, useState } from 'react'

const meses = ['Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26']

type Dados = Record<string, number[]>

const linhas = [
  'Salários','Salários - Léo','Salários - Nat','Férias','Férias - Léo','Férias - Nat',
  '13º Salário','13º - Léo','13º - Nat','Bônus','Bônus - Léo','Bônus - Nat',
  'IR / Dissídio','IR / Dissídio - Léo','IR / Dissídio - Nat','Renda Familiar',
  'Despesas Fixas','Bancos e Acordos','Despesas Totais','Despesas Diversas','Fluxo de Caixa do Período',
]

function vazio(): Dados {
  return Object.fromEntries(linhas.map((x) => [x, Array(12).fill(0)]))
}

function moeda(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function percentual(value: number) {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

export default function Painel2026Page() {
  const [mesSelecionado, setMesSelecionado] = useState('Set/26')
  const [dados, setDados] = useState<Dados>(vazio)
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('orcamento-familiar-homologacao-2026')
      if (salvo) setDados({ ...vazio(), ...JSON.parse(salvo) })
    } catch {
      setDados(vazio())
    } finally {
      setCarregado(true)
    }
  }, [])

  const indice = meses.indexOf(mesSelecionado)
  const rendaLeo = dados['Salários - Léo']?.[indice] ?? 0
  const rendaNat = dados['Salários - Nat']?.[indice] ?? 0
  const rendaFamiliar = dados['Renda Familiar']?.[indice] ?? 0
  const despesas = dados['Despesas Totais']?.[indice] ?? 0
  const diversas = dados['Despesas Diversas']?.[indice] ?? 0
  const resultado = dados['Fluxo de Caixa do Período']?.[indice] ?? rendaFamiliar - despesas
  const comprometimento = rendaFamiliar ? (despesas / rendaFamiliar) * 100 : 0

  const anual = useMemo(() => {
    const renda = (dados['Renda Familiar'] ?? []).reduce((a, b) => a + b, 0)
    const desp = (dados['Despesas Totais'] ?? []).reduce((a, b) => a + b, 0)
    const fluxo = (dados['Fluxo de Caixa do Período'] ?? []).reduce((a, b) => a + b, 0)
    return { renda, desp, fluxo, comprometimento: renda ? (desp / renda) * 100 : 0 }
  }, [dados])

  const cards = [
    { label: 'Renda Léo', value: rendaLeo, detail: 'Salário do mês' },
    { label: 'Renda Nat', value: rendaNat, detail: 'Salário do mês' },
    { label: 'Renda Familiar', value: rendaFamiliar, detail: 'Total oficial da planilha' },
    { label: 'Despesas Familiares', value: despesas, detail: 'Despesas Totais' },
    { label: 'Resultado Familiar', value: resultado, detail: 'Fluxo de Caixa do Período' },
    { label: 'Comprometimento', value: comprometimento, detail: 'Despesas ÷ Renda' },
  ]

  if (!carregado) return <main className="min-h-screen bg-slate-50 p-8 text-slate-600">Carregando painel...</main>

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Orçamento Familiar</p>
            <h1 className="text-3xl font-bold tracking-tight">Painel Financeiro 2026</h1>
            <p className="mt-1 text-sm text-slate-500">Visão consolidada da família, baseada na base de homologação.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Mês</label>
            <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
              {meses.map((mes) => <option key={mes}>{mes}</option>)}
            </select>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const isPercent = card.label === 'Comprometimento'
            return (
              <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className={`mt-2 text-2xl font-bold ${!isPercent && card.value < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {isPercent ? percentual(card.value) : moeda(card.value)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
              </article>
            )
          })}
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Composição da renda</h2>
                <p className="text-sm text-slate-500">Somente a renda é separada por pessoa.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{mesSelecionado}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Léo</p><p className="mt-1 font-semibold">{moeda(rendaLeo)}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Nat</p><p className="mt-1 font-semibold">{moeda(rendaNat)}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Família</p><p className="mt-1 font-semibold">{moeda(rendaFamiliar)}</p></div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Despesas</h2>
            <p className="mt-1 text-sm text-slate-500">Controle familiar, sem divisão por pessoa.</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-600">Despesas Totais</span><strong>{moeda(despesas)}</strong></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600">Despesas Diversas</span><strong>{moeda(diversas)}</strong></div>
              <div className="border-t pt-3 flex justify-between"><span className="text-sm font-medium">Comprometimento</span><strong>{percentual(comprometimento)}</strong></div>
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Evolução mensal</h2>
            <p className="text-sm text-slate-500">Renda familiar, despesas totais e resultado homologado.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead><tr className="bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold">Indicador</th>
                {meses.map((mes) => <th key={mes} className={`px-3 py-3 text-right font-semibold ${mes === mesSelecionado ? 'bg-slate-100' : ''}`}>{mes}</th>)}
              </tr></thead>
              <tbody>
                {['Renda Familiar','Despesas Totais','Fluxo de Caixa do Período'].map((linha) => (
                  <tr key={linha} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium">{linha}</td>
                    {meses.map((mes, i) => <td key={`${linha}-${mes}`} className={`px-3 py-3 text-right tabular-nums ${mes === mesSelecionado ? 'bg-slate-50' : ''}`}>{moeda(dados[linha]?.[i] ?? 0)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Renda acumulada 2026</p><p className="mt-1 text-xl font-bold">{moeda(anual.renda)}</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Despesas acumuladas 2026</p><p className="mt-1 text-xl font-bold">{moeda(anual.desp)}</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Resultado acumulado 2026</p><p className={`mt-1 text-xl font-bold ${anual.fluxo < 0 ? 'text-red-600' : ''}`}>{moeda(anual.fluxo)}</p><p className="mt-1 text-xs text-slate-400">Comprometimento anual: {percentual(anual.comprometimento)}</p></article>
        </section>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Homologação:</strong> este painel lê os dados armazenados localmente pela tela de Homologação 2026. Os valores reais não são gravados no código público do GitHub.
        </div>
      </div>
    </main>
  )
}
