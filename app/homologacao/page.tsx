'use client'

import { useMemo, useRef, useState } from 'react'

const meses = ['Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26']

const linhas = [
  'RECEITAS','Salários e recebíveis','Salários','Salários - Léo','Salários - Nat','Férias','Férias - Léo','Férias - Nat','13º Salário','13º - Léo','13º - Nat','Bônus','Bônus - Léo','Bônus - Nat','IR / Dissídio','IR / Dissídio - Léo','IR / Dissídio - Nat','Renda Familiar',
  'DESPESAS','Despesas Totais','Despesas Fixas','Claro Residencial 08','Claro Família - 10','CEG - 15','Light - 17','Cartão de Crédito Nat - 10','Cartão de Crédito Léo - 10','Financiamento Apto - 10','Seguro Apto - 21','Seguro de Vida','Localiza - 21','Nadi - 05','Condomínio - 10','Psicóloga','Escola - 10','Bancos e Acordos','Financiamento Mobi - 15','IPTU 01/019189/2023-24 - 10','IPTU','Acordo Santander - Léo 27','Acordo Santander - Nat 23','Despesas Diversas','RESULTADO','Fluxo de caixa','Fluxo de Caixa do Período',
]

type Dados = Record<string, number[]>
const vazias = linhas.filter((x) => !['RECEITAS','DESPESAS','RESULTADO'].includes(x))
const vazio: Dados = Object.fromEntries(vazias.map((x) => [x, Array(12).fill(0)]))

function parseCsv(text: string): Dados {
  const result: Dados = JSON.parse(JSON.stringify(vazio))
  const rows = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).map((line) => line.split(',').map((v) => v.trim().replace(/^"|"$/g, '')))
  if (rows.length < 2) throw new Error('CSV vazio.')
  const header = rows[0].slice(1)
  const indexes = meses.map((m) => header.findIndex((h) => h === m))
  rows.slice(1).forEach((row) => {
    const label = row[0]
    if (!label || !(label in result)) return
    result[label] = indexes.map((idx) => {
      if (idx < 0) return 0
      const raw = (row[idx + 1] ?? '').replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.')
      const value = Number(raw)
      return Number.isFinite(value) ? value : 0
    })
  })
  return result
}

function moeda(value: number) {
  return value === 0 ? '—' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function HomologacaoPage() {
  const [mesSelecionado, setMesSelecionado] = useState('Set/26')
  const [dados, setDados] = useState<Dados>(() => {
    if (typeof window === 'undefined') return vazio
    try { return JSON.parse(localStorage.getItem('orcamento-familiar-homologacao-2026') || 'null') || vazio } catch { return vazio }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const colunas = useMemo(() => meses.map((mes) => ({ mes })), [])

  async function importar(file?: File) {
    if (!file) return
    try {
      const parsed = parseCsv(await file.text())
      setDados(parsed)
      localStorage.setItem('orcamento-familiar-homologacao-2026', JSON.stringify(parsed))
    } catch {
      alert('Não foi possível ler o CSV. Use o modelo com as colunas Jan/26 até Dez/26.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Orçamento Familiar</p>
            <h1 className="text-2xl font-bold">Homologação 2026</h1>
            <p className="mt-1 text-sm text-slate-500">Estrutura oficial: meses na horizontal e receitas, despesas e resultado na vertical.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => inputRef.current?.click()} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Importar CSV</button>
            <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => importar(e.target.files?.[0])} />
            <label className="text-sm font-medium text-slate-600">Mês</label>
            <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {meses.map((mes) => <option key={mes}>{mes}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1500px] w-full border-collapse text-sm">
            <thead><tr className="bg-slate-100">
              <th className="sticky left-0 z-20 min-w-[270px] border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left font-semibold">Orçamento Familiar</th>
              {colunas.map(({ mes }) => <th key={mes} className={`min-w-[105px] border-b border-slate-200 px-3 py-3 text-right font-semibold ${mes === mesSelecionado ? 'bg-slate-200' : ''}`}>{mes}</th>)}
            </tr></thead>
            <tbody>
              {linhas.map((linha) => {
                const destaque = ['RECEITAS','DESPESAS','RESULTADO'].includes(linha)
                const total = ['Salários e recebíveis','Renda Familiar','Despesas Totais','Despesas Fixas','Bancos e Acordos','Despesas Diversas','Fluxo de caixa','Fluxo de Caixa do Período'].includes(linha)
                const valores = dados[linha]
                return <tr key={linha} className={destaque ? 'bg-slate-100' : ''}>
                  <td className={`sticky left-0 z-10 border-r border-t border-slate-200 px-4 py-2 ${destaque ? 'bg-slate-100 font-bold text-slate-800' : total ? 'bg-white font-semibold text-slate-800' : 'bg-white text-slate-600'}`}>{linha}</td>
                  {meses.map((mes, i) => <td key={`${linha}-${mes}`} className={`border-t border-slate-200 px-3 py-2 text-right tabular-nums ${mes === mesSelecionado ? 'bg-slate-50' : ''} ${destaque ? 'font-bold' : total ? 'font-semibold' : ''}`}>{valores ? moeda(valores[i]) : ''}</td>)}
                </tr>
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Dados reais protegidos</strong>
          <p className="mt-1">O CSV é lido no navegador e salvo somente no armazenamento local deste dispositivo. Os valores reais não são gravados no código público do GitHub.</p>
        </div>
      </div>
    </main>
  )
}
