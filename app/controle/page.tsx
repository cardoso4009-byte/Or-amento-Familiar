'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, FileSpreadsheet, PiggyBank, Upload, Wallet, TrendingUp } from 'lucide-react'
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
function parseCsv(text: string): Dados { const rows = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).map(line => { const d = line.includes(';') ? ';' : ','; return line.split(d).map(v => v.trim().replace(/^"|"$/g, '')) }); return parseRows(rows) }
async function parseArquivo(file: File): Promise<Dados> { const ext = file.name.toLowerCase().split('.').pop(); if (ext === 'xlsx' || ext === 'xls') { const buffer = await file.arrayBuffer(); const wb = XLSX.read(buffer, { type: 'array', cellDates: false }); const sheet = wb.Sheets[wb.SheetNames[0]]; if (!sheet) throw new Error('Planilha sem aba válida'); return parseRows(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][]) } if (ext === 'csv') return parseCsv(await file.text()); throw new Error('Formato não suportado') }

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [dados, setDados] = useState<Dados>({})
  const [importado, setImportado] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { try { const salvo = localStorage.getItem(STORAGE_KEY); if (salvo) { setDados(JSON.parse(salvo)); setImportado(true) } } catch {} }, [])
  async function importar(file?: File) { if (!file) return; try { const parsed = await parseArquivo(file); if (!Object.keys(parsed).length) throw new Error('Nenhum dado encontrado'); setDados(parsed); localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); setImportado(true) } catch { alert('Não foi possível importar. Selecione o modelo Excel (.xlsx/.xls) ou CSV com Jan/26 até Dez/26.') } finally { if (inputRef.current) inputRef.current.value = '' } }
  const indice = Math.max(0, meses.indexOf(mes)); const valor = (linha: string, i = indice) => Number(dados[linha]?.[i] || 0)
  const renda = valor('Renda Familiar'); const despesas = valor('Despesas Totais'); const fluxo = valor('Fluxo de Caixa do Período'); const fixas = valor('Despesas Fixas'); const diversas = valor('Despesas Diversas'); const comprometimento = renda > 0 ? despesas / renda * 100 : 0
  const anual = useMemo(() => ({ renda: meses.reduce((s, _, i) => s + valor('Renda Familiar', i), 0), despesas: meses.reduce((s, _, i) => s + valor('Despesas Totais', i), 0), fluxo: meses.reduce((s, _, i) => s + valor('Fluxo de Caixa do Período', i), 0) }), [dados])
  const maxGrafico = Math.max(...meses.map((_, i) => Math.max(valor('Renda Familiar', i), valor('Despesas Totais', i))), 1)
  const receitaLeo = valor('Salários - Léo') + valor('Férias - Léo') + valor('13º - Léo') + valor('Bônus - Léo') + valor('IR / Dissídio - Léo')
  const receitaNat = valor('Salários - Nat') + valor('Férias - Nat') + valor('13º - Nat') + valor('Bônus - Nat') + valor('IR / Dissídio - Nat')
  return <div className="app">
    <aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n => { const Icon=n.icon; return <Link key={n.href} href={n.href} className={n.href==='/controle'?'active':''}><Icon size={17}/>{n.label}</Link> })}</nav><div className="sideBottom"><small>VISÃO EXECUTIVA</small><p>Indicadores financeiros da família em uma visão simples e objetiva.</p></div></aside>
    <main className="content">
      <header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Dashboard financeiro</h1><p className="muted">Visão sintética da situação financeira · {mes}</p></div><div className="topActions"><div className="month controlMonth"><CalendarDays size={16}/><select value={mes} onChange={e=>setMes(e.target.value as typeof mes)}>{meses.map(m=><option key={m}>{m}</option>)}</select></div><button className="statusPill" onClick={()=>inputRef.current?.click()}><Upload size={14}/>{importado?'Atualizar base':'Carregar base'}</button><input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={e=>importar(e.target.files?.[0])}/></div></header>
      {!importado && <section className="panel" style={{marginBottom:18}}><div className="panelHead"><div><h2>Base financeira ainda não carregada</h2><p>Importe sua base para visualizar os indicadores. Os dados ficam somente neste navegador.</p></div><button className="primary" onClick={()=>inputRef.current?.click()}><Upload size={16}/>Importar Excel/CSV</button></div></section>}
      <section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Receita Familiar</span><strong>{moeda(renda)}</strong><small>Léo + Nat</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Despesas</span><strong>{moeda(despesas)}</strong><small>Despesas totais do período</small></div></article><article><div className="cardIcon balance"><TrendingUp size={19}/></div><div><span>Fluxo de Caixa</span><strong>{moeda(fluxo)}</strong><small>{fluxo>=0?'Resultado positivo':'Resultado negativo'}</small></div></article><article><div className="cardIcon balance"><BarChart3 size={19}/></div><div><span>Comprometimento da Renda</span><strong>{renda>0?`${comprometimento.toFixed(1)}%`:'—'}</strong><small>{renda>0?(comprometimento<=70?'Dentro do esperado':'Atenção'):'Sem dados'}</small></div></article></section>
      <section className="panel monthlyPanel"><div className="panelHead"><div><h2>Evolução financeira</h2><p>Receita, despesas e fluxo de caixa ao longo de 2026.</p></div><div className="miniMetrics"><div><span>Receita anual</span><b>{moeda(anual.renda)}</b></div><div><span>Despesas anuais</span><b>{moeda(anual.despesas)}</b></div><div><span>Fluxo anual</span><b>{moeda(anual.fluxo)}</b></div></div></div><div className="overflow-x-auto"><div className="chartGrid">{meses.map((m,i)=>{const r=valor('Renda Familiar',i),d=valor('Despesas Totais',i);return <div key={m} className="chartMonth"><div className="chartBars"><div className="chartBar revenue" style={{height:`${Math.max(4,r/maxGrafico*100)}%`}} title={`Receita ${m}: ${moeda(r)}`}></div><div className="chartBar expenses" style={{height:`${Math.max(4,d/maxGrafico*100)}%`}} title={`Despesas ${m}: ${moeda(d)}`}></div></div><span>{m.replace('/26','')}</span></div>})}</div></div><div className="chartLegend"><span><i className="legend revenue"></i> Receita</span><span><i className="legend expenses"></i> Despesas</span></div></section>
      <section className="controlGrid"><article className="panel"><div className="panelHead"><div><h2>Visão do mês</h2><p>{mes}</p></div></div><div className="cashRows"><div><span>Receita Léo</span><b>{moeda(receitaLeo)}</b></div><div><span>Receita Nat</span><b>{moeda(receitaNat)}</b></div><div><span>Despesas Fixas</span><b>{moeda(fixas)}</b></div><div><span>Despesas Diversas</span><b>{moeda(diversas)}</b></div></div></article><article className="panel"><div className="panelHead"><div><h2>Status financeiro</h2><p>Leitura rápida do período selecionado.</p></div></div><div className="cashRows"><div><span>Resultado</span><b>{moeda(fluxo)}</b></div><div><span>Comprometimento</span><b>{renda>0?`${comprometimento.toFixed(1)}%`:'—'}</b></div><div><span>Margem financeira</span><b>{renda>0?`${(fluxo/renda*100).toFixed(1)}%`:'—'}</b></div><div><span>Situação</span><b>{fluxo>=0?'Positiva':'Atenção'}</b></div></div></article></section>
      <section className="panel"><div className="panelHead"><div><h2>Análise detalhada</h2><p>Para abrir por conta, fornecedor e lançamento, acesse a segunda tela.</p></div><Link className="primary" href="/lancamentos">Abrir lançamentos →</Link></div></section>
    </main>
  </div>
}
