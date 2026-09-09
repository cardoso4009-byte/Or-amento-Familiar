'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign, FileSpreadsheet, Pencil, PiggyBank, Plus, Trash2, Wallet } from 'lucide-react'
import { ESTRUTURA_ORCAMENTO, MESES_2026, REGRAS_APLICACAO, type ResponsavelRenda, type TipoReceita } from '../../lib/modelo-orcamento'

const modulos = [
  { id: 'visao', titulo: 'Visão geral', descricao: 'Resumo mensal e anual', icon: BarChart3 },
  { id: 'receitas', titulo: 'Receitas', descricao: 'Léo, Nat e extraordinárias', icon: ArrowDownLeft },
  { id: 'despesas', titulo: 'Despesas', descricao: 'Gastos e compromissos familiares', icon: ArrowUpRight },
  { id: 'contas', titulo: 'Contas', descricao: 'Saldos e transferências', icon: Wallet },
  { id: 'investimentos', titulo: 'Investimentos', descricao: 'Patrimônio separado do consumo', icon: PiggyBank },
  { id: 'homologacao', titulo: 'Homologação', descricao: 'Aplicação × planilha', icon: FileSpreadsheet },
]

type Receita = { id: string; descricao: string; tipo: TipoReceita; responsavel: ResponsavelRenda; planejado: number; realizado: number }

const tiposReceita: TipoReceita[] = ['Salário', 'Férias', '13º Salário', 'Bônus', 'IR / Dissídio']

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

export default function ControlePage() {
  const [mes, setMes] = useState<(typeof MESES_2026)[number]>('Set/26')
  const [modulo, setModulo] = useState('visao')
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [modalReceita, setModalReceita] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Receita, 'id'>>({ descricao: '', tipo: 'Salário', responsavel: 'Léo', planejado: 0, realizado: 0 })

  const grupos = useMemo(() => {
    const grupoPorModulo: Record<string, string[]> = { visao: ['Receitas', 'Despesas Fixas', 'Bancos e Acordos', 'Despesas Diversas', 'Resultado'], receitas: ['Receitas'], despesas: ['Despesas Fixas', 'Bancos e Acordos', 'Despesas Diversas'], homologacao: ['Receitas', 'Despesas Fixas', 'Bancos e Acordos', 'Despesas Diversas', 'Resultado'] }
    const permitidos = grupoPorModulo[modulo]
    const map = new Map<string, typeof ESTRUTURA_ORCAMENTO>()
    ESTRUTURA_ORCAMENTO.forEach((linha) => { if (!permitidos?.includes(linha.grupo)) return; if (!map.has(linha.grupo)) map.set(linha.grupo, []); map.get(linha.grupo)!.push(linha) })
    return [...map.entries()]
  }, [modulo])

  const moduloAtual = modulos.find((m) => m.id === modulo) || modulos[0]
  const totaisReceita = useMemo(() => receitas.reduce((a, r) => ({ planejado: a.planejado + r.planejado, realizado: a.realizado + r.realizado }), { planejado: 0, realizado: 0 }), [receitas])
  const porPessoa = useMemo(() => ({ Léo: receitas.filter(r => r.responsavel === 'Léo').reduce((s, r) => s + r.realizado, 0), Nat: receitas.filter(r => r.responsavel === 'Nat').reduce((s, r) => s + r.realizado, 0) }), [receitas])

  function abrirNovaReceita() { setEditando(null); setForm({ descricao: '', tipo: 'Salário', responsavel: 'Léo', planejado: 0, realizado: 0 }); setModalReceita(true) }
  function editarReceita(r: Receita) { setEditando(r.id); setForm({ descricao: r.descricao, tipo: r.tipo, responsavel: r.responsavel, planejado: r.planejado, realizado: r.realizado }); setModalReceita(true) }
  function salvarReceita() { if (!form.descricao.trim()) return; if (editando) setReceitas(rs => rs.map(r => r.id === editando ? { ...form, id: editando } : r)); else setReceitas(rs => [...rs, { ...form, id: crypto.randomUUID() }]); setModalReceita(false) }
  function excluirReceita(id: string) { setReceitas(rs => rs.filter(r => r.id !== id)) }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div>
        <nav>{modulos.map((m) => { const Icon = m.icon; return <button key={m.id} className={modulo === m.id ? 'active' : ''} onClick={() => setModulo(m.id)}><Icon size={17} />{m.titulo}</button> })}</nav>
        <div className="sideBottom"><small>FASE 1</small><p>Estruturação do controle financeiro familiar.</p></div>
      </aside>

      <main className="content">
        <header className="top">
          <div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>{moduloAtual.titulo}</h1><p className="muted">{moduloAtual.descricao} · {mes}</p></div>
          <div className="topActions"><div className="month controlMonth"><CalendarDays size={16} /><select value={mes} onChange={(e) => setMes(e.target.value as typeof mes)} aria-label="Mês de referência">{MESES_2026.map((m) => <option key={m}>{m}</option>)}</select></div></div>
        </header>

        {modulo === 'receitas' ? (
          <>
            <section className="cards controlCards">
              <article><div className="cardIcon income"><ArrowDownLeft size={19} /></div><div><span>Renda Léo</span><strong>{moeda(porPessoa.Léo)}</strong><small>Receitas realizadas no mês</small></div></article>
              <article><div className="cardIcon income"><ArrowDownLeft size={19} /></div><div><span>Renda Nat</span><strong>{moeda(porPessoa.Nat)}</strong><small>Receitas realizadas no mês</small></div></article>
              <article><div className="cardIcon balance"><CircleDollarSign size={19} /></div><div><span>Renda familiar</span><strong>{moeda(totaisReceita.realizado)}</strong><small>Léo + Nat</small></div></article>
            </section>

            <section className="panel modulePanel">
              <div className="panelHead"><div><h2>Lançamentos de receitas</h2><p>Controle por responsável, tipo e situação.</p></div><button className="primary" onClick={abrirNovaReceita}><Plus size={16} />Nova receita</button></div>
              <div className="revenueSummary"><div><span>Planejado</span><strong>{moeda(totaisReceita.planejado)}</strong></div><div><span>Realizado</span><strong>{moeda(totaisReceita.realizado)}</strong></div><div><span>Diferença</span><strong>{moeda(totaisReceita.realizado - totaisReceita.planejado)}</strong></div></div>
              {receitas.length === 0 ? <div className="empty">Nenhuma receita cadastrada em {mes}.<br />Cadastre a primeira movimentação para começar o controle.</div> : <div className="tableWrap"><table><thead><tr><th>Descrição</th><th>Tipo</th><th>Responsável</th><th>Planejado</th><th>Realizado</th><th></th></tr></thead><tbody>{receitas.map(r => <tr key={r.id}><td><strong>{r.descricao}</strong></td><td>{r.tipo}</td><td><span className="personTag">{r.responsavel}</span></td><td>{moeda(r.planejado)}</td><td className="positive">{moeda(r.realizado)}</td><td><button className="iconBtn" onClick={() => editarReceita(r)} aria-label="Editar"><Pencil size={14} /></button><button className="iconBtn danger" onClick={() => excluirReceita(r.id)} aria-label="Excluir"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
            </section>

            <section className="grid moduleBottom"><article className="panel"><div className="panelHead"><div><h2>Estrutura de receitas</h2><p>Linhas que serão homologadas posteriormente.</p></div></div><div className="controlRows">{grupos.flatMap(([, linhas]) => linhas).map(linha => <div className="controlRow" key={linha.id}><div><strong>{linha.nome}</strong>{linha.responsavel && <span>{linha.responsavel}</span>}</div><b>—</b></div>)}</div></article><aside className="controlAside"><article className="panel"><div className="panelHead"><div><h2>Regra de renda</h2><p>Somente a renda é individualizada.</p></div></div><p className="moduleNote">As receitas podem ser atribuídas a Léo ou Nat. O total familiar consolida as duas rendas. As despesas continuam pertencendo à família.</p></article></aside></section>
          </>
        ) : (
          <>
            <section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19} /></div><div><span>Renda familiar</span><strong>—</strong><small>Receitas de Léo + Nat</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19} /></div><div><span>Despesas familiares</span><strong>—</strong><small>Sem individualização por pessoa</small></div></article><article><div className="cardIcon balance"><CircleDollarSign size={19} /></div><div><span>Resultado familiar</span><strong>—</strong><small>Renda menos despesas oficiais</small></div></article></section>
            <section className="grid controlGrid"><article className="panel"><div className="panelHead"><div><h2>Estrutura de controle</h2><p>{moduloAtual.titulo} · {mes}</p></div></div>{(modulo === 'contas' || modulo === 'investimentos') && <div className="modulePlaceholder">{modulo === 'contas' ? <Wallet size={28} /> : <PiggyBank size={28} />}<strong>{moduloAtual.titulo}</strong><span>{modulo === 'contas' ? 'Saldo inicial, entradas, saídas e transferências entre contas.' : 'Aportes, resgates e patrimônio separados das despesas de consumo.'}</span></div>}{grupos.length > 0 && <div className="controlRows">{grupos.map(([grupo, linhas]) => <div className="controlGroup" key={grupo}><h3>{grupo}</h3>{linhas.map(linha => <div className="controlRow" key={linha.id}><div><strong>{linha.nome}</strong>{linha.responsavel && <span>{linha.responsavel}</span>}</div><b>—</b></div>)}</div>)}</div>}</article><aside className="controlAside"><article className="panel"><div className="panelHead"><div><h2>Regras do aplicativo</h2><p>Critérios usados em todo o controle</p></div></div><ul className="ruleList">{REGRAS_APLICACAO.map(regra => <li key={regra}>{regra}</li>)}</ul></article><article className="phaseCard"><strong>Construção em andamento</strong><p>Primeiro validamos estrutura e funcionamento. Os números reais entram somente na homologação.</p></article></aside></section>
          </>
        )}
      </main>

      {modalReceita && <div className="overlay"><div className="modal"><div className="modalHead"><div><h2>{editando ? 'Editar receita' : 'Nova receita'}</h2><p>{mes} · receita familiar</p></div><button onClick={() => setModalReceita(false)}>×</button></div><label>Descrição<input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Salário" autoFocus /></label><div className="two"><label>Tipo<select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoReceita })}>{tiposReceita.map(t => <option key={t}>{t}</option>)}</select></label><label>Responsável<select value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value as ResponsavelRenda })}><option>Léo</option><option>Nat</option></select></label></div><div className="two"><label>Planejado<input type="number" min="0" step="0.01" value={form.planejado || ''} onChange={e => setForm({ ...form, planejado: Number(e.target.value) })} /></label><label>Realizado<input type="number" min="0" step="0.01" value={form.realizado || ''} onChange={e => setForm({ ...form, realizado: Number(e.target.value) })} /></label></div><button className="primary full" onClick={salvarReceita}>{editando ? 'Salvar alterações' : 'Adicionar receita'}</button></div></div>}
    </div>
  )
}
