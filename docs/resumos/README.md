# Resumos das aulas — Técnicas de Programação I

Anotações do que foi aprendido em cada aula, reconstruídas a partir dos commits
do projeto `loja-tp1-angular`.

## Como funciona

1. A cada aula eu faço um commit com a mensagem `aula N` (ou `exercicios aula N`).
2. Depois de commitar, é só me avisar: **"resumo da aula N"**.
3. O Claude lê o `git diff` daquele commit e escreve/atualiza o arquivo
   `aula-0N.md` aqui nesta pasta, destacando os conceitos novos.

> - Fluxo **manual**, sob demanda — nada roda automático no commit.
> - O Claude **nunca faz commit sozinho** — os resumos ficam prontos e eu commito quando quiser.

## Como cada resumo é organizado

Cada `aula-0N.md` segue o [_template.md](_template.md):

- **Visão geral** — o que a aula construiu e por quê
- **Conceitos aprendidos** — cada conceito com *o que é* / *por que existe* /
  *como se usa* (com código) / *pegadinhas*
- **Como as peças se encaixam** — o fluxo de dados entre os componentes
- **Arquivos tocados**, **Erros e ajustes**, **Glossário**, **Dúvidas**

## Índice

| Aula | Data | Tema principal | Arquivo |
|------|------|----------------|---------|
| 1 | 06/08/2026 | Componentes, estrutura do projeto, `core/` | [aula-01.md](aula-01.md) |
| 2 | 06/08/2026 | Signals e interpolação | [aula-02.md](aula-02.md) |
| 3 | 13/08/2026 | Comunicação entre componentes (`input` / `output` / `model`) | [aula-03.md](aula-03.md) |
| 4 | 20/08/2026 | Listas, dados tipados, pipes nativos, `features/` | [aula-04.md](aula-04.md) |
| 5 | 27/08/2026 | Control flow (`@if`/`@for`/`@switch`), `computed`, pipe customizado | [aula-05.md](aula-05.md) |

## Template

Para criar um resumo novo manualmente, veja [_template.md](_template.md).
