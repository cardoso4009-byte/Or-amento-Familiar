'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, FileSpreadsheet, PiggyBank, Wallet } from 'lucide-react'
import { MESES_2026 } from '../../lib/modelo-orcamento'

const meses = ['Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26']
const moeda = (v: number) => v === 0 ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const nav = [
  { href: '/controle', label: 'Controle', icon: BarChart3 },
  { href: '/lancamentos', label: 'Lançamentos', icon: ArrowDownLeft },
  { href: '/contas', label: 'Contas', icon: Wallet },
  { href: '/investimentos', label: 'Investimentos', icon: PiggyBank },
  { href: '/homologacao', label: 'Homologação', icon: FileSpreadsheet },
]
const despesas = [
  { nome: 'Despesas Fixas', detalhe: 'Moradia, escola, seguros e compromissos recorrentes' },
  { nome: 'Bancos e Acordos', detalhe: 'Parcelas, acordos e compromissos financeiros' },
  { nome: 'Despesas Diversas', detalhe: 'Controle separado da despesa total oficial' },
]
type Dados = Record<string, number[]>

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [modo, setModo] = useState<'mensal' | 'anual'>('mensal')
  const [dados, setDados] = useState<Dados>({})

  useEffect(() => {
    try { setDados(JSON.parse(localStorage.getItem('orcamento-familiar-homologacao-2026') || '{}')) } catch { setDados({}) }
  }, [])

  const indice = Math.max(0, meses.indexOf(mes))
  const valor = (linha: string, i = indice) => Number(dados[linha]?.[i] || 0)
  const renda = valor('Renda Familiar')
  const despesasTotais = valor('Despesas Totais')
  const resultado = valor('Fluxo de Caixa do Período')
  const comprometimento = renda ? (despesasTotais / renda) * 100 : 0
  const acumulado = useMemo(() => meses.slice(0, indice + 1).reduce((s, _, i) => s + valor('Fluxo de Caixa do Período', i), 0), [dados, indice])

  return <div className="app">
    <aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n => { const Icon=n.icon; return <Link key={n.href} href={n.href} className={n.href==='/controle'?'active':''}><Icon size={17}/>{n.label}</Link> })}</nav><div className="sideBottom"><small>CONTROLE FAMILIAR</small><p>Acompanhe despesas, fluxo de caixa e resultado da família.</p></div></aside>
    <main className="content">
      <header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Controle financeiro</h1><p className="muted">Despesas familiares + fluxo de caixa · {mes}</p></div><div className="topActions"><div className="month controlMonth"><CalendarDays size={16}/><select value={mes} onChange={e=>setMes(e.target.value as typeof mes)}>{MESES_2026.map(m=><option key={m}>{m}</option>)}</select></div></div></header>
      <div className="viewSwitch"><button className={modo==='mensal'?'active':''} onClick={()=>setModo('mensal')}>Visão mensal</button><button className={modo==='anual'?'active':''} onClick={()=>setModo('anual')}>Visão anual</button></div>
      {modo==='mensal' ? <>
        <section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Renda familiar</span><strong>{moeda(renda)}</strong><small>Léo + Nat</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Despesas familiares</span><strong>{moeda(despesasTotais)}</strong><small>Total oficial do controle</small></div></article><article><div className="cardIcon balance"><CircleDollarSign size={19}/></div><div><span>Resultado familiar</span><strong>{moeda(resultado)}</strong><small>Renda − despesas</small></div></article></section>
        <section className="grid controlGrid"><article className="panel"><div className="panelHead"><div><h2>Controle de despesas</h2><p>Valores reais da base homologada · {mes}</p></div><span className="statusPill">Família</span></div><div className="expenseGroups">{despesas.map(d=><div className="expenseGroup" key={d.nome}><div><strong>{d.nome}</strong><span>{d.detalhe}</span></div><div className="expenseNumbers"><div><small>Realizado</small><b>{moeda(valor(d.nome))}</b></div></div></div>)}</div><div className="expenseTotal"><div><strong>Despesas Totais</strong><span>Base utilizada no resultado familiar</span></div><b>{moeda(despesasTotais)}</b></div></article>
          <aside className="controlAside"><article className="panel"><div className="panelHead"><div><h2>Fluxo de caixa</h2><p>Movimentação do período</p></div></div><div className="cashRows"><div><span>Entradas</span><b className="positive">{moeda(renda)}</b></div><div><span>Saídas</span><b>{moeda(despesasTotais)}</b></div><div className="cashResult"><span>Fluxo do período</span><b>{moeda(resultado)}</b></div></div><div className="commitment"><div><span>Comprometimento da renda</span><b>{renda ? `${comprometimento.toFixed(1)}%` : '—'}</b></div><div className="progress"><i style={{width:`${Math.min(comprometimento,100)}%`}}/></div><small>Calculado sobre Despesas Totais.</small></div></article><article className="panel"><div className="panelHead"><div><h2>Acompanhamento</h2><p>Indicadores para decisão</p></div></div><div className="miniMetrics"><div><span>Disponível após despesas</span><b>{moeda(resultado)}</b></div><div><span>Saldo acumulado</span><b>{moeda(acumulado)}</b></div></div></article></aside></section>
      </> : <section className="panel monthlyPanel"><div className="panelHead"><div><h2>Visão anual 2026</h2><p>Renda, despesas e resultado por mês.</p></div></div><div className="monthlyTable"><div className="monthlyHead"><span>Mês</span><span>Renda</span><span>Despesas</span><span>Resultado</span></div>{meses.map((m,i)=><div className={`monthlyRow ${m===mes?'selected':''}`} key={m}><strong>{m}</strong><span>{moeda(valor('Renda Familiar',i))}</span><span>{moeda(valor('Despesas Totais',i))}</span><span>{moeda(valor('Fluxo de Caixa do Período',i))}</span></div>)}</div></section>}
      <section className="panel monthlyPanel"><div className="panelHead"><div><h2>{modo==='mensal'?'Evolução mensal':'Resumo anual'}</h2><p>Dados da base local de homologação. Nenhum valor real é gravado no código público.</p></div></div>{modo==='mensal' ? <div className="monthStrip">{meses.map((m,i)=><div key={m}><span>{m.replace('/26','')}</span><b>{moeda(valor('Fluxo de Caixa do Período',i))}</b><small>{moeda(valor('Renda Familiar',i))} · {moeda(valor('Despesas Totais',i))}</small></div>)}</div> : <div className="miniMetrics"><div><span>Renda anual</span><b>{moeda(meses.reduce((s,_,i)=>s+valor('Renda Familiar',i),0))}</b></div><div><span>Despesas anuais</span><b>{moeda(meses.reduce((s,_,i)=>s+valor('Despesas Totais',i),0))}</b></div><div><span>Resultado anual</span><b>{moeda(meses.reduce((s,_,i)=>s+valor('Fluxo de Caixa do Período',i),0))}</b></div></div>}</section>
    </main>
  </div>
}
