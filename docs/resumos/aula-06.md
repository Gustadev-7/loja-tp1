# Aula 06 — Services, injeção de dependência e Observables

- **Data:** 03/09/2026
- **Commit:** `2a77030` — "aula 6"
- **Pré-requisitos:** aula 5 (signals, `computed`, lista de produtos dentro do componente)

## Visão geral

Até a aula 5, a lista de produtos estava **escrita dentro do componente**
`ListaProdutos`. Isso é ruim: o componente devia cuidar só da tela, não de "de
onde vêm os dados".

Nesta aula os dados saíram do componente e foram para um **service**
(`ProdutoService`). O componente agora **pede** a lista ao service, em vez de
tê-la. Para isso apareceram três coisas novas:

- **`@Injectable` + `inject()`** — injeção de dependência (como um objeto
  compartilhado chega até quem precisa dele);
- **Observable (RxJS)** — o jeito do Angular representar um dado que **chega
  depois** (assíncrono), simulando uma chamada de API;
- **`toSignal()`** — ponte que transforma um Observable num signal, para usar no
  template do jeito de sempre.

Também criei um `LoggerService` (registrar mensagens no console) para praticar o
conceito.

## Conceitos aprendidos

### 1. Service

**O que é:** uma classe comum, sem template, que concentra uma
responsabilidade — buscar dados, fazer cálculos, logar, falar com o servidor.

**Por que existe:** separar responsabilidades. O componente = tela. O service =
regra/dados. O mesmo service pode ser usado por vários componentes.

```ts
// src/app/features/produtos/services/produto.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',   // registra o service na aplicação inteira (1 instância só)
})
export class ProdutoService {
  private readonly listaMock = <Produto[]>[ /* ...os 4 produtos... */ ];
}
```

**Detalhes / pegadinhas:**

- `@Injectable` marca a classe como "injetável" (o Angular sabe criar e entregar).
- `providedIn: 'root'` → **singleton global**: existe uma instância só, criada sob
  demanda, compartilhada por todos. (Também é *tree-shakable*: se ninguém usar, o
  service nem entra no build.)
- Convenção de pasta: services de uma feature em `features/xxx/services/`;
  services gerais em `core/services/`.

### 2. Injeção de dependência com `inject()`

**O que é:** em vez de o componente fazer `new ProdutoService()`, ele **pede** o
service e o Angular entrega a instância pronta.

**Por que existe:** você não controla o ciclo de vida do objeto, não precisa saber
construir suas dependências, e dá para trocar a implementação (ex.: um fake nos
testes) sem mexer em quem usa.

```ts
// lista-produtos.ts
import { Component, computed, inject, signal } from '@angular/core';
import { ProdutoService } from '../services/produto.service';

export class ListaProdutos {
  private produtoService = inject(ProdutoService);   // o Angular entrega a instância
}
```

E um service pode injetar outro:

```ts
// produto.service.ts
export class ProdutoService {
  private logger = inject(LoggerService);   // service usando outro service
}
```

**Detalhes:**

- `inject(X)` é chamado **na inicialização da classe** (na declaração do campo ou
  no construtor). Não pode ser chamado "a qualquer momento" dentro de um método
  qualquer.
- É a forma nova; a antiga era receber no `constructor(private x: X) {}`.

### 3. Observable (RxJS) — dado assíncrono

**O que é:** um objeto que representa um valor (ou vários) que **vai chegar ao
longo do tempo**. É o padrão do Angular para "coisas que demoram": requisição
HTTP, eventos, timers.

**Por que aqui:** para simular uma API. Os dados são locais, mas são entregues
"com atraso" como se viessem da internet.

```ts
// produto.service.ts
import { Observable } from 'rxjs/internal/Observable';
import { delay, of } from 'rxjs';

listar(): Observable<Produto[]> {
  this.logger.info('[PRODUTO SERVICE] - Retornando lista de produtos');
  return of(this.listaMock).pipe(
    delay(1000),   // segura 1 segundo antes de "entregar" a lista
  );
}
```

| Peça | O que faz |
|---|---|
| `of(valor)` | cria um Observable que emite `valor` uma vez e completa |
| `.pipe(...)` | encadeia **operadores** que transformam o fluxo (como pipes no template) |
| `delay(ms)` | atrasa a emissão em `ms` milissegundos |

**Detalhes:**

- Um Observable é "preguiçoso": nada acontece até alguém **se inscrever**
  (`subscribe`) — ou, aqui, até o `toSignal` fazer isso por baixo dos panos.
- `Observable<Produto[]>` é o **tipo de retorno**: "um fluxo que vai emitir um
  array de `Produto`".

### 4. `toSignal()` — de Observable para signal

**O que é:** função de `@angular/core/rxjs-interop` que assina um Observable e
expõe o último valor emitido como um **signal**.

**Por que existe:** o template já sabe lidar com signal (`produtos()`). Assim não
é preciso `subscribe`/`unsubscribe` manual nem o pipe `async`.

```ts
// lista-produtos.ts
import { toSignal } from '@angular/core/rxjs-interop';

private produtos = toSignal<Produto[], Produto[]>(
  this.produtoService.listar(),
  { initialValue: [] },   // enquanto o Observable não emite, o signal vale []
);
```

**Detalhes / pegadinhas:**

- `initialValue: []` evita `undefined` no começo (durante o `delay(1000)` a tela
  mostra "lista vazia", depois preenche).
- Agora `produtos` é um **signal**, então lê-se com `()`:

```ts
// ANTES (aula 5): produtos era array  →  this.produtos.filter(...)
// AGORA (aula 6): produtos é signal   →  this.produtos().filter(...)
produtosExibidos = computed(() =>
  this.apenasPromo()
    ? this.produtos().filter(p => p.promo)
    : this.produtos(),
);
```

O `computed` continua igual; só a leitura ganhou `()`.

### 5. `LoggerService` — praticando o padrão

```ts
// src/app/core/services/logger/logger.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  info(msg: string, extra?: unknown)  { console.info(msg, extra ?? ''); }
  warn(msg: string, extra?: unknown)  { console.info(msg, extra ?? ''); }
  error(msg: string, extra?: unknown) { console.info(msg, extra ?? ''); }
}
```

- `extra?: unknown` — segundo argumento opcional, de tipo desconhecido
  (`unknown` = "qualquer coisa, mas me obrigue a checar antes de usar").
- `extra ?? ''` — **nullish coalescing**: se `extra` for `null`/`undefined`, usa `''`.

## Como as peças se encaixam

```
LoggerService  ─────────────┐  (inject)
                            ▼
ProdutoService  ── listar() ──►  Observable<Produto[]>   (of + delay 1000ms)
      ▲                                   │
      │ inject(ProdutoService)            │ toSignal({ initialValue: [] })
      │                                   ▼
ListaProdutos ─ produtos()  ── é signal ──►  computed(produtosExibidos)
                                                 │
                                        @for no template → <app-card-produto>
```

Fluxo no tempo:
1. Componente inicializa → `inject` pega o `ProdutoService`.
2. `toSignal` assina `listar()` → signal `produtos` começa `[]`.
3. Passados ~1s, o Observable emite os 4 produtos → `produtos()` muda.
4. `computed` reage → `@for` re-renderiza a grade.

## Arquivos tocados

- `src/app/core/services/logger/logger.service.ts` (+ `.spec.ts`) — service novo
- `src/app/features/produtos/services/produto.service.ts` (+ `.spec.ts`) — service
  novo: guarda o `listaMock` e expõe `listar(): Observable<Produto[]>`
- `src/app/features/produtos/lista-produtos/lista-produtos.ts`:
  - removeu o array `produtos` de dentro do componente (foi para o service)
  - `inject(ProdutoService)` + `toSignal(...)`
  - `this.produtos` → `this.produtos()` dentro do `computed`
  - comentários explicativos linha a linha

## Erros e ajustes que apareceram

- **`LoggerService.warn` e `.error` chamam `console.info`** (copiar-colar). Deviam
  ser `console.warn` e `console.error`.
- O comentário do `listar()` diz "atraso de 250 milissegundos", mas o código usa
  `delay(1000)`. Alinhar comentário e código.
- Import "profundo": `import { Observable } from 'rxjs/internal/Observable'` —
  o certo é `import { Observable } from 'rxjs'` (o caminho `internal/` é privado
  da lib e pode quebrar).
- `altenarPromo` (typo de "alternar") continua desde a aula 5.
- Há uma linha em branco entre `@Injectable({...})` e `export class` nos dois
  services — funciona, mas o CLI não gera assim.

## Glossário rápido

- **Service** — classe sem template, com uma responsabilidade (dados, regra, log).
- **`@Injectable`** — marca a classe como injetável pelo Angular.
- **`providedIn: 'root'`** — instância única, global, criada sob demanda.
- **Injeção de dependência (DI)** — o framework entrega as dependências prontas;
  você não dá `new`.
- **`inject(X)`** — pede a instância de `X` ao injetor do Angular.
- **Observable** — fluxo de valores que chegam ao longo do tempo (assíncrono).
- **`of(x)`** — Observable que emite `x` uma vez.
- **`delay(ms)`** — operador que atrasa a emissão.
- **`.pipe(op1, op2)`** — encadeia operadores sobre um Observable.
- **`toSignal(obs, { initialValue })`** — expõe o último valor do Observable como signal.
- **`unknown`** — "tipo qualquer", mas obriga verificação antes do uso.
- **`??`** (nullish coalescing) — usa o lado direito só se o esquerdo for `null`/`undefined`.

## Dúvidas / revisar depois

- Diferença entre `Observable` e `Promise`. Quando usar cada um?
- O que é `subscribe` e por que `toSignal` dispensa o `unsubscribe`?
- `providedIn: 'root'` vs registrar o service no `providers` de um componente.
- Como isso vira uma chamada HTTP real (`HttpClient`) na próxima etapa?
- `inject()` no campo da classe vs no `constructor` — muda alguma coisa?
