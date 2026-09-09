'use client'

import { useMemo, useState } from 'react'

const meses = ['Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26']

const linhas = [
  'RECEITAS',
  'Salários',
  'Léo',
  'Nat',
  'Férias',
  'Léo',
  'Nat',
  '13º Salário',
  'Léo',
  'Nat',
  'Bônus',
  'Léo',
  'Nat',
  'IR / Dissídio',
  'Léo',
  'Nat',
  'Renda Familiar',
  'DESPESAS',
  'Despesas Fixas',
  'Bancos e Acordos',
  'Despesas Totais',
  'Despesas Diversas',
  'RESULTADO',
  'Fluxo de Caixa do Período',
]

export default function HomologacaoPage() {
  const [mesSelecionado, setMesSelecionado] = useState('Set/26')

  const colunas = useMemo(() => meses.map((mes) => ({ mes })), [])

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Orçamento Familiar</p>
            <h1 className="text-2xl font-bold">Homologação 2026</h1>
            <p className="mt-1 text-sm text-slate-500">
              Meses na horizontal e receitas, despesas e resultado na vertical.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Mês</label>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {meses.map((mes) => <option key={mes}>{mes}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1250px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="sticky left-0 z-20 min-w-[220px] border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left font-semibold">
                  Categoria / Conta
                </th>
                {colunas.map(({ mes }) => (
                  <th key={mes} className={`min-w-[100px] border-b border-slate-200 px-3 py-3 text-right font-semibold ${mes === mesSelecionado ? 'bg-slate-200' : ''}`}>
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => {
                const destaque = ['RECEITAS','DESPESAS','RESULTADO'].includes(linha)
                const total = ['Renda Familiar','Despesas Totais','Fluxo de Caixa do Período'].includes(linha)
                return (
                  <tr key={linha} className={destaque ? 'bg-slate-50' : ''}>
                    <td className={`sticky left-0 z-10 border-r border-t border-slate-200 px-4 py-2 ${destaque ? 'bg-slate-50 font-bold' : total ? 'bg-white font-semibold' : 'bg-white text-slate-600'}`}>
                      {linha}
                    </td>
                    {meses.map((mes) => (
                      <td key={`${linha}-${mes}`} className={`border-t border-slate-200 px-3 py-2 text-right tabular-nums ${mes === mesSelecionado ? 'bg-slate-50' : ''} ${destaque ? 'font-bold' : total ? 'font-semibold' : ''}`}>
                        —
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Base de homologação</strong>
          <span>Os valores reais serão carregados nos dados do aplicativo, não no código público. A matriz acima reproduz a estrutura da planilha para conferência mês a mês.</span>
        </div>
      </div>
    </main>
  )
}
