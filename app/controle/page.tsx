'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, FileSpreadsheet, Pencil, Percent, PiggyBank, Save, Upload, Users, Wallet, X } from 'lucide-react'
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

function normalizarValor(raw: unknown) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  let t = String(raw ?? '').trim().replace(/R\$\s?/gi, '')
  if (!t) return 0
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const n = Number(t)
  return Number.isFinite(n) ? n : 0
}
function parseRows(rows: unknown[][]): Dados {
  const result: Dados = {}
  const header = (rows[0] || []).map(v => String(v ?? '').trim())
  const indices = meses.map(m => header.findIndex(h => h === m))
  rows.slice(1).forEach(row => {
    const label = String(row?.[0] ?? '').trim()
    if (!label || label === 'Categoria') return
    result[label] = indices.map(i => i < 0 ? 0 : normalizarValor(row?.[i]))
  })
  return result
}
function parseCsv(text: string): Dados {
  const rows = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).map(line => {
    const d = line.includes(';') ? ';' : ','
    return line.split(d).map(v => v.trim().replace(/^\"|\"$/g, ''))
  })
  return parseRows(rows)
}
async function parseArquivo(file: File): Promise<Dados> {
  const ext = file.name.toLowerCase().split('.').pop()
  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    if (!sheet) throw new Error('Planilha sem aba válida')
    return parseRows(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][])
  }
  if (ext === 'csv') return parseCsv(await file.text())
  throw new Error('Formato não suportado')
}

function BarChart({ receita, despesas }: { receita: number[]; despesas: number[] }) {
  const max = Math.max(...receita, ...despesas, 1)
  return <div className="chartBox"><div className="barChart">{meses.map((m, i) => { const rh = Math.max(3, receita[i] / max * 100), dh = Math.max(3, despesas[i] / max * 100); return <div className="barGroup" key={m}><div className="bars"><i className="barIncome" style={{ height: `${rh}%` }} /><i className="barExpense" style={{ height: `${dh}%` }} /></div><span>{m.split('/')[0]}</span></div> })}</div><div className="chartLegend"><span><i className="legendIncome" />Receita</span><span><i className="legendExpense" />Despesas</span></div></div>
}
function Donut({ values, total, labels }: { values: number[]; total: number; labels: string[] }) {
  const safe = values.map(v => Math.max(0, v)), sum = safe.reduce((a, b) => a + b, 0) || 1
  let start = 0
  const colors = ['#0f766e', '#2b6f85', '#65a9ad', '#8a9aa0', '#d5a14a']
  const parts = safe.map((v, i) => { const end = start + v / sum * 100; const p = { label: labels[i], value: v, start, end, color: colors[i] }; start = end; return p })
  const gradient = parts.map(p => `${p.color} ${p.start}% ${p.end}%`).join(', ')
  return <div className="donutWrap"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div className="donutHole"><strong>{moeda(total)}</strong><span>Total</span></div></div><div className="donutLegend">{parts.map(p => <div key={p.label}><span><i style={{ background: p.color }} />{p.label}</span><b>{(p.value / sum * 100).toFixed(0)}%</b></div>)}</div></div>
}
function LineChart({ values }: { values: number[] }) {
  const width = 640, height = 180, pad = 22, max = Math.max(...values, 1), min = Math.min(...values, 0), range = Math.max(max - min, 1)
  const points = values.map((v, i) => { const x = pad + i * (width - pad * 2) / (values.length - 1); const y = height - pad - (v - min) / range * (height - pad * 2); return `${x},${y}` }).join(' ')
  return <div className="lineChartWrap"><svg viewBox={`0 0 ${width} ${height}`} className="lineChart" role="img" aria-label="Evolução do fluxo de caixa do período"><line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="axis" /><polyline points={`${pad},${height - pad} ${points} ${width - pad},${height - pad}`} className="areaLine" /><polyline points={points} className="mainLine" />{values.map((v, i) => { const x = pad + i * (width - pad * 2) / (values.length - 1); const y = height - pad - (v - min) / range * (height - pad * 2); return <circle key={i} cx={x} cy={y} r="3.5" className="linePoint" /> })}</svg><div className="lineLabels">{meses.map(m => <span key={m}>{m.split('/')[0]}</span>)}</div></div>
}

export default function ControlePage() {
  const [dados, setDados] = useState<Dados>({})
  const [importado, setImportado] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { try { const salvo = localStorage.getItem(STORAGE_KEY); if (salvo) { setDados(JSON.parse(salvo)); setImportado(true) } } catch {} }, [])
  async function importar(file?: File) {
    if (!file) return
    try { const parsed = await parseArquivo(file); if (!Object.keys(parsed).length) throw new Error('Nenhum dado encontrado'); setDados(parsed); localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); setImportado(true); setEditando(null) }
    catch { alert('Não foi possível importar. Selecione o modelo Excel (.xlsx/.xls) ou CSV com Jan/26 até Dez/26.') }
    finally { if (inputRef.current) inputRef.current.value = '' }
  }

  const valor = (linha: string, i: number) => Number(dados[linha]?.[i] || 0)
  const receitaRows = [{ label: 'Salários', key: 'Salários' }, { label: 'Férias', key: 'Férias' }, { label: '13º Salário', key: '13º Salário' }, { label: 'Bônus', key: 'Bônus' }, { label: 'IR / Dissídio', key: 'IR / Dissídio' }]
  const despesaRows = [{ label: 'Despesas Fixas', key: 'Despesas Fixas' }, { label: 'Bancos e Acordos', key: 'Bancos e Acordos' }]
  const receitaMensal = meses.map((_, i) => receitaRows.reduce((s, r) => s + valor(r.key, i), 0))
  const despesasMensal = meses.map((_, i) => despesaRows.reduce((s, r) => s + valor(r.key, i), 0))
  const fluxoCaixaMensal = meses.map((_, i) => valor('Fluxo de caixa', i))
  const fluxoPeriodoCalculado = meses.map((_, i) => receitaMensal[i] - despesasMensal[i])
  const anual = useMemo(() => ({ renda: receitaMensal.reduce((s, v) => s + v, 0), despesas: despesasMensal.reduce((s, v) => s + v, 0), fluxo: fluxoPeriodoCalculado.reduce((s, v) => s + v, 0), fluxoCaixa: fluxoCaixaMensal.reduce((s, v) => s + v, 0) }), [dados])
  const taxaPoupanca = anual.renda > 0 ? anual.fluxo / anual.renda * 100 : 0

  function iniciarEdicao(key: string) { setEditando(key); setRascunho(meses.map((_, i) => valor(key, i))) }
  function alterarRascunho(index: number, raw: string) { setRascunho(prev => { const next = [...prev]; next[index] = normalizarValor(raw); return next }) }
  function salvarEdicao() { if (!editando) return; const next = { ...dados, [editando]: rascunho }; setDados(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setEditando(null); setRascunho([]) }
  function cancelarEdicao() { setEditando(null); setRascunho([]) }
  function celulas(key: string, destaque = false) { return meses.map((m, i) => <td key={`${key}-${m}`} className={`monthlyCell ${destaque ? 'periodCell' : ''}`}>{editando === key ? <input aria-label={`${key} ${m}`} type="number" step="0.01" value={rascunho[i] ?? 0} onChange={e => alterarRascunho(i, e.target.value)} /> : moeda(valor(key, i))}</td>) }
  function acao(key: string, label: string) { return <td className="actionCell">{editando === key ? <div className="actionButtons"><button type="button" title="Salvar" aria-label={`Salvar ${label}`} onClick={salvarEdicao} className="saveButton"><Save size={13} /></button><button type="button" title="Cancelar" aria-label={`Cancelar ${label}`} onClick={cancelarEdicao} className="cancelButton"><X size={13} /></button></div> : <button type="button" title={`Editar ${label}`} aria-label={`Editar ${label}`} onClick={() => iniciarEdicao(key)} className="editButton"><Pencil size={13} />Editar</button>}</td> }
  function linhaEditavel(label: string, key: string) { return <tr><td className="detailLabel"><span>{label}</span></td>{celulas(key)}{acao(key, label)}</tr> }

  return <div className="app">
    <aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n => { const Icon = n.icon; return <Link key={n.href} href={n.href} className={n.href === '/controle' ? 'active' : ''}><Icon size={17} />{n.label}</Link> })}</nav><div className="sideBottom"><small>VISÃO EXECUTIVA</small><p>Indicadores financeiros da família em uma visão simples e objetiva.</p></div></aside>
    <main className="content">
      <header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Dashboard financeiro</h1><p className="muted">Visão sintética da situação financeira · 2026</p></div><div className="topActions"><button className="statusPill" onClick={() => inputRef.current?.click()}><Upload size={14} />{importado ? 'Atualizar base' : 'Carregar base'}</button><input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => importar(e.target.files?.[0])} /></div></header>
      {!importado && <section className="panel" style={{ marginBottom: 18 }}><div className="panelHead"><div><h2>Base financeira ainda não carregada</h2><p>Importe sua base para visualizar os indicadores. Os dados ficam somente neste navegador.</p></div><button className="primary" onClick={() => inputRef.current?.click()}><Upload size={16} />Importar Excel/CSV</button></div></section>}
      <section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19} /></div><div><span>Receita Familiar · 2026</span><strong>{moeda(anual.renda)}</strong><small>Salários e recebíveis</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19} /></div><div><span>Despesas · 2026</span><strong>{moeda(anual.despesas)}</strong><small>Despesas Totais</small></div></article><article><div className="cardIcon balance"><ArrowDownLeft size={19} /></div><div><span>Fluxo de Caixa · 2026</span><strong>{moeda(anual.fluxo)}</strong><small>Fluxo de Caixa do Período</small></div></article></section>
      <section className="infoGrid"><article className="panel chartPanel"><div className="panelHead"><div><h2>Receita x Despesas</h2><p>Comparação mensal de 2026</p></div></div><BarChart receita={receitaMensal} despesas={despesasMensal} /></article><article className="panel chartPanel"><div className="panelHead"><div><h2>Composição da Receita</h2><p>Salários e recebíveis</p></div></div><Donut values={receitaRows.map(r => receitaMensal.reduce((s, _, i) => s + valor(r.key, i), 0))} total={anual.renda} labels={receitaRows.map(r => r.label)} /></article><article className="panel chartPanel"><div className="panelHead"><div><h2>Composição das Despesas</h2><p>Despesas Totais</p></div></div><Donut values={despesaRows.map(r => despesasMensal.reduce((s, _, i) => s + valor(r.key, i), 0))} total={anual.despesas} labels={despesaRows.map(r => r.label)} /></article></section>
      <section className="panel chartPanel wideChart"><div className="panelHead"><div><h2>Evolução do Fluxo de Caixa do Período</h2><p>Resultado mensal calculado: Receita Familiar − Despesas Totais</p></div><strong className="chartHighlight">{moeda(anual.fluxo)} no ano</strong></div><LineChart values={fluxoPeriodoCalculado} /></section>
      <section className="panel monthlyPanel"><div className="panelHead"><div><h2>Indicadores financeiros</h2><p>Meses sempre na horizontal para comparação direta.</p></div><div className="savingBadge">Taxa anual de poupança: <b>{taxaPoupanca.toFixed(1)}%</b></div></div>
        <div className="monthlyTableWrap"><table className="monthlyTable"><thead><tr><th className="indicatorHeader">Indicador</th>{meses.map(m => <th key={m}>{m}</th>)}<th className="actionsHeader">Ações</th></tr></thead><tbody>
          <tr className="sectionRow incomeRow"><td className="sectionLabel"><Users size={25} /><strong>Salários e recebíveis</strong></td>{meses.map((m, i) => <td key={m}>{moeda(receitaMensal[i])}</td>)}<td className="sectionAction">—</td></tr>
          {receitaRows.map(r => linhaEditavel(r.label, r.key))}
          <tr className="sectionRow expenseRow"><td className="sectionLabel"><Wallet size={25} /><strong>Despesas Totais</strong></td>{meses.map((m, i) => <td key={m}>{moeda(despesasMensal[i])}</td>)}<td className="sectionAction">—</td></tr>
          {despesaRows.map(r => linhaEditavel(r.label, r.key))}
          <tr className="sectionRow flowRow"><td className="sectionLabel"><BarChart3 size={25} /><strong>Fluxo de Caixa</strong></td>{meses.map((m, i) => <td key={m}>{moeda(fluxoCaixaMensal[i])}</td>)}<td className="sectionAction">—</td></tr>
          <tr className="sectionRow periodRow"><td className="sectionLabel"><BarChart3 size={25} /><strong>Fluxo de Caixa do Período</strong></td>{meses.map((m, i) => <td key={m}>{moeda(fluxoPeriodoCalculado[i])}</td>)}<td className="sectionAction">—</td></tr>
          <tr className="sectionRow commitmentRow"><td className="sectionLabel"><Percent size={25} /><strong>Comprometimento da Renda</strong></td>{meses.map((m, i) => { const renda = receitaMensal[i], desp = despesasMensal[i], v = renda > 0 ? desp / renda * 100 : 0; return <td key={m}>{v ? `${v.toFixed(1)}%` : '—'}</td> })}<td className="sectionAction">—</td></tr>
        </tbody></table></div>
        <p className="tableNote">As linhas detalhadas podem ser ajustadas manualmente. Os subtotais de Salários e Recebíveis e Despesas Totais são recalculados automaticamente. O Fluxo de Caixa do Período é calculado como Receita Familiar − Despesas Totais.</p>
      </section>
      <section className="panel"><div className="panelHead"><div><h2>Análise detalhada</h2><p>Conta, fornecedor, categoria e lançamento ficam na segunda tela.</p></div><Link className="primary" href="/lancamentos">Abrir lançamentos →</Link></div></section>
    </main>
  </div>
}