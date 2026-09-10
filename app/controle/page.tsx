'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, FileSpreadsheet, PiggyBank, Upload, Wallet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { MESES_2026 } from '../../lib/modelo-orcamento'

const meses = [...MESES_2026]
const STORAGE_KEY = 'orcamento-familiar-homologacao-2026'
type Dados = Record<string, number[]>
const moeda = (v: number) => v === 0 ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nav = [
  { href: '/controle', label: 'Dashboard', icon: BarChart3 },
  { href: '/lancamentos', label: 'Lançamentos', icon: ArrowDownLeft },
  { href: '/contas', label: 'Contas', icon: Wallet },
  { href: '/investimentos', label: 'Investimentos', icon: PiggyBank },
  { href: '/homologacao', label: 'Homologação', icon: FileSpreadsheet },
]
function normalizarValor(raw: unknown): number { if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0; let t = String(raw ?? '').trim().replace(/R\$\s?/gi, ''); if (!t) return 0; if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.'); const n = Number(t); return Number.isFinite(n) ? n : 0 }
function parseRows(rows: unknown[][]): Dados { const result: Dados = {}; const header = (rows[0] || []).map(v => String(v ?? '').trim()); const indices = meses.map(m => header.findIndex(h => h === m)); rows.slice(1).forEach(row => { const label = String(row?.[0] ?? '').trim(); if (!label || label === 'Categoria') return; result[label] = indices.map(i => i < 0 ? 0 : normalizarValor(row?.[i])); }); return result }
function parseCsv(text: string): Dados { const rows = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).map(line => { const d = line.includes(';') ? ';' : ','; return line.split(d).map(v => v.trim().replace(/^\"|\"$/g, '')) }); return parseRows(rows) }
async function parseArquivo(file: File): Promise<Dados> { const ext = file.name.toLowerCase().split('.').pop(); if (ext === 'xlsx' || ext === 'xls') { const buffer = await file.arrayBuffer(); const wb = XLSX.read(buffer, { type: 'array', cellDates: false }); const sheet = wb.Sheets[wb.SheetNames[0]]; if (!sheet) throw new Error('Planilha sem aba válida'); return parseRows(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][]) } if (ext === 'csv') return parseCsv(await file.text()); throw new Error('Formato não suportado') }

export default function ControlePage() {
  const [dados, setDados] = useState<Dados>({})
  const [importado, setImportado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { try { const salvo = localStorage.getItem(STORAGE_KEY); if (salvo) { setDados(JSON.parse(salvo)); setImportado(true) } } catch {} }, [])
  async function importar(file?: File) { if (!file) return; try { const parsed = await parseArquivo(file); if (!Object.keys(parsed).length) throw new Error('Nenhum dado encontrado'); setDados(parsed); localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); setImportado(true) } catch { alert('Não foi possível importar. Selecione o modelo Excel (.xlsx/.xls) ou CSV com Jan/26 até Dez/26.') } finally { if (inputRef.current) inputRef.current.value = '' } }
  const valor = (linha: string, i: number) => Number(dados[linha]?.[i] || 0)
  const anual = useMemo(() => ({ renda: meses.reduce((s, _, i) => s + valor('Renda Familiar', i), 0), despesas: meses.reduce((s, _, i) => s + valor('Despesas Totais', i), 0), fluxo: meses.reduce((s, _, i) => s + valor('Fluxo de Caixa do Período', i), 0) }), [dados])
  const receitaRows = [
    { label: 'Salários', key: 'Salários' },
    { label: 'Férias', key: 'Férias' },
    { label: '13º Salário', key: '13º Salário' },
    { label: 'Bônus', key: 'Bônus' },
    { label: 'IR / Dissídio', key: 'IR / Dissídio' },
  ]
  const despesaRows = [
    { label: 'Despesas Fixas', key: 'Despesas Fixas' },
    { label: 'Bancos e Acordos', key: 'Bancos e Acordos' },
  ]
  return <div className="app">
    <aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n=>{const Icon=n.icon;return <Link key={n.href} href={n.href} className={n.href==='/controle'?'active':''}><Icon size={17}/>{n.label}</Link>})}</nav><div className="sideBottom"><small>VISÃO EXECUTIVA</small><p>Indicadores financeiros da família em uma visão simples e objetiva.</p></div></aside>
    <main className="content">
      <header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Dashboard financeiro</h1><p className="muted">Visão sintética da situação financeira · 2026</p></div><div className="topActions"><button className="statusPill" onClick={()=>inputRef.current?.click()}><Upload size={14}/>{importado?'Atualizar base':'Carregar base'}</button><input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={e=>importar(e.target.files?.[0])}/></div></header>
      {!importado && <section className="panel" style={{marginBottom:18}}><div className="panelHead"><div><h2>Base financeira ainda não carregada</h2><p>Importe sua base para visualizar os indicadores. Os dados ficam somente neste navegador.</p></div><button className="primary" onClick={()=>inputRef.current?.click()}><Upload size={16}/>Importar Excel/CSV</button></div></section>}
      <section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Receita Familiar · 2026</span><strong>{moeda(anual.renda)}</strong><small>Salários e recebíveis</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Despesas · 2026</span><strong>{moeda(anual.despesas)}</strong><small>Despesas Totais</small></div></article><article><div className="cardIcon balance"><ArrowDownLeft size={19}/></div><div><span>Fluxo de Caixa · 2026</span><strong>{moeda(anual.fluxo)}</strong><small>Fluxo de Caixa do Período</small></div></article></section>
      <section className="panel monthlyPanel"><div className="panelHead"><div><h2>Indicadores financeiros</h2><p>Meses sempre na horizontal para comparação direta.</p></div></div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-[1450px] w-full border-collapse text-sm"><thead><tr className="bg-slate-100"><th className="sticky left-0 z-20 min-w-[260px] border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left font-semibold">Indicador</th>{meses.map(m=><th key={m} className="min-w-[105px] border-b border-slate-200 px-3 py-3 text-right font-semibold">{m}</th>)}</tr></thead><tbody>
          <tr><td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-800">Salários e recebíveis</td>{meses.map((m,i)=><td key={`renda-${m}`} className="border-t border-slate-200 bg-slate-50 px-3 py-3 text-right font-bold tabular-nums">{moeda(valor('Renda Familiar',i))}</td>)}</tr>
          {receitaRows.map(r=><tr key={r.label}><td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-white px-4 py-3 pl-8 text-slate-600">{r.label}</td>{meses.map((m,i)=><td key={`${r.label}-${m}`} className="border-t border-slate-200 px-3 py-3 text-right tabular-nums">{moeda(valor(r.key,i))}</td>)}</tr>)}
          <tr><td className="sticky left-0 z-10 border-r border-t-2 border-slate-300 bg-slate-50 px-4 py-3 font-bold text-slate-800">Despesas Totais</td>{meses.map((m,i)=><td key={`desp-total-${m}`} className="border-t-2 border-slate-300 bg-slate-50 px-3 py-3 text-right font-bold tabular-nums">{moeda(valor('Despesas Totais',i))}</td>)}</tr>
          {despesaRows.map(r=><tr key={r.label}><td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-white px-4 py-3 pl-8 text-slate-600">{r.label}</td>{meses.map((m,i)=><td key={`${r.label}-${m}`} className="border-t border-slate-200 px-3 py-3 text-right tabular-nums">{moeda(valor(r.key,i))}</td>)}</tr>)}
          <tr><td className="sticky left-0 z-10 border-r border-t-2 border-slate-300 bg-slate-50 px-4 py-3 font-bold text-slate-800">Fluxo de Caixa</td>{meses.map((m,i)=><td key={`fluxo-${m}`} className="border-t-2 border-slate-300 bg-slate-50 px-3 py-3 text-right font-bold tabular-nums">{moeda(valor('Fluxo de caixa',i))}</td>)}</tr>
          <tr><td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">Fluxo de Caixa do Período</td>{meses.map((m,i)=>{const v=valor('Fluxo de Caixa do Período',i);return <td key={`periodo-${m}`} className="border-t border-slate-200 px-3 py-3 text-right font-semibold tabular-nums">{moeda(v)}</td>})}</tr>
          <tr><td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">Comprometimento da Renda</td>{meses.map((m,i)=>{const renda=valor('Renda Familiar',i), desp=valor('Despesas Totais',i), v=renda>0?desp/renda*100:0;return <td key={`comp-${m}`} className="border-t border-slate-200 px-3 py-3 text-right tabular-nums">{v?`${v.toFixed(1)}%`:'—'}</td>})}</tr>
        </tbody></table></div>
      </section>
      <section className="panel"><div className="panelHead"><div><h2>Análise detalhada</h2><p>Conta, fornecedor, categoria e lançamento ficam na segunda tela.</p></div><Link className="primary" href="/lancamentos">Abrir lançamentos →</Link></div></section>
    </main>
  </div>
}
