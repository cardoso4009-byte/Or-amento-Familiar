'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BarChart3, CalendarDays, FileSpreadsheet, PiggyBank, Plus, Trash2, Wallet } from 'lucide-react'
import { MESES_2026 } from '../../lib/modelo-orcamento'

const nav=[{href:'/controle',label:'Controle',icon:BarChart3},{href:'/lancamentos',label:'Lançamentos',icon:ArrowDownLeft},{href:'/contas',label:'Contas',icon:Wallet},{href:'/investimentos',label:'Investimentos',icon:PiggyBank},{href:'/homologacao',label:'Homologação',icon:FileSpreadsheet}]
const contas=['Conta Corrente','Poupança','Investimentos'] as const
type Natureza='Receita'|'Despesa'|'Transferência'
type Responsavel='Léo'|'Nat'|''
type Lancamento={id:string;mes:string;conta:string;natureza:Natureza;categoria:string;descricao:string;valor:number;responsavel:Responsavel;contaDestino:string}

const moeda=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2})
const STORAGE='orcamento-familiar-lancamentos-2026'

function limparEntrada(raw:string){
  return raw.replace(/[^0-9,.-]/g,'')
}
function converterValor(raw:string){
  let texto=limparEntrada(raw).trim()
  if(!texto)return 0
  const ultimaVirgula=texto.lastIndexOf(',')
  const ultimoPonto=texto.lastIndexOf('.')
  if(ultimaVirgula>=0 && ultimaVirgula>ultimoPonto){
    texto=texto.replace(/\./g,'').replace(',','.')
  }else if(ultimoPonto>=0){
    const partes=texto.split('.')
    if(partes.length>2) texto=partes.slice(0,-1).join('')+'.'+partes.at(-1)
  }
  const n=Number(texto)
  return Number.isFinite(n)?Math.round(n*100)/100:0
}
function formatarEntrada(raw:string){
  const n=converterValor(raw)
  return n>0?moeda(n).replace(/^R\$\s?/,''):''
}

export default function LancamentosPage(){
  const [mes,setMes]=useState<(typeof MESES_2026)[number]>('Set/26')
  const [conta,setConta]=useState<string>('Conta Corrente')
  const [lancamentos,setLancamentos]=useState<Lancamento[]>(()=>{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{return []}})
  const [aberto,setAberto]=useState(false)
  const [natureza,setNatureza]=useState<Natureza>('Despesa')
  const [categoria,setCategoria]=useState('')
  const [descricao,setDescricao]=useState('')
  const [valor,setValor]=useState('')
  const [responsavel,setResponsavel]=useState<Responsavel>('')
  const [contaDestino,setContaDestino]=useState('')

  const doMes=lancamentos.filter(l=>l.mes===mes&&l.conta===conta)
  const entradas=useMemo(()=>doMes.filter(l=>l.natureza==='Receita').reduce((s,l)=>s+l.valor,0),[doMes])
  const saidas=useMemo(()=>doMes.filter(l=>l.natureza==='Despesa').reduce((s,l)=>s+l.valor,0),[doMes])
  const saldo=entradas-saidas

  function salvar(e:FormEvent){
    e.preventDefault()
    const n=converterValor(valor)
    if(!descricao.trim()||!Number.isFinite(n)||n<=0||(natureza==='Transferência'&&!contaDestino))return
    const novo:Lancamento={id:crypto.randomUUID(),mes,conta,natureza,categoria:categoria.trim()||'Sem categoria',descricao:descricao.trim(),valor:n,responsavel:natureza==='Receita'?responsavel:'',contaDestino:natureza==='Transferência'?contaDestino:''}
    const atual=[...lancamentos,novo]
    setLancamentos(atual)
    localStorage.setItem(STORAGE,JSON.stringify(atual))
    setDescricao('');setCategoria('');setValor('');setResponsavel('');setContaDestino('');setAberto(false)
  }

  function excluir(id:string){const atual=lancamentos.filter(l=>l.id!==id);setLancamentos(atual);localStorage.setItem(STORAGE,JSON.stringify(atual))}

  return <div className="app"><aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n=>{const Icon=n.icon;return <Link key={n.href} href={n.href} className={n.href==='/lancamentos'?'active':''}><Icon size={17}/>{n.label}</Link>})}</nav><div className="sideBottom"><small>LANÇAMENTOS</small><p>Registre as movimentações na conta em que aconteceram.</p></div></aside><main className="content"><header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Lançamentos</h1><p className="muted">Movimentações por conta · {mes}</p></div><div className="month controlMonth"><CalendarDays size={16}/><select value={mes} onChange={e=>setMes(e.target.value as typeof mes)}>{MESES_2026.map(m=><option key={m}>{m}</option>)}</select></div></header>

<section className="panel launchHeader"><div><h2>Conta de lançamento</h2><p>Escolha a conta onde o dinheiro entrou ou saiu.</p></div><div className="accountTabs">{contas.map(c=><button key={c} className={conta===c?'selected':''} onClick={()=>setConta(c)}><Wallet size={15}/>{c}</button>)}</div></section>
<section className="cards controlCards"><article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Entradas</span><strong>{moeda(entradas)}</strong><small>Na conta selecionada</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Saídas</span><strong>{moeda(saidas)}</strong><small>Despesas da família</small></div></article><article><div className="cardIcon balance"><Wallet size={19}/></div><div><span>Saldo movimentado</span><strong>{moeda(saldo)}</strong><small>{conta} · {doMes.length} lançamento(s)</small></div></article></section>

<section className="panel"><div className="panelHead"><div><h2>Movimentações de {conta}</h2><p>Receitas, despesas e transferências registradas nesta conta.</p></div><button className="primary" onClick={()=>setAberto(v=>!v)}><Plus size={16}/>{aberto?'Fechar':'Novo lançamento'}</button></div>
{aberto&&<form onSubmit={salvar} className="launchForm"><div><label>Natureza</label><select value={natureza} onChange={e=>setNatureza(e.target.value as Natureza)}><option>Despesa</option><option>Receita</option><option>Transferência</option></select></div><div><label>Categoria</label><input value={categoria} onChange={e=>setCategoria(e.target.value)} placeholder="Ex.: Escola, salário, mercado"/></div><div><label>Descrição</label><input value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Descrição do lançamento" required/></div><div><label>Valor</label><input value={valor} onChange={e=>setValor(limparEntrada(e.target.value))} onBlur={()=>setValor(v=>formatarEntrada(v))} placeholder="0,00" inputMode="decimal" maxLength={18} required/><small className="formHint">Digite no padrão brasileiro: 26.240,88</small></div>{natureza==='Receita'&&<div><label>Responsável pela renda</label><select value={responsavel} onChange={e=>setResponsavel(e.target.value as Responsavel)}><option value="">Selecionar</option><option>Léo</option><option>Nat</option></select></div>}{natureza==='Transferência'&&<div><label>Conta destino</label><select value={contaDestino} onChange={e=>setContaDestino(e.target.value)} required><option value="">Selecionar</option>{contas.filter(c=>c!==conta).map(c=><option key={c}>{c}</option>)}</select></div>}<div className="formActions"><button type="button" onClick={()=>setAberto(false)}>Cancelar</button><button type="submit" className="primary">Salvar lançamento</button></div></form>}
{doMes.length===0?<div className="empty">Nenhum lançamento em {mes}.<br/>Use <strong>Novo lançamento</strong> para registrar uma movimentação.</div>:<div className="launchList">{doMes.map(l=><div className="launchRow" key={l.id}><div className="launchNature">{l.natureza==='Receita'?<ArrowDownLeft size={15}/>:l.natureza==='Despesa'?<ArrowUpRight size={15}/>:<ArrowLeftRight size={15}/>}</div><div><strong>{l.descricao}</strong><small>{l.categoria}{l.responsavel?` · ${l.responsavel}`:''}{l.natureza==='Transferência'?` · → ${l.contaDestino}`:''}</small></div><b className={l.natureza==='Receita'?'positive':''}>{l.natureza==='Despesa'?'− ':l.natureza==='Receita'?'+ ':''}{moeda(l.valor)}</b><button className="iconButton" title="Excluir" onClick={()=>excluir(l.id)}><Trash2 size={15}/></button></div>)}</div>}</section>

<section className="grid moduleBottom"><article className="panel"><div className="panelHead"><div><h2>Regra do lançamento</h2><p>Conta e natureza são informações diferentes.</p></div></div><p className="moduleNote">A conta identifica onde ocorreu a movimentação. A natureza identifica se é receita, despesa ou transferência. Transferências entre contas não entram no resultado familiar. Despesas permanecem da família; somente a renda pode ter responsável.</p></article><article className="panel"><div className="panelHead"><div><h2>Integração</h2><p>Base local preparada para alimentar o Controle.</p></div></div><p className="moduleNote">Os lançamentos ficam salvos neste navegador. A próxima integração fará a consolidação por mês e categoria sem individualizar as despesas por pessoa.</p></article></section></main></div>
}
