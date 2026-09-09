'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, LayoutDashboard, Plus, Receipt, Wallet, X } from 'lucide-react'

type Transaction = { id:number; type:'in'|'out'; title:string; category:string; date:string; value:number }

const initial: Transaction[] = [
  { id:1, type:'in', title:'Salário', category:'Salário', date:'2026-09-05', value:8500 },
  { id:2, type:'in', title:'Rendimento', category:'Investimentos', date:'2026-09-08', value:420 },
  { id:3, type:'out', title:'Supermercado', category:'Alimentação', date:'2026-09-06', value:680 },
  { id:4, type:'out', title:'Escola', category:'Educação', date:'2026-09-07', value:950 },
  { id:5, type:'out', title:'Combustível', category:'Transporte', date:'2026-09-08', value:320 },
]

const money = (n:number) => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const dateBR = (d:string) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})

export default function Home() {
  const [items,setItems] = useState(initial)
  const [modal,setModal] = useState(false)
  const [type,setType] = useState<'in'|'out'>('out')
  const [title,setTitle] = useState('')
  const [category,setCategory] = useState('')
  const [value,setValue] = useState('')
  const [date,setDate] = useState('2026-09-09')

  const totals = useMemo(()=>{
    const inTotal=items.filter(i=>i.type==='in').reduce((s,i)=>s+i.value,0)
    const outTotal=items.filter(i=>i.type==='out').reduce((s,i)=>s+i.value,0)
    return {inTotal,outTotal,balance:inTotal-outTotal}
  },[items])

  function addTransaction(e:React.FormEvent){
    e.preventDefault()
    const numeric=Number(value.replace(',','.'))
    if(!title || !numeric) return
    setItems(v=>[...v,{id:Date.now(),type,title,category:category||'Outros',date,value:numeric}])
    setTitle('');setCategory('');setValue('');setModal(false)
  }

  return <main className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div>
      <nav><button className="active"><LayoutDashboard size={18}/> Dashboard</button><button><Receipt size={18}/> Lançamentos</button><button><Wallet size={18}/> Contas</button><button><CalendarDays size={18}/> Fluxo de caixa</button></nav>
      <div className="sideBottom"><small>CONTROLE FINANCEIRO</small><p>Uma visão simples do seu dinheiro.</p></div>
    </aside>

    <section className="content">
      <header className="top"><div><p className="eyebrow">VISÃO GERAL</p><h1>Olá, Léo 👋</h1><p className="muted">Aqui está o resumo das suas finanças.</p></div><button className="primary" onClick={()=>setModal(true)}><Plus size={18}/> Novo lançamento</button></header>

      <div className="month"><button><ChevronLeft size={17}/></button><strong>Setembro 2026</strong><button><ChevronRight size={17}/></button></div>

      <div className="cards">
        <article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Proventos</span><strong>{money(totals.inTotal)}</strong><small>Entradas no mês</small></div></article>
        <article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Despesas</span><strong>{money(totals.outTotal)}</strong><small>Saídas no mês</small></div></article>
        <article><div className="cardIcon balance"><CircleDollarSign size={19}/></div><div><span>Saldo do mês</span><strong>{money(totals.balance)}</strong><small>Disponível até agora</small></div></article>
      </div>

      <div className="grid">
        <section className="panel chartPanel"><div className="panelHead"><div><h2>Fluxo de caixa</h2><p>Entradas e saídas acumuladas</p></div><span className="legend"><i/> Saldo</span></div><div className="chart"><div className="line l1"/><div className="line l2"/><div className="line l3"/><div className="area"/><div className="axis"><span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span></div></div></section>
        <section className="panel"><div className="panelHead"><div><h2>Resumo</h2><p>Distribuição do mês</p></div></div><div className="summary"><div><span>Comprometido</span><strong>{Math.round(totals.outTotal/totals.inTotal*100)}%</strong></div><div className="progress"><b style={{width:`${Math.min(100,totals.outTotal/totals.inTotal*100)}%`}}/></div><div className="summaryRow"><span>Restante</span><strong>{money(totals.balance)}</strong></div><div className="summaryRow"><span>Maior categoria</span><strong>Educação</strong></div></div></section>
      </div>

      <section className="panel transactions"><div className="panelHead"><div><h2>Últimos lançamentos</h2><p>Movimentações recentes</p></div><button className="linkBtn">Ver todos</button></div>{items.slice().reverse().slice(0,6).map(i=><div className="transaction" key={i.id}><div className={`txIcon ${i.type}`}>{i.type==='in'?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</div><div className="txName"><strong>{i.title}</strong><span>{i.category} · {dateBR(i.date)}</span></div><strong className={i.type==='in'?'valueIn':'valueOut'}>{i.type==='in'?'+':'-'} {money(i.value)}</strong></div>)}</section>
    </section>

    {modal && <div className="overlay"><form className="modal" onSubmit={addTransaction}><div className="modalHead"><div><h2>Novo lançamento</h2><p>Registre uma entrada ou saída.</p></div><button type="button" onClick={()=>setModal(false)}><X/></button></div><div className="typeSwitch"><button type="button" className={type==='out'?'selectedOut':''} onClick={()=>setType('out')}>Despesa</button><button type="button" className={type==='in'?'selectedIn':''} onClick={()=>setType('in')}>Provento</button></div><label>Descrição<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Mercado"/></label><label>Categoria<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Ex.: Alimentação"/></label><div className="two"><label>Valor<input value={value} onChange={e=>setValue(e.target.value)} inputMode="decimal" placeholder="R$ 0,00"/></label><label>Data<input value={date} onChange={e=>setDate(e.target.value)} type="date"/></label></div><button className="primary full">Salvar lançamento</button></form></div>}
  </main>
}
