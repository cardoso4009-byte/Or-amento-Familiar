'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, FileSpreadsheet, PiggyBank, Wallet } from 'lucide-react'
import { ESTRUTURA_ORCAMENTO, MESES_2026, REGRAS_APLICACAO } from '../../lib/modelo-orcamento'

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

  const grupos = useMemo(() => {
    const map = new Map<string, typeof ESTRUTURA_ORCAMENTO>()
    ESTRUTURA_ORCAMENTO.forEach((linha) => {
      if (!map.has(linha.grupo)) map.set(linha.grupo, [])
      map.get(linha.grupo)!.push(linha)
    })
    return [...map.entries()]
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div>
        <nav>{modulos.map((m) => { const Icon = m.icon; return <button key={m.id} className={modulo === m.id ? 'active' : ''} onClick={() => setModulo(m.id)}><Icon size={17} />{m.titulo}</button> })}</nav>
        <div className="sideBottom"><small>FASE ATUAL</small><p>Estruturação da aplicação.<br />Homologação numérica depois.</p></div>
      </aside>

      <main className="content">
        <header className="top">
          <div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Estrutura de Controle</h1><p className="muted">Controle financeiro construído no mesmo formato e raciocínio da sua planilha.</p></div>
          <div className="topActions"><div className="month controlMonth"><CalendarDays size={16} /><select value={mes} onChange={(e) => setMes(e.target.value as typeof mes)}>{MESES_2026.map((m) => <option key={m}>{m}</option>)}</select></div></div>
        </header>

        <section className="controlModules">{modulos.map((m) => { const Icon = m.icon; return <button key={m.id} className={`controlModule ${modulo === m.id ? 'selected' : ''}`} onClick={() => setModulo(m.id)}><span className="controlModuleIcon"><Icon size={18} /></span><span><strong>{m.titulo}</strong><small>{m.descricao}</small></span></button> })}</section>

        <section className="cards controlCards">
          <article><div className="cardIcon income"><ArrowDownLeft size={19} /></div><div><span>Renda familiar</span><strong>—</strong><small>Base pronta para homologação</small></div></article>
          <article><div className="cardIcon expense"><ArrowUpRight size={19} /></div><div><span>Despesas familiares</span><strong>—</strong><small>Despesas tratadas como família</small></div></article>
          <article><div className="cardIcon balance"><CircleDollarSign size={19} /></div><div><span>Resultado familiar</span><strong>—</strong><small>Receitas menos despesas oficiais</small></div></article>
        </section>

        <section className="grid controlGrid">
          <article className="panel"><div className="panelHead"><div><h2>Estrutura da base de controle</h2><p>{modulos.find((m) => m.id === modulo)?.titulo} · {mes}</p></div></div><div className="controlRows">{grupos.map(([grupo, linhas]) => <div className="controlGroup" key={grupo}><h3>{grupo}</h3>{linhas.map((linha) => <div className="controlRow" key={linha.id}><div><strong>{linha.nome}</strong>{linha.responsavel && <span>{linha.responsavel}</span>}</div><b>—</b></div>)}</div>)}</div></article>
          <aside className="controlAside"><article className="panel"><div className="panelHead"><div><h2>Regras do aplicativo</h2><p>Critérios usados em todo o controle</p></div></div><ul className="ruleList">{REGRAS_APLICACAO.map((regra) => <li key={regra}>{regra}</li>)}</ul></article><article className="phaseCard"><strong>Fase atual</strong><p>Estruturação funcional. Os valores reais serão inseridos somente na etapa de homologação.</p></article></aside>
        </section>
      </main>
    </div>
  )
}
