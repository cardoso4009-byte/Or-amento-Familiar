'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, BarChart3, FileSpreadsheet, Lightbulb, Pencil, Percent, PiggyBank, Save, TrendingDown, TrendingUp, Upload, Users, Wallet, X } from 'lucide-react'
import * as XLSX from 'xlsx'
import { MESES_2026 } from '../../lib/modelo-orcamento'

const meses = [...MESES_2026]
const STORAGE_KEY = 'orcamento-familiar-homologacao-2026'
type Dados = Record<string, number[]>
const moeda = (v:number) => v === 0 ? '—' : v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2})
const pct = (v:number) => `${v.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}%`
const nav=[{href:'/controle',label:'Dashboard',icon:BarChart3},{href:'/lancamentos',label:'Lançamentos',icon:ArrowDownLeft},{href:'/contas',label:'Contas',icon:Wallet},{href:'/investimentos',label:'Investimentos',icon:PiggyBank},{href:'/homologacao',label:'Homologação',icon:FileSpreadsheet}]

function normalizarTexto(raw:unknown){return String(raw??'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/º/g,'o').replace(/\\s+/g,' ').trim().toLowerCase()}
function normalizarValor(raw:unknown){if(typeof raw==='number')return Number.isFinite(raw)?raw:0;let t=String(raw??'').trim().replace(/R\\$\\s?/gi,'');if(!t)return 0;if(t.includes(','))t=t.replace(/\\./g,'').replace(',','.');const n=Number(t);return Number.isFinite(n)?n:0}
function chaveMes(v:unknown){if(v instanceof Date&&!Number.isNaN(v.getTime()))return normalizarTexto(meses[v.getMonth()]?.replace('/26','/'+String(v.getFullYear()).slice(-2))||'');if(v&&typeof v==='object'&&'getTime' in (v as object)){const d=new Date((v as Date).getTime());return normalizarTexto(meses[d.getMonth()]?.replace('/26','/'+String(d.getFullYear()).slice(-2))||'')}return normalizarTexto(v)}
function localizarCabecalho(rows:unknown[][]){let melhor=-1,maior=0;rows.slice(0,30).forEach((row,ri)=>{const encontrados=(row||[]).map(v=>chaveMes(v));const qtd=meses.filter(m=>encontrados.includes(normalizarTexto(m))).length;if(qtd>maior){maior=qtd;melhor=ri}});return melhor}
function parseRows(rows:unknown[][]):Dados{
 const r:Dados={};
 const headerRow=localizarCabecalho(rows);
 if(headerRow<0)throw new Error('Não encontrei a linha de meses Jan/26 a Dez/26');
 const header=rows[headerRow]||[];
 const idx=meses.map(m=>header.findIndex(v=>chaveMes(v)===normalizarTexto(m)));
 if(idx.some(i=>i<0))throw new Error('Não encontrei todos os meses Jan/26 a Dez/26');
 const aliases:Record<string,string>={
  'salarios':'Salários','ferias':'Férias','13o salario':'13º Salário','13 salario':'13º Salário',
  'bonus':'Bônus','ir / dissidio':'IR / Dissídio','ir/dissidio':'IR / Dissídio',
  'salarios e recebiveis':'Salários e recebíveis','renda familiar':'Renda Familiar',
  'despesas totais':'Despesas Totais','despesas totais >>>':'Despesas Totais',
  'despesas fixas':'Despesas Fixas','bancos e acordos':'Bancos e Acordos',
  'despesas diversas':'Despesas Diversas','ajuste':'Ajuste Despesas Totais',
  'ajuste despesas totais':'Ajuste Despesas Totais',
  'fluxo de caixa':'Fluxo de Caixa Planilha','fluxo de caixa >>>':'Fluxo de Caixa Planilha',
  'fluxo de caixa do periodo':'Fluxo de Caixa do Período Planilha',
  'fluxo de caixa do periodo >>>':'Fluxo de Caixa do Período Planilha'
 };
 const conhecidos=new Set(Object.keys(aliases));
 (rows.slice(headerRow+1)).forEach(row=>{
  const candidatos=(row||[]).slice(0,Math.max(6,idx[0]+1)).map(v=>String(v??'').trim()).filter(Boolean);
  if(!candidatos.length)return;
  let original=candidatos.find(v=>conhecidos.has(normalizarTexto(v)));
  if(!original){
   const texto=candidatos.find(v=>/[A-Za-zÀ-ÿ]/.test(v)&&!/^\d+(?:[.,]\d+)?$/.test(v));
   original=texto||'';
  }
  if(!original)return;
  const key=aliases[normalizarTexto(original)]||original;
  const vals=idx.map(i=>normalizarValor(row?.[i]));
  r[key]=vals;
 });
 const sec=(label:string)=>r[label]||[];
 if(!r['Bancos e Acordos']&&r['Despesas Totais']&&r['Despesas Fixas'])
  r['Bancos e Acordos']=meses.map((_,i)=>Math.max(0,(r['Despesas Totais']?.[i]||0)-(r['Despesas Fixas']?.[i]||0)));
 if(!r['Despesas Fixas']&&(r['Despesas com a casa']||r['Despesas com a Laura']))
  r['Despesas Fixas']=meses.map((_,i)=>(sec('Despesas com a casa')[i]||0)+(sec('Despesas com a Laura')[i]||0));
 if(!r['Ajuste Despesas Totais'])r['Ajuste Despesas Totais']=meses.map(()=>0);
 return r
}
function parseCsv(text:string){const rows=text.replace(/^\\uFEFF/,'').trim().split(/\\r?\\n/).map(line=>{const d=line.includes(';')?';':',';return line.split(d).map(v=>v.trim().replace(/^\\\"|\\\"$/g,''))});return parseRows(rows)}
async function parseArquivo(file:File){const ext=file.name.toLowerCase().split('.').pop();if(ext==='xlsx'||ext==='xls'){const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});const nomeAba=wb.SheetNames.find(n=>normalizarTexto(n)==='orcamento familiar')||wb.SheetNames[0];const sheet=wb.Sheets[nomeAba];if(!sheet)throw new Error('Planilha sem aba válida');return parseRows(XLSX.utils.sheet_to_json(sheet,{header:1,defval:''}) as unknown[][])}if(ext==='csv')return parseCsv(await file.text());throw new Error('Formato não suportado')}
function Donut({values,total,labels}:{values:number[];total:number;labels:string[]}){const safe=values.map(v=>Math.max(0,v)),sum=safe.reduce((a,b)=>a+b,0)||1;let start=0;const colors=['#0f766e','#2b6f85','#65a9ad','#8a9aa0','#d5a14a'];const parts=safe.map((v,i)=>{const end=start+v/sum*100,p={label:labels[i],value:v,start,end,color:colors[i%colors.length]};start=end;return p});const gradient=parts.map(p=>`${p.color} ${p.start}% ${p.end}%`).join(',');return <div className="donutWrap"><div className="donut" style={{background:`conic-gradient(${gradient})`}}><div className="donutHole"><strong>{moeda(total)}</strong><span>Total</span></div></div><div className="donutLegend">{parts.map(p=><div key={p.label}><span><i style={{background:p.color}}/>{p.label}</span><b>{(p.value/sum*100).toFixed(0)}%</b></div>)}</div></div>}
function Line({values,suffix='' }:{values:number[];suffix?:string}){const series=meses.map((_,i)=>Number(values[i]??0));const w=640,h=180,p=22,max=Math.max(...series,1),min=Math.min(...series,0),range=Math.max(max-min,1),x=(i:number)=>p+i*(w-p*2)/Math.max(meses.length-1,1),y=(v:number)=>h-p-(v-min)/range*(h-p*2),points=series.map((v,i)=>`${x(i)},${y(v)}`).join(' ');return <div className="lineChartWrap"><svg viewBox={`0 0 ${w} ${h}`} className="lineChart"><line x1={p} y1={y(0)} x2={w-p} y2={y(0)} className="axis"/><polyline points={`${p},${h-p} ${points} ${w-p},${h-p}`} className="areaLine"/><polyline points={points} className="mainLine"/>{series.map((v,i)=><circle key={meses[i]} cx={x(i)} cy={y(v)} r="3.5" className="linePoint"><title>{meses[i]}: {v.toLocaleString('pt-BR',{maximumFractionDigits:2})}{suffix}</title></circle>)}</svg><div className="lineLabels">{meses.map(m=><span key={m}>{m.split('/')[0]}</span>)}</div></div>}
function MonthlyFlow({values}:{values:number[]}){const max=Math.max(...values.map(Math.abs),1);return <div style={{padding:'8px 15px 17px'}}><div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:5,height:180,alignItems:'center'}}>{values.map((v,i)=><div key={meses[i]} style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5}}><div style={{height:145,width:'100%',position:'relative',background:'linear-gradient(to bottom,transparent 49.5%,#ccd7de 49.5%,#ccd7de 50.5%,transparent 50.5%)'}}><i style={{position:'absolute',left:'20%',right:'20%',height:`${Math.max(3,Math.abs(v)/max*45)}%`,bottom:v>=0?'50%':undefined,top:v<0?'50%':undefined,borderRadius:'3px',background:v>=0?'#4eaf88':'#e7777a'}}/></div><span style={{fontSize:9,color:'#738595'}}>{meses[i].split('/')[0]}</span></div>)}</div><div className="chartLegend"><span><i style={{background:'#4eaf88'}}/>Resultado positivo</span><span><i style={{background:'#e7777a'}}/>Resultado negativo</span></div></div>}
function Triple({receita,despesas,saldo}:{receita:number[];despesas:number[];saldo:number[]}){const max=Math.max(...receita,...despesas,...saldo.map(Math.abs),1),w=720,h=210,l=25,r=12,t=12,b=28,x=(i:number)=>l+i*(w-l-r)/11,y=(v:number)=>t+(max-v)/(max*2)*(h-t-b),zero=y(0),points=saldo.map((v,i)=>`${x(i)},${y(v)}`).join(' ');return <div style={{padding:'0 15px 15px'}}><svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',height:205}}><line x1={l} y1={zero} x2={w-r} y2={zero} className="axis"/>{meses.map((m,i)=>{const bw=12,rh=receita[i]/max*(h-t-b)/2,dh=despesas[i]/max*(h-t-b)/2;return <g key={m}><rect x={x(i)-bw-2} y={zero-rh} width={bw} height={rh} rx="2" fill="#55b990"/><rect x={x(i)+2} y={zero-dh} width={bw} height={dh} rx="2" fill="#e97a7d"/></g>})}<polyline points={points} fill="none" stroke="#1d5688" strokeWidth="2.5"/>{saldo.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke="#1d5688" strokeWidth="2"><title>{meses[i]}: {moeda(v)}</title></circle>)}</svg><div className="lineLabels">{meses.map(m=><span key={m}>{m.split('/')[0]}</span>)}</div><div className="chartLegend"><span><i className="legendIncome"/>Receita</span><span><i className="legendExpense"/>Despesas</span><span><i style={{background:'#1d5688',borderRadius:'50%'}}/>Saldo do período</span></div></div>}

export default function ControlePage(){
 const [dados,setDados]=useState<Dados>({});const [importado,setImportado]=useState(false);const [editando,setEditando]=useState<string|null>(null);const [rascunho,setRascunho]=useState<number[]>([]);const inputRef=useRef<HTMLInputElement>(null)
 useEffect(()=>{try{const s=localStorage.getItem(STORAGE_KEY);if(s){setDados(JSON.parse(s));setImportado(true)}}catch{}})
 async function importar(file?:File){
 if(!file)return;
 try{
  const parsed=await parseArquivo(file);
  const linhasObrigatorias=['Salários','Férias','13º Salário','Bônus','IR / Dissídio','Despesas Fixas','Bancos e Acordos'];
  const encontrouDados=linhasObrigatorias.some(k=>(parsed[k]||[]).some(v=>Number(v)!==0));
  const mesesReconhecidos=meses.every((m,i)=>Object.values(parsed).some(vals=>Array.isArray(vals)&&typeof vals[i]==='number'));
  if(!Object.keys(parsed).length||!encontrouDados||!mesesReconhecidos)throw new Error('estrutura');
  setDados(parsed);
  setImportado(true);
  setEditando(null);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(parsed));
  alert('Base importada com sucesso. Os indicadores foram atualizados.');
 }catch{
  alert('Não foi possível importar os dados da planilha. Verifique se o arquivo contém a aba Orçamento Familiar com Jan/26 até Dez/26.');
 }finally{
  if(inputRef.current)inputRef.current.value=''
 }
}
 const valor=(linha:string,i:number)=>Number(dados[linha]?.[i]||0)
 const receitaRows=[{label:'Salários',key:'Salários'},{label:'Férias',key:'Férias'},{label:'13º Salário',key:'13º Salário'},{label:'Bônus',key:'Bônus'},{label:'IR / Dissídio',key:'IR / Dissídio'}]
 const despesaRows=[{label:'Despesas Fixas',key:'Despesas Fixas'},{label:'Bancos e Acordos',key:'Bancos e Acordos'},{label:'Ajuste',key:'Ajuste Despesas Totais'}]
 const receitaMensal=meses.map((_,i)=>receitaRows.reduce((s,r)=>s+valor(r.key,i),0));const despesasMensal=meses.map((_,i)=>despesaRows.reduce((s,r)=>s+valor(r.key,i),0));const fluxoPeriodo=meses.map((_,i)=>receitaMensal[i]-despesasMensal[i]);const fluxoAcumulado=fluxoPeriodo.reduce<number[]>((a,v)=>{a.push((a[a.length-1]||0)+v);return a},[]);const compromisso=meses.map((_,i)=>receitaMensal[i]>0?despesasMensal[i]/receitaMensal[i]*100:0)
 const anual=useMemo(()=>({renda:receitaMensal.reduce((s,v)=>s+v,0),despesas:despesasMensal.reduce((s,v)=>s+v,0),periodo:fluxoPeriodo.reduce((s,v)=>s+v,0),fluxo:fluxoAcumulado.at(-1)||0}),[dados]);const compromissoMedio=anual.renda?anual.despesas/anual.renda*100:0
 const melhor=fluxoPeriodo.reduce((a,v,i)=>v>a.v?{v,i}:a,{v:-Infinity,i:0});const pior=fluxoPeriodo.reduce((a,v,i)=>v<a.v?{v,i}:a,{v:Infinity,i:0});const pico=compromisso.reduce((a,v,i)=>v>a.v?{v,i}:a,{v:-Infinity,i:0});const primeiro=fluxoPeriodo.slice(0,6).reduce((s,v)=>s+v,0),segundo=fluxoPeriodo.slice(6).reduce((s,v)=>s+v,0)
 const maiorReceita=receitaMensal.reduce((a,v,i)=>v>a.v?{v,i}:a,{v:-Infinity,i:0});const maiorDespesa=despesasMensal.reduce((a,v,i)=>v>a.v?{v,i}:a,{v:-Infinity,i:0})
 const receitaComp=receitaRows.map(r=>receitaMensal.reduce((s,_,i)=>s+valor(r.key,i),0));const despesaComp=despesaRows.map(r=>despesasMensal.reduce((s,_,i)=>s+valor(r.key,i),0))
 function iniciar(key:string){setEditando(key);setRascunho(meses.map((_,i)=>valor(key,i)))}function alterar(i:number,raw:string){setRascunho(p=>{const n=[...p];n[i]=normalizarValor(raw);return n})}function salvar(){if(!editando)return;const next={...dados,[editando]:rascunho.map(v=>Math.round(v*100)/100)};setDados(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setEditando(null);setRascunho([])}function cancelar(){setEditando(null);setRascunho([])}
 function cells(key:string){return meses.map((m,i)=><td key={m} className="monthlyCell">{editando===key?<input aria-label={`${key} ${m}`} type="number" step="0.01" value={rascunho[i]??0} onChange={e=>alterar(i,e.target.value)}/>:moeda(valor(key,i))}</td>)}function action(key:string,label:string){return <td className="actionCell">{editando===key?<div className="actionButtons"><button className="saveButton" onClick={salvar} title="Salvar"><Save size={13}/></button><button className="cancelButton" onClick={cancelar} title="Cancelar"><X size={13}/></button></div>:<button className="editButton" onClick={()=>iniciar(key)} title={`Editar ${label}`}><Pencil size={13}/>Editar</button>}</td>}
 const detail=(r:{label:string;key:string})=><tr key={r.key}><td className="detailLabel"><span>{r.label}</span></td>{cells(r.key)}{action(r.key,r.label)}</tr>
 return <div className="app"><aside className="sidebar"><div className="brand"><div className="brandMark">R$</div><div><strong>Orçamento</strong><span>Familiar</span></div></div><nav>{nav.map(n=>{const I=n.icon;return <Link key={n.href} href={n.href} className={n.href==='/controle'?'active':''}><I size={17}/>{n.label}</Link>})}</nav><div className="sideBottom"><small>VISÃO EXECUTIVA</small><p>Indicadores financeiros da família em uma visão simples e objetiva.</p></div></aside><main className="content">
 <header className="top"><div><p className="eyebrow">ORÇAMENTO FAMILIAR</p><h1>Dashboard financeiro</h1><p className="muted">Visão sintética da situação financeira · 2026</p></div><div className="topActions"><button className="statusPill" onClick={()=>inputRef.current?.click()}><Upload size={14}/>{importado?'Atualizar base':'Carregar base'}</button><input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e=>importar(e.target.files?.[0])}/></div></header>
 {!importado&&<section className="panel" style={{marginBottom:18}}><div className="panelHead"><div><h2>Base financeira ainda não carregada</h2><p>Importe sua base para visualizar os indicadores. Os dados ficam somente neste navegador.</p></div><button className="primary" onClick={()=>inputRef.current?.click()}><Upload size={16}/>Importar Excel/CSV</button></div></section>}
 <section className="cards controlCards" style={{gridTemplateColumns:'repeat(5,minmax(0,1fr))'}}><article><div className="cardIcon income"><Users size={19}/></div><div><span>Receita Familiar</span><strong>{moeda(anual.renda)}</strong><small>Salários e recebíveis · 2026</small></div></article><article><div className="cardIcon expense"><Wallet size={19}/></div><div><span>Despesas Totais</span><strong>{moeda(anual.despesas)}</strong><small>Fixas + Bancos + Ajuste</small></div></article><article><div className="cardIcon balance"><BarChart3 size={19}/></div><div><span>Fluxo do Período</span><strong>{moeda(anual.periodo)}</strong><small>Soma dos resultados mensais</small></div></article><article><div className="cardIcon balance"><TrendingUp size={19}/></div><div><span>Fluxo de Caixa</span><strong>{moeda(anual.fluxo)}</strong><small>Saldo acumulado até Dez/26</small></div></article><article><div className="cardIcon"><Percent size={19}/></div><div><span>Comprometimento</span><strong>{pct(compromissoMedio)}</strong><small>Despesas ÷ Receita · anual</small></div></article></section>
 <section className="infoGrid"><article className="panel chartPanel"><div className="panelHead"><div><h2>Receita × Despesas × Saldo</h2><p>Visão consolidada dos 12 meses</p></div></div><Triple receita={receitaMensal} despesas={despesasMensal} saldo={fluxoPeriodo}/></article><article className="panel chartPanel"><div className="panelHead"><div><h2>Composição da Receita</h2><p>Salários e recebíveis</p></div></div><Donut values={receitaComp} total={anual.renda} labels={receitaRows.map(r=>r.label)}/></article><article className="panel chartPanel"><div className="panelHead"><div><h2>Composição das Despesas</h2><p>Despesas Totais</p></div></div><Donut values={despesaComp} total={anual.despesas} labels={despesaRows.map(r=>r.label)}/></article></section>
 <section className="panel" style={{marginTop:15,padding:'18px 20px',background:'#f4fbf9',borderColor:'#d7ebe7'}}><div style={{display:'grid',gridTemplateColumns:'250px 1fr',gap:22,alignItems:'stretch'}}><div style={{display:'flex',alignItems:'center',gap:12,paddingRight:20,borderRight:'1px solid #dcece9'}}><div style={{width:44,height:44,borderRadius:12,background:'#e3f4ef',color:'#0f766e',display:'grid',placeItems:'center',flex:'0 0 auto'}}><Lightbulb size={22}/></div><div><h2 style={{fontSize:16,margin:0,color:'#20343d'}}>Insights</h2><p style={{fontSize:11,lineHeight:1.45,color:'#7d9198',margin:'5px 0 0'}}>Principais pontos da sua situação financeira em 2026</p></div></div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0}}><div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 17px',borderRight:'1px solid #dcece9',minHeight:66}}><TrendingUp size={19} color="#0f766e"/><div style={{display:'grid',gap:2}}><span style={{fontSize:9,color:'#657980'}}>Melhor mês de fluxo</span><strong style={{fontSize:12,color:'#0f766e'}}>{moeda(melhor.v)}</strong><small style={{fontSize:9,color:'#82959b'}}>{meses[melhor.i]}</small></div></div><div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 17px',borderRight:'1px solid #dcece9',minHeight:66}}><TrendingDown size={19} color="#d05c60"/><div style={{display:'grid',gap:2}}><span style={{fontSize:9,color:'#657980'}}>Maior pressão financeira</span><strong style={{fontSize:12,color:'#c9575b'}}>{moeda(pior.v)}</strong><small style={{fontSize:9,color:'#82959b'}}>{meses[pior.i]}</small></div></div><div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 17px',borderRight:'0',minHeight:66}}><BarChart3 size={19} color="#16805f"/><div style={{display:'grid',gap:2}}><span style={{fontSize:9,color:'#657980'}}>Maior receita</span><strong style={{fontSize:12,color:'#0f766e'}}>{moeda(maiorReceita.v)}</strong><small style={{fontSize:9,color:'#82959b'}}>{meses[maiorReceita.i]}</small></div></div><div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 17px',borderRight:'1px solid #dcece9',minHeight:66}}><Wallet size={19} color="#d05c60"/><div style={{display:'grid',gap:2}}><span style={{fontSize:9,color:'#657980'}}>Maior despesa</span><strong style={{fontSize:12,color:'#c9575b'}}>{moeda(maiorDespesa.v)}</strong><small style={{fontSize:9,color:'#82959b'}}>{meses[maiorDespesa.i]}</small></div></div><div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 17px',borderRight:'1px solid #dcece9',minHeight:66}}><TrendingUp size={19} color="#0f766e"/><div style={{display:'grid',gap:2}}><span style={{fontSize:9,color:'#657980'}}>Evolução do ano</span><strong style={{fontSize:12,color:'#0f766e'}}>{anual.fluxo>=0?'Positiva':'Negativa'}</strong><small style={{fontSize:9,color:'#82959b'}}>Saldo de {moeda(anual.fluxo)}</small></div></div><div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 17px',minHeight:66}}><Percent size={19} color="#d99119"/><div style={{display:'grid',gap:2}}><span style={{fontSize:9,color:'#657980'}}>Ponto de atenção</span><strong style={{fontSize:12,color:'#c47b08'}}>Comprometimento {pct(compromissoMedio)}</strong><small style={{fontSize:9,color:'#82959b'}}>da receita anual com despesas</small></div></div></div></div></section>
 </main></div>
}
