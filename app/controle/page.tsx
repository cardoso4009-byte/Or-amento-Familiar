'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, FileSpreadsheet, PiggyBank, Wallet } from 'lucide-react'
import { MESES_2026 } from '../../lib/modelo-orcamento'

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [modo, setModo] = useState<'mensal' | 'anual'>('mensal')

  // Nesta fase a tela trabalha somente com a estrutura. Os valores reais entram na homologação.
  const renda = 0
  const despesasTotais = 0
  const resultado = renda - despesasTotais
  const comprometimento = renda > 0 ? (despesasTotais / renda) * 100 : 0

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div>
      <nav>{nav.map(n => { const Icon = n.icon; return <Link key={n.href} href={n.href} className={n.href === '/controle' ? 'active' : ''}><Icon size={17}/>{n.label}</Link> })}</nav>
      <div className="sideBottom"><small>CONTROLE FAMILIAR</small><p>Acompanhe despesas, fluxo de caixa e resultado da família.</p></div>
    </aside>

    <main className="content">
      <header className="top">
        <div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Controle financeiro</h1><p className="muted">Despesas familiares + fluxo de caixa · {mes}</p></div>
        <div className="topActions"><div className="month controlMonth"><CalendarDays size={16}/><select value={mes} onChange={e => setMes(e.target.value as typeof mes)} aria-label="Mês de referência">{MESES_2026.map(m => <option key={m}>{m}</option>)}</select></div></div>
      </header>

      <div className="viewSwitch"><button className={modo === 'mensal' ? 'active' : ''} onClick={() => setModo('mensal')}>Visão mensal</button><button className={modo === 'anual' ? 'active' : ''} onClick={() => setModo('anual')}>Visão anual</button></div>

      <section className="cards controlCards">
        <article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Renda familiar</span><strong>{moeda(renda)}</strong><small>Léo + Nat</small></div></article>
        <article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Despesas familiares</span><strong>{moeda(despesasTotais)}</strong><small>Total oficial do controle</small></div></article>
        <article><div className="cardIcon balance"><CircleDollarSign size={19}/></div><div><span>Resultado familiar</span><strong>{moeda(resultado)}</strong><small>Renda − despesas</small></div></article>
      </section>

      <section className="grid controlGrid">
        <article className="panel">
          <div className="panelHead"><div><h2>Controle de despesas</h2><p>Planejado × realizado por grupo</p></div><span className="statusPill">Família</span></div>
          <div className="expenseGroups">{despesas.map(d => <div className="expenseGroup" key={d.nome}><div><strong>{d.nome}</strong><span>{d.detalhe}</span></div><div className="expenseNumbers"><div><small>Planejado</small><b>{moeda(0)}</b></div><div><small>Realizado</small><b>{moeda(0)}</b></div><div><small>Diferença</small><b>{moeda(0)}</b></div></div></div>)}</div>
          <div className="expenseTotal"><div><strong>Despesas Totais</strong><span>Base utilizada no resultado familiar</span></div><b>{moeda(despesasTotais)}</b></div>
        </article>

        <aside className="controlAside">
          <article className="panel">
            <div className="panelHead"><div><h2>Fluxo de caixa</h2><p>Movimentação do período</p></div></div>
            <div className="cashRows"><div><span>Entradas</span><b className="positive">{moeda(renda)}</b></div><div><span>Saídas</span><b>{moeda(despesasTotais)}</b></div><div className="cashResult"><span>Fluxo do período</span><b>{moeda(resultado)}</b></div></div>
            <div className="commitment"><div><span>Comprometimento da renda</span><b>{comprometimento.toFixed(1)}%</b></div><div className="progress"><i style={{ width: `${Math.min(comprometimento, 100)}%` }}/></div><small>Calculado sobre Despesas Totais.</small></div>
          </article>
          <article className="panel"><div className="panelHead"><div><h2>Leitura rápida</h2><p>Indicadores para decisão</p></div></div><div className="miniMetrics"><div><span>Disponível após despesas</span><b>{moeda(resultado)}</b></div><div><span>Saldo acumulado</span><b>—</b></div></div></article>
        </aside>
      </section>

      <section className="panel monthlyPanel">
        <div className="panelHead"><div><h2>Evolução mensal</h2><p>Comparação de renda, despesas e resultado ao longo de 2026.</p></div></div>
        <div className="monthlyTable"><div className="monthlyHead"><span>Mês</span><span>Renda</span><span>Despesas</span><span>Resultado</span></div>{MESES_2026.map(m => <div className={`monthlyRow ${m === mes ? 'selected' : ''}`} key={m}><strong>{m}</strong><span>{moeda(0)}</span><span>{moeda(0)}</span><span>{moeda(0)}</span></div>)}</div>
      </section>

      <section className="controlFooterNote"><strong>Estrutura do controle</strong><span>Esta tela é para acompanhar a situação financeira. Os lançamentos por conta serão feitos na segunda tela. A homologação dos números reais acontece depois.</span></section>
    </main>
  </div>
}
