'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, LayoutDashboard, Pencil, Plus, Receipt, Trash2, Wallet, X } from 'lucide-react'

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
  const [items,setItems] = useState<Transaction[]>(initial)
  const [modal,setModal] = useState(false)
  const [editing,setEditing] = useState<Transaction|null>(null)
  const [type,setType] = useState<'in'|'out'>('out')
  const [title,setTitle] = useState('')
  const [category,setCategory] = useState('')
  const [value,setValue] = useState('')
  const [date,setDate] = useState('2026-09-09')
  const [filter,setFilter] = useState<'all'|'in'|'out'>('all')
  const [search,setSearch] = useState('')
  const [month,setMonth] = useState('2026-09')

  useEffect(()=>{ try { const saved=localStorage.getItem('orcamento-familiar-transactions'); if(saved) setItems(JSON.parse(saved)) } catch {} },[])
  useEffect(()=>{ try { localStorage.setItem('orcamento-familiar-transactions',JSON.stringify(items)) } catch {} },[items])

  const monthItems=useMemo(()=>items.filter(i=>i.date.startsWith(month)),[items,month])
  const totals=useMemo(()=>{
    const inTotal=monthItems.filter(i=>i.type==='in').reduce((s,i)=>s+i.value,0)
    const outTotal=monthItems.filter(i=>i.type==='out').reduce((s,i)=>s+i.value,0)
    return {inTotal,outTotal,balance:inTotal-outTotal}
  },[monthItems])

  const visibleItems=useMemo(()=>monthItems.filter(i=>{
    const matchesType=filter==='all'||i.type===filter
    const q=search.trim().toLowerCase()
    return matchesType&&(!q||`${i.title} ${i.category}`.toLowerCase().includes(q))
  }).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id),[monthItems,filter,search])

  const biggestCategory=useMemo(()=>{
    const map:Record<string,number>={}
    monthItems.filter(i=>i.type==='out').forEach(i=>{map[i.category]=(map[i.category]||0)+i.value})
    return Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'
  },[monthItems])

  const chart=useMemo(()=>{
    const [y,m]=month.split('-').map(Number), days=new Date(y,m,0).getDate()
    let balance=0
    const points:number[]=[]
    for(let d=1;d<=days;d++){
      const key=`${month}-${String(d).padStart(2,'0')}`
      monthItems.filter(i=>i.date===key).forEach(i=>{balance+=i.type==='in'?i.value:-i.value})
      points.push(balance)
    }
    const max=Math.max(...points.map(Math.abs),1)
    const min=Math.min(...points,0), range=Math.max(...points)-min||1
    const coords=points.map((v,i)=>`${(i/(days-1))*100},${8+((Math.max(...points)-v)/range)*82}`).join(' ')
    return {days,points,coords,min,max,balance:points.at(-1)||0}
  },[month,monthItems])

  const monthLabel=new Date(`${month}-01T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
  const changeMonth=(delta:number)=>{ const d=new Date(`${month}-01T12:00:00`); d.setMonth(d.getMonth()+delta); setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`) }

  function resetForm(){setTitle('');setCategory('');setValue('');setDate(`${month}-09`);setType('out');setEditing(null);setModal(false)}
  function openNew(){resetForm();setModal(true)}
  function openEdit(item:Transaction){setEditing(item);setType(item.type);setTitle(item.title);setCategory(item.category);setValue(String(item.value).replace('.',','));setDate(item.date);setModal(true)}
  function addOrUpdate(e:React.FormEvent){
    e.preventDefault(); const numeric=Number(value.replace(/\./g,'').replace(',','.'))
    if(!title.trim()||!Number.isFinite(numeric)||numeric<=0||!date) return
    if(editing) setItems(v=>v.map(i=>i.id===editing.id?{...i,type,title:title.trim(),category:category.trim()||'Outros',date,value:numeric}:i))
    else setItems(v=>[...v,{id:Date.now(),type,title:title.trim(),category:category.trim()||'Outros',date,value:numeric}])
    resetForm()
  }
  function removeItem(id:number){if(window.confirm('Excluir este lançamento?')) setItems(v=>v.filter(i=>i.id!==id))}

  return <main className="app">
    <aside className="sidebar"><div className="brand"><div className="brandMark">$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav><button className="active"><LayoutDashboard size={18}/> Dashboard</button><button><Receipt size={18}/> Lançamentos</button><button><Wallet size={18}/> Contas</button><button><CalendarDays size={18}/> Fluxo de caixa</button></nav><div className="sideBottom"><small>CONTROLE FINANCEIRO</small><p>Uma visão simples do seu dinheiro.</p></div></aside>

    <section className="content">
      <header className="top"><div><p className="eyebrow">VISÃO GERAL</p><h1>Olá, Léo 👋</h1><p className="muted">Aqui está o resumo das suas finanças.</p></div><button className="primary" onClick={openNew}><Plus size={18}/> Novo lançamento</button></header>
      <div className="month"><button onClick={()=>changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={17}/></button><strong>{monthLabel}</strong><button onClick={()=>changeMonth(1)} aria-label="Próximo mês"><ChevronRight size={17}/></button></div>

      <div className="cards"><article><div className="cardIcon income"><ArrowDownLeft size={19}/></div><div><span>Proventos</span><strong>{money(totals.inTotal)}</strong><small>Entradas no mês</small></div></article><article><div className="cardIcon expense"><ArrowUpRight size={19}/></div><div><span>Despesas</span><strong>{money(totals.outTotal)}</strong><small>Saídas no mês</small></div></article><article><div className="cardIcon balance"><CircleDollarSign size={19}/></div><div><span>Saldo do mês</span><strong>{money(totals.balance)}</strong><small>Saldo acumulado</small></div></article></div>

      <div className="grid"><section className="panel chartPanel"><div className="panelHead"><div><h2>Fluxo de caixa</h2><p>Saldo acumulado por dia</p></div><span className="legend"><i/> Saldo</span></div><div className="chart"><div className="line l1"/><div className="line l2"/><div className="line l3"/><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chartSvg"><polyline points={chart.coords} fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke"/></svg><div className="axis"><span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>{chart.days}</span></div></div><div className="chartFoot"><span>Saldo inicial: R$ 0,00</span><strong>Saldo final: {money(chart.balance)}</strong></div></section>
        <section className="panel"><div className="panelHead"><div><h2>Resumo</h2><p>Distribuição do mês</p></div></div><div className="summary"><div><span>Comprometido</span><strong>{totals.inTotal?Math.round(totals.outTotal/totals.inTotal*100):0}%</strong></div><div className="progress"><b style={{width:`${totals.inTotal?Math.min(100,totals.outTotal/totals.inTotal*100):0}%`}}/></div><div className="summaryRow"><span>Restante</span><strong>{money(totals.balance)}</strong></div><div className="summaryRow"><span>Maior categoria</span><strong>{biggestCategory}</strong></div><div className="summaryRow"><span>Movimentações</span><strong>{monthItems.length}</strong></div></div></section></div>

      <section className="panel transactions"><div className="panelHead"><div><h2>Lançamentos</h2><p>Cadastre, edite, exclua e filtre suas movimentações.</p></div><span className="count">{visibleItems.length} itens</span></div><div className="filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar lançamento..." aria-label="Buscar lançamento"/><div className="filterBtns"><button className={filter==='all'?'chosen':''} onClick={()=>setFilter('all')}>Todos</button><button className={filter==='in'?'chosen':''} onClick={()=>setFilter('in')}>Proventos</button><button className={filter==='out'?'chosen':''} onClick={()=>setFilter('out')}>Despesas</button></div></div>{visibleItems.length===0?<div className="empty">Nenhum lançamento encontrado neste mês.</div>:visibleItems.slice(0,10).map(i=><div className="transaction" key={i.id}><div className={`txIcon ${i.type}`}>{i.type==='in'?<ArrowDownLeft size={17}/>:<ArrowUpRight size={17}/>}</div><div className="txName"><strong>{i.title}</strong><span>{i.category} · {dateBR(i.date)}</span></div><strong className={i.type==='in'?'valueIn':'valueOut'}>{i.type==='in'?'+':'-'} {money(i.value)}</strong><button className="iconBtn" aria-label={`Editar ${i.title}`} onClick={()=>openEdit(i)}><Pencil size={15}/></button><button className="iconBtn danger" aria-label={`Excluir ${i.title}`} onClick={()=>removeItem(i.id)}><Trash2 size={15}/></button></div>)}</section>
    </section>

    {modal&&<div className="overlay"><form className="modal" onSubmit={addOrUpdate}><div className="modalHead"><div><h2>{editing?'Editar lançamento':'Novo lançamento'}</h2><p>Registre uma entrada ou saída.</p></div><button type="button" onClick={resetForm} aria-label="Fechar"><X/></button></div><div className="typeSwitch"><button type="button" className={type==='out'?'selectedOut':''} onClick={()=>setType('out')}>Despesa</button><button type="button" className={type==='in'?'selectedIn':''} onClick={()=>setType('in')}>Provento</button></div><label>Descrição<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Mercado"/></label><label>Categoria<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Ex.: Alimentação"/></label><div className="two"><label>Valor<input required value={value} onChange={e=>setValue(e.target.value)} inputMode="decimal" placeholder="R$ 0,00"/></label><label>Data<input required value={date} onChange={e=>setDate(e.target.value)} type="date"/></label></div><button className="primary full">{editing?'Salvar alterações':'Salvar lançamento'}</button></form></div>}
  </main>
}
