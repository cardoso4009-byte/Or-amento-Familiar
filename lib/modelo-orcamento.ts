export const MESES_2026 = ['Jan/26','Fev/26','Mar/26','Abr/26','Mai/26','Jun/26','Jul/26','Ago/26','Set/26','Out/26','Nov/26','Dez/26'] as const

export type MesOrcamento = typeof MESES_2026[number]
export type ResponsavelRenda = 'Léo' | 'Nat'
export type TipoReceita = 'Salário' | 'Férias' | '13º Salário' | 'Bônus' | 'IR / Dissídio'

export type GrupoFinanceiro = 'Receitas' | 'Despesas Fixas' | 'Bancos e Acordos' | 'Despesas Diversas' | 'Resultado'

export type LinhaOrcamento = {
  id: string
  nome: string
  grupo: GrupoFinanceiro
  responsavel?: ResponsavelRenda
  tipoReceita?: TipoReceita
  ativo: boolean
}

/**
 * Estrutura funcional da planilha, sem valores reais.
 * Valores homologados permanecem em armazenamento local e não no código público.
 */
export const ESTRUTURA_ORCAMENTO: LinhaOrcamento[] = [
  { id: 'salarios', nome: 'Salários', grupo: 'Receitas', tipoReceita: 'Salário', ativo: true },
  { id: 'salarios-leo', nome: 'Salários - Léo', grupo: 'Receitas', tipoReceita: 'Salário', responsavel: 'Léo', ativo: true },
  { id: 'salarios-nat', nome: 'Salários - Nat', grupo: 'Receitas', tipoReceita: 'Salário', responsavel: 'Nat', ativo: true },
  { id: 'ferias', nome: 'Férias', grupo: 'Receitas', tipoReceita: 'Férias', ativo: true },
  { id: 'ferias-leo', nome: 'Férias - Léo', grupo: 'Receitas', tipoReceita: 'Férias', responsavel: 'Léo', ativo: true },
  { id: 'ferias-nat', nome: 'Férias - Nat', grupo: 'Receitas', tipoReceita: 'Férias', responsavel: 'Nat', ativo: true },
  { id: 'decimo-terceiro', nome: '13º Salário', grupo: 'Receitas', tipoReceita: '13º Salário', ativo: true },
  { id: 'decimo-terceiro-leo', nome: '13º - Léo', grupo: 'Receitas', tipoReceita: '13º Salário', responsavel: 'Léo', ativo: true },
  { id: 'decimo-terceiro-nat', nome: '13º - Nat', grupo: 'Receitas', tipoReceita: '13º Salário', responsavel: 'Nat', ativo: true },
  { id: 'bonus', nome: 'Bônus', grupo: 'Receitas', tipoReceita: 'Bônus', ativo: true },
  { id: 'bonus-leo', nome: 'Bônus - Léo', grupo: 'Receitas', tipoReceita: 'Bônus', responsavel: 'Léo', ativo: true },
  { id: 'bonus-nat', nome: 'Bônus - Nat', grupo: 'Receitas', tipoReceita: 'Bônus', responsavel: 'Nat', ativo: true },
  { id: 'ir-dissidio', nome: 'IR / Dissídio', grupo: 'Receitas', tipoReceita: 'IR / Dissídio', ativo: true },
  { id: 'ir-dissidio-leo', nome: 'IR / Dissídio - Léo', grupo: 'Receitas', tipoReceita: 'IR / Dissídio', responsavel: 'Léo', ativo: true },
  { id: 'ir-dissidio-nat', nome: 'IR / Dissídio - Nat', grupo: 'Receitas', tipoReceita: 'IR / Dissídio', responsavel: 'Nat', ativo: true },
  { id: 'renda-familiar', nome: 'Renda Familiar', grupo: 'Receitas', ativo: true },
  { id: 'despesas-fixas', nome: 'Despesas Fixas', grupo: 'Despesas Fixas', ativo: true },
  { id: 'bancos-acordos', nome: 'Bancos e Acordos', grupo: 'Bancos e Acordos', ativo: true },
  { id: 'despesas-totais', nome: 'Despesas Totais', grupo: 'Resultado', ativo: true },
  { id: 'despesas-diversas', nome: 'Despesas Diversas', grupo: 'Despesas Diversas', ativo: true },
  { id: 'fluxo-periodo', nome: 'Fluxo de Caixa do Período', grupo: 'Resultado', ativo: true },
]

export const REGRAS_APLICACAO = [
  'Receitas podem ser atribuídas a Léo ou Nat.',
  'Despesas pertencem à família e não são individualizadas por pessoa.',
  'Transferências entre contas não são receitas nem despesas.',
  'Investimentos devem ser acompanhados separadamente do consumo familiar.',
  'Despesas Diversas permanecem em controle próprio e não alteram a regra de Despesas Totais da base homologada.',
  'A homologação dos valores será feita posteriormente, usando a base real enviada pelo usuário.',
] as const
