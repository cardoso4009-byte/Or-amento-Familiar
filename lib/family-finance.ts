export type IncomePerson = 'Léo' | 'Esposa' | 'Outros'

/**
 * Regra de negócio do Orçamento Familiar:
 * - Proventos podem ser atribuídos a uma pessoa.
 * - Despesas são sempre familiares e não possuem responsável individual.
 * - Transferências entre contas não são receita nem despesa.
 */
export type FamilyTransaction = {
  id: number
  type: 'in' | 'out'
  title: string
  category: string
  date: string
  value: number
  accountId: number
  person?: IncomePerson
}

export function isFamilyIncome(transaction: FamilyTransaction) {
  return transaction.type === 'in'
}

export function incomeByPerson(
  transactions: FamilyTransaction[],
  person: IncomePerson,
  month?: string,
) {
  return transactions
    .filter((transaction) =>
      isFamilyIncome(transaction) &&
      transaction.person === person &&
      (!month || transaction.date.startsWith(month)),
    )
    .reduce((total, transaction) => total + transaction.value, 0)
}

export function familyIncome(
  transactions: FamilyTransaction[],
  month?: string,
) {
  return transactions
    .filter((transaction) =>
      isFamilyIncome(transaction) &&
      (!month || transaction.date.startsWith(month)),
    )
    .reduce((total, transaction) => total + transaction.value, 0)
}

export function familyExpenses(
  transactions: FamilyTransaction[],
  month?: string,
) {
  return transactions
    .filter((transaction) =>
      transaction.type === 'out' &&
      (!month || transaction.date.startsWith(month)),
    )
    .reduce((total, transaction) => total + transaction.value, 0)
}
