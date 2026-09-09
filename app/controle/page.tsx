'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, FileSpreadsheet, PiggyBank, Wallet } from 'lucide-react'
import { ESTRUTURA_ORCAMENTO, MESES_2026, REGRAS_APLICACAO } from '../../lib/modelo-orcamento'

const modulos = [
  { id: 'visao', titulo: 'Visão geral', descricao: 'Resumo mensal e anual', icon: BarChart3 },
  { id: 'receitas', titulo: 'Receitas', descricao: 'Léo, Nat e extraordinárias', icon: ArrowDownLeft },
  { id: 'despesas', titulo: 'Despesas', descricao: 'Gastos e compromissos familiares', icon: ArrowUpRight },
  { id: 'contas', titulo: 'Contas', descricao: 'Saldos e transferências', icon: Wallet },
  { id: 'investimentos', titulo: 'Investimentos', descricao: 'Patrimônio separado do consumo', icon: PiggyBank },
  { id: 'homologacao', titulo: 'Homologação', descricao: 'Aplicação × planilha', icon: FileSpreadsheet },
]

const grupoPorModulo: Record<string, string[]> = {
  visao: ['RECEITAS', 'DESPESAS', 'RESULTADO'],
  receitas: ['RECEITAS'],
  despesas: ['DESPESAS'],
  homologacao: ['RECEITAS', 'DESPESAS', 'RESULTADO'],
}

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [modulo, setModulo] = useState('visao')
  const grupos = useMemo(() => {
    const permitidos = grupoPorModulo[modulo]
    const map = new Map<string, typeof ESTRUTURA_ORCAMENTO>()
    ESTRUTURA_ORCAMENTO.forEach((linha) => {
      if (permitidos && !permitidos.includes(linha.grupo)) return
      if (!map.has(linha.grupo)) map.set(linha.grupo, [])
      map.get(linha.grupo)!.push(linha)
    })
    return [...map.entries()]
  }, [modulo])
  const moduloAtual = modulos.find((m) => m.id === modulo) || modulos[0]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div>
        <nav>{modulos.map((m) => { const Icon = m.icon; return <button key={m.id} className={modulo === m.id ? 'active' : ''} onClick={() => setModulo(m.id)}><Icon size={17} />{m.titulo}</button> })}</nav>
        <div className="sideBottom"><small>FASE 1</small><p>Estruturação do controle financeiro familiar.</p></div>
      </aside>

      <main className="content">
        <header className="top">
          <div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>{moduloAtual.titulo}</h1><p className="muted">{moduloAtual.descricao} · construído no mesmo raciocínio da sua planilha.</p></div>
          <div className="topActions"><div className="month controlMonth"><CalendarDays size={16} /><select value={mes} onChange={(e) => setMes(e.target.value as typeof mes)} aria-label="Mês de referência">{MESES_2026.map((m) => <option key={m}>{m}</option>)}</select></div></div>
        </header>

        <section className="cards controlCards">
          <article><div className="cardIcon income"><ArrowDownLeft size={19} /></div><div><span>Renda familiar</span><strong>—</strong><small>Receitas de Léo + Nat</small></div></article>
          <article><div className="cardIcon expense"><ArrowUpRight size={19} /></div><div><span>Despesas familiares</span><strong>—</strong><small>Sem individualização por pessoa</small></div></article>
          <article><div className="cardIcon balance"><CircleDollarSign size={19} /></div><div><span>Resultado familiar</span><strong>—</strong><small>Renda menos despesas oficiais</small></div></article>
        </section>

        <section className="grid controlGrid">
          <article className="panel"><div className="panelHead"><div><h2>Estrutura de controle</h2><p>{moduloAtual.titulo} · {mes}</p></div></div>
            {modulo === 'contas' && <div className="modulePlaceholder"><Wallet size={28} /><strong>Contas</strong><span>Saldo inicial, entradas, saídas e transferências entre contas.</span></div>}
            {modulo === 'investimentos' && <div className="modulePlaceholder"><PiggyBank size={28} /><strong>Investimentos</strong><span>Aportes, resgates e patrimônio separados das despesas de consumo.</span></div>}
            {grupos.length > 0 && <div className="controlRows">{grupos.map(([grupo, linhas]) => <div className="controlGroup" key={grupo}><h3>{grupo}</h3>{linhas.map((linha) => <div className="controlRow" key={linha.id}><div><strong>{linha.nome}</strong>{linha.responsavel && <span>{linha.responsavel}</span>}</div><b>—</b></div>)}</div>)}</div>}
          </article>

          <aside className="controlAside"><article className="panel"><div className="panelHead"><div><h2>Regras do aplicativo</h2><p>Critérios usados em todo o controle</p></div></div><ul className="ruleList">{REGRAS_APLICACAO.map((regra) => <li key={regra}>{regra}</li>)}</ul></article><article className="phaseCard"><strong>Construção em andamento</strong><p>Primeiro validamos estrutura e funcionamento. Os números reais entram somente na homologação.</p></article></aside>
        </section>
      </main>
    </div>
  )
}
