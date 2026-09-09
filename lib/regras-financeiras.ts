export type ResponsavelRenda = 'Léo' | 'Nat'

export type TipoReceita =
  | 'Salário'
  | 'Férias'
  | '13º Salário'
  | 'Bônus'
  | 'IR / Dissídio'

export type ReceitaFamiliar = {
  id: number
  responsavel: ResponsavelRenda
  tipo: TipoReceita
  competencia: string
  valor: number
}

export type ReferenciaMensal = {
  competencia: string
  receitaPlanilha: number
  despesasTotaisPlanilha: number
  fluxoPlanilha: number
}

/** Soma somente as receitas atribuídas a um responsável. */
export function totalPorResponsavel(
  receitas: ReceitaFamiliar[],
  responsavel: ResponsavelRenda,
  competencia?: string,
): number {
  return receitas
    .filter(
      (r) =>
        r.responsavel === responsavel &&
        (!competencia || r.competencia === competencia),
    )
    .reduce((total, r) => total + r.valor, 0)
}

/** Soma Léo + Nat para obter a renda familiar registrada no aplicativo. */
export function totalRendaFamiliar(
  receitas: ReceitaFamiliar[],
  competencia?: string,
): number {
  return receitas
    .filter((r) => !competencia || r.competencia === competencia)
    .reduce((total, r) => total + r.valor, 0)
}

/** Fluxo homologado: receita oficial menos despesas totais oficiais. */
export function fluxoDoPeriodo(
  receita: number,
  despesasTotais: number,
): number {
  return receita - despesasTotais
}

/** Diferença entre o cálculo do aplicativo e a referência da planilha. */
export function diferencaHomologacao(
  realizadoAplicativo: number,
  referenciaPlanilha: number,
): number {
  return realizadoAplicativo - referenciaPlanilha
}
