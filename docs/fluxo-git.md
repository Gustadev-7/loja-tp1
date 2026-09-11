# Fluxo de branches — aulas x exercícios

Duas branches, cada uma com um propósito:

| Branch | Para quê | Commits |
|---|---|---|
| `master` | acompanhamento das **aulas** e os resumos em `docs/resumos/` | `aula 1`, `aula 2`, ... |
| `exercicios` | **exercícios** e experimentos fora da aula | à vontade |

A `exercicios` foi criada a partir do commit `2a77030` (`aula 6`).

## Trocar de branch

```bash
# ver em qual branch você está (o marcado com *)
git branch

# ir para os exercícios
git switch exercicios

# voltar para a aula
git switch master
```

> `git switch <nome>` é o comando novo. O antigo `git checkout <nome>` faz o mesmo.

**Antes de trocar**, deixe a branch atual limpa: ou faça `git commit`, ou guarde
o trabalho pela metade com `git stash` (e recupere depois com `git stash pop`).
Se você trocar com alterações não commitadas, o Git só deixa passar se não houver
conflito com a outra branch.

## Rotina de cada semana

**Aula:**

```bash
git switch master
# ... acompanha a aula, mexe no código ...
git add -A
git commit -m "aula 7"
git push                     # envia master para o GitHub (remote "loja-tp1")
```

Depois, peça ao Claude: **"resumo da aula 7"** (ele lê o commit e escreve
`docs/resumos/aula-07.md`). Aí é só commitar o resumo (ainda em `master`).

**Exercícios:**

```bash
git switch exercicios
# ... resolve os exercícios ...
git add -A
git commit -m "exercicios: <assunto>"
git push -u loja-tp1 exercicios   # 1ª vez: cria a branch no GitHub
git push                          # próximas vezes
```

## Trazer o conteúdo novo da aula para os exercícios

Quando a `master` ganhar aulas novas e você quiser essa base na `exercicios`:

```bash
git switch exercicios
git merge master        # traz os commits de aula para dentro de exercicios
```

Faça isso da `exercicios` para `master`, **nunca** o contrário — a `master` deve
ter só os commits de aula, sem os exercícios misturados.

## Situação atual

- Branch ativa: `master`
- `exercicios` criada em `2a77030` ("aula 6"), ainda **não** enviada ao GitHub
- Há alterações não commitadas em `docs/resumos/` (os resumos) — pertencem à `master`
