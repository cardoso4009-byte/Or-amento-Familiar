'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, BarChart3, CalendarDays, FileSpreadsheet, PiggyBank, Upload, Wallet } from 'lucide-react'
import { MESES_2026 } from '../../lib/modelo-orcamento'

const meses = [...MESES_2026]
const STORAGE_KEY = 'orcamento-familiar-homologacao-2026'
const moeda = (v: number) => v === 0 ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nav = [
  { href: '/controle', label: 'Controle', icon: BarChart3 },
  { href: '/lancamentos', label: 'Lançamentos', icon: ArrowDownLeft },
  { href: '/contas', label: 'Contas', icon: Wallet },
  { href: '/investimentos', label: 'Investimentos', icon: PiggyBank },
  { href: '/homologacao', label: 'Homologação', icon: FileSpreadsheet },
]
const grupos = [
  { titulo: 'RECEITAS', linhas: ['Salários e recebíveis','Salários','Salários - Léo','Salários - Nat','Férias','Férias - Léo','Férias - Nat','13º Salário','13º - Léo','13º - Nat','Bônus','Bônus - Léo','Bônus - Nat','IR / Dissídio','IR / Dissídio - Léo','IR / Dissídio - Nat','Renda Familiar'] },
  { titulo: 'DESPESAS', linhas: ['Despesas Totais','Despesas Fixas','Claro Residencial 08','Claro Família - 10','CEG - 15','Light - 17','Cartão de Crédito Nat - 10','Cartão de Crédito Léo - 10','Financiamento Apto - 10','Seguro Apto - 21','Seguro de Vida','Localiza - 21','Nadi - 05','Condomínio - 10','Psicóloga','Escola - 10','Bancos e Acordos','Financiamento Mobi - 15','IPTU 01/019189/2023-24 - 10','IPTU','Acordo Santander - Léo 27','Acordo Santander - Nat 23','Despesas Diversas'] },
  { titulo: 'RESULTADO', linhas: ['Fluxo de caixa','Fluxo de Caixa do Período'] },
]
type Dados = Record<string, number[]>

function parseCsv(text: string): Dados {
  const result: Dados = {}
  const rows = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/)
  const split = (line: string) => line.includes(';') ? line.split(';') : line.split(',')
  const header = split(rows[0] || '').map(v => v.trim().replace(/^"|"$/g, ''))
  const indices = meses.map(m => header.findIndex(h => h === m))
  rows.slice(1).forEach(line => {
    const row = split(line).map(v => v.trim().replace(/^"|"$/g, ''))
    const label = row[0]
    if (!label) return
    result[label] = indices.map(idx => {
      if (idx < 0) return 0
      let raw = (row[idx + 1] ?? '').replace(/R\$\s?/g, '').trim()
      if (raw.includes(',')) raw = raw.replace(/\./g, '').replace(',', '.')
      const value = Number(raw)
      return Number.isFinite(value) ? value : 0
    })
  })
  return result
}

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [dados, setDados] = useState<Dados>({})
  const [importado, setImportado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { try { const salvo = localStorage.getItem(STORAGE_KEY); if (salvo) { setDados(JSON.parse(salvo)); setImportado(true) } } catch {} }, [])
  async function importar(file?: File) { if (!file) return; try { const parsed = parseCsv(await file.text()); setDados(parsed); localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); setImportado(true) } catch { alert('Não foi possível ler a base. Use o CSV com Jan/26 até Dez/26.') } }
  const indice = Math.max(0, meses.indexOf(mes))
  const valor = (linha: string, i = indice) => Number(dados[linha]?.[i] || 0)
  const renda = valor('Renda Familiar')
  const despesasTotais = valor('Despesas Totais')
  const resultado = valor('Fluxo de Caixa do Período')
  const comprometimento = renda > 0 ? (despesasTotais / renda) * 100 : 0
  const anual = useMemo(() => ({ renda: meses.reduce((s, _, i) => s + valor('Renda Familiar', i), 0), despesas: meses.reduce((s, _, i) => s + valor('Despesas Totais', i), 0), resultado: meses.reduce((s, _, i) => s + valor('Fluxo de Caixa do Período', i), 0) }), [dados])

  return <div className="app">
    <aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n => { const Icon = n.icon; return <Link key={n.href} href={n.href} className={n.href === '/controle' ? 'active' : ''}><Icon size={17}/>{n.label}</Link> })}</nav><div className="sideBottom"><small>CONTROLE FAMILIAR</small><p>Controle de despesas e fluxo de caixa em uma única visão.</p></div></aside>
    <main className="content">
      <header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Controle financeiro</h1><p className="muted">Visão consolidada da família · {mes}</p></div><div className="topActions"><div className="month controlMonth"><CalendarDays size={16}/><select value={mes} onChange={e => setMes(e.target.value as typeof mes)}>{meses.map(m => <option key={m}>{m}</option>)}</select></div><button className="statusPill" onClick={() => inputRef.current?.click()}><Upload size={14}/>{importado ? 'Atualizar base' : 'Carregar base real'}</button><input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => importar(e.target.files?.[0])}/></div></header>
      {!importado && <section className="panel" style={{marginBottom:18}}><div className="panelHead"><div><h2>Base financeira ainda não carregada</h2><p>Na produção, os valores reais ficam somente no navegador e não são publicados no GitHub.</p></div><button className="primary" onClick={() => inputRef.current?.click()}><Upload size={16}/>Importar CSV</button></div></section>}
      <section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Renda familiar</span><strong>{moeda(renda)}</strong><small>Léo + Nat</small></div></article><article><div className="cardIcon expense"><ArrowDownLeft size={19}/></div><div><span>Despesas totais</span><strong>{moeda(despesasTotais)}</strong><small>Base oficial do controle</small></div></article><article><div className="cardIcon balance"><ArrowDownLeft size={19}/></div><div><span>Fluxo do período</span><strong>{moeda(resultado)}</strong><small>{renda > 0 ? `Comprometimento ${comprometimento.toFixed(1)}%` : 'Sem dados importados'}</small></div></article></section>
      <section className="panel monthlyPanel"><div className="panelHead"><div><h2>Controle de despesas e fluxo de caixa</h2><p>Meses na horizontal · categorias e contas na vertical · valores com centavos.</p></div><div className="miniMetrics"><div><span>Renda anual</span><b>{moeda(anual.renda)}</b></div><div><span>Despesas anuais</span><b>{moeda(anual.despesas)}</b></div><div><span>Resultado anual</span><b>{moeda(anual.resultado)}</b></div></div></div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-[1500px] w-full border-collapse text-sm"><thead><tr className="bg-slate-100"><th className="sticky left-0 z-20 min-w-[270px] border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left font-semibold">Orçamento Familiar</th>{meses.map(m => <th key={m} className={`min-w-[105px] border-b border-slate-200 px-3 py-3 text-right font-semibold ${m === mes ? 'bg-slate-200' : ''}`}>{m}</th>)}</tr></thead><tbody>{grupos.map(grupo => <>{<tr key={grupo.titulo} className="bg-slate-200"><td colSpan={13} className="border-t border-slate-300 px-4 py-2 font-bold text-slate-800">{grupo.titulo}</td></tr>}{grupo.linhas.map(linha => { const destaque = ['Salários e recebíveis','Renda Familiar','Despesas Totais','Despesas Fixas','Bancos e Acordos','Despesas Diversas','Fluxo de caixa','Fluxo de Caixa do Período'].includes(linha); return <tr key={linha}><td className={`sticky left-0 z-10 border-r border-t border-slate-200 bg-white px-4 py-2 ${destaque ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{linha}</td>{meses.map((m,i) => <td key={`${linha}-${m}`} className={`border-t border-slate-200 px-3 py-2 text-right tabular-nums ${m === mes ? 'bg-slate-50' : ''} ${destaque ? 'font-semibold' : ''}`}>{moeda(valor(linha,i))}</td>)}</tr>})}</>)}</tbody></table></div>
      </section>
    </main>
  </div>
}
