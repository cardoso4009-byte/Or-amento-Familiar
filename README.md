# Orçamento Familiar

Aplicativo web simples para controle e acompanhamento do orçamento familiar: proventos, despesas, contas, transferências, limites por categoria e fluxo de caixa.

## Objetivo

Ter uma visão rápida de **quanto entrou, quanto saiu, quanto está disponível e onde o dinheiro está sendo gasto**.

## Recursos atuais

- Dashboard mensal
- Proventos e despesas
- Inclusão, edição e exclusão de lançamentos
- Categorias
- Contas e saldos estimados
- Transferências entre contas
- Orçamento e limite por categoria
- Indicadores financeiros
- Ranking de despesas
- Evolução mensal
- Fluxo de caixa diário
- Filtros e pesquisa de lançamentos
- Persistência local no navegador (`localStorage`)
- Interface responsiva para computador e celular

## Regra principal

Transferências entre contas **não são consideradas receita nem despesa**. Elas apenas movimentam o dinheiro entre contas.

## Dados

A versão atual é local-first: os lançamentos ficam salvos no navegador utilizado. Nenhum dado financeiro real deve ser colocado no repositório GitHub.

## Próxima evolução

Quando a experiência estiver validada, podemos adicionar banco de dados, login, sincronização entre dispositivos, cartões, parcelas e recorrências.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para validar a produção:

```bash
npm run build
npm start
```
