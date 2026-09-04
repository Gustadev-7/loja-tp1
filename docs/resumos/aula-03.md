# Aula 03 — Comunicação entre componentes

- **Data:** 13/08/2026
- **Commit:** `c0eb2ee` — "aula 3"
- **Pré-requisitos:** aulas 1–2 (componentes, signals, interpolação)

## Visão geral

Até agora os componentes eram ilhas. Esta aula é sobre **passar dados entre
eles**:

- **pai → filho:** `input()` (o pai manda um valor para o filho)
- **filho → pai:** `output()` (o filho avisa o pai que algo aconteceu)
- **mão dupla:** `model()` (valor sincronizado nos dois sentidos)

Além disso: criei a primeira **interface TypeScript** (`Produto`) e o componente
`QuantidadeControle` (um contador `- valor +`).

## Conceitos aprendidos

### 1. `input()` — receber dados do pai

**O que é:** uma "entrada" do componente. O pai preenche esse valor no template.

**Por que existe:** para o mesmo componente (ex.: um cabeçalho, um cartão) ser
reutilizado com conteúdos diferentes, sem reescrever nada.

**Como se usa:**

```ts
// src/app/core/header/header.ts
import { Component, input, output } from '@angular/core';

export class Header {
  titulo = input.required<string>();   // o pai É OBRIGADO a passar
}
```

```html
<!-- app.html (o PAI passa o valor) -->
<app-header [titulo]="title()"></app-header>
```

```html
<!-- header.html (o FILHO lê, chamando como função) -->
<h1>{{ titulo() }}</h1>
```

**Detalhes / pegadinhas:**

- `[titulo]="..."` com colchetes é **property binding**: o lado direito é uma
  **expressão** (`title()`), avaliada pelo Angular.
  Sem colchetes (`titulo="title()"`) passaria a string literal `"title()"`.
- `input.required<string>()` → se o pai esquecer, dá erro de compilação.
  `input<string>('padrão')` → opcional, com valor default.
- Um `input` é **somente leitura dentro do filho** — o filho não deve tentar
  alterá-lo.
- Lê-se com `()`: `titulo()`.

### 2. `output()` — avisar o pai

**O que é:** uma "saída" de eventos. O filho **emite**, o pai **escuta**.

**Por que existe:** o filho não conhece o pai e não deve mexer nele diretamente.
Então ele só "grita" um evento; quem quiser que reaja.

**Como se usa:**

```ts
// header.ts
export class Header {
  textosobre = output<string>();

  enviarSobre(): void {
    this.textosobre.emit('Técnicas de Programação I.\nDesenvolvido por Gustavo');
  }
}
```

```html
<!-- header.html: o clique dispara o método do filho -->
<a href="#" (click)="enviarSobre()">Sobre</a>
```

```html
<!-- app.html: o pai escuta o evento -->
<app-header (textosobre)="receberSobre($event)"></app-header>
```

```ts
// app.ts: o pai reage
export class App {
  sobre?: string;

  receberSobre(msg: string): void {
    this.sobre = msg;
  }
}
```

**Detalhes / pegadinhas:**

- `(evento)="..."` com parênteses é **event binding**.
- `$event` é uma variável especial: contém **exatamente o valor passado no
  `.emit(...)`**. Se `emit('abc')`, então `$event === 'abc'`.
- O nome do evento no pai (`textosobre`) tem que ser igual ao nome da propriedade
  `output` no filho.

### 3. `model()` — two-way binding (mão dupla)

**O que é:** um valor que é `input` **e** `output` ao mesmo tempo. O pai passa, o
filho altera, e o pai recebe a alteração de volta — tudo sincronizado.

**Por que existe:** para controles de formulário (campo de texto, contador,
slider) onde o dado "mora" no pai mas quem mexe é o filho.

**Como se usa:**

```ts
// src/app/shared/quantidade-controle/quantidade-controle.ts
import { Component, model } from '@angular/core';

export class QuantidadeControle {
  contador = model<number>(1);   // valor inicial 1

  decrementar() {
    this.contador.set(Math.max(1, this.contador() - 1));  // nunca abaixo de 1
  }

  incrementar() {
    this.contador.update(v => v + 1);
  }
}
```

```html
<!-- quantidade-controle.html -->
<div class="contador">
  <button type="button" (click)="decrementar()" aria-label="Diminuir">-</button>
  <span class="valor">{{ contador() }}</span>
  <button type="button" (click)="incrementar()" aria-label="Aumentar">+</button>
</div>
```

```html
<!-- no pai: sintaxe [( )] — apelidada de "banana in a box" -->
<app-quantidade-controle [(contador)]="quantidade" />
```

`[(contador)]="quantidade"` é atalho para `[contador]="quantidade"` +
`(contadorChange)="quantidade = $event"`.

### 4. Alterar um signal: `.set()` vs `.update()`

| Método | Quando usar | Exemplo |
|---|---|---|
| `.set(x)` | você já tem o valor final | `contador.set(1)` |
| `.update(fn)` | o novo valor depende do atual | `contador.update(v => v + 1)` |

### 5. Interface / model tipado (TypeScript)

**O que é:** um "contrato" que descreve o formato de um objeto — quais campos ele
tem e de que tipo.

**Por que existe:** o editor passa a avisar erro se você escrever `produto.nme`
em vez de `produto.nome`, ou esquecer um campo obrigatório.

```ts
// src/app/model/produto.ts
export interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  imageUrl?: string;   // "?" = campo opcional (pode não existir)
  promo?: boolean;
}
```

Convenção: models ficam em `src/app/model/`.

### 6. Comentar HTML para "desligar" sem apagar

`<app-banner>` foi transformado em `<!-- <app-banner></app-banner> -->` — o
componente some da tela mas o código fica lá para uso futuro.

## Como as peças se encaixam

```
App (pai)
│
├── [titulo]="title()" ─────────────►  Header   (input: recebe o título)
│                                        │
│   receberSobre($event) ◄────(emit)──── textosobre  (output: "clicaram em Sobre")
│
└── <app-quantidade-controle>  →  contador via model() (mão dupla)
```

Regra geral: **dados descem por `input`, eventos sobem por `output`**. `model` é o
caso especial em que os dois sentidos andam juntos.

## Arquivos tocados

- `src/app/core/header/header.ts` — `signal` saiu; entraram `input.required` e `output`
- `src/app/core/header/header.html` — `{{ titulo() }}`, `(click)="enviarSobre()"`
- `src/app/app.ts` — `sobre?: string` + `receberSobre()`; título virou `'Loja TP1 2026'`
- `src/app/app.html` — `[titulo]` e `(textosobre)` no `<app-header>`; comentou o banner
- `src/app/model/produto.ts` — nova interface
- `src/app/shared/quantidade-controle/*` — componente novo com `model()`

## Erros e ajustes que apareceram

- Comentário no código escreve `// Chamada de API` ao lado de `input`/`output` —
  provavelmente anotação do professor sobre "a assinatura da função"; confirmar o sentido.
- `QuantidadeControle` foi para `shared/` (usado em vários lugares), não `core/`.

## Glossário rápido

- **Property binding** `[x]="expr"` — passa o valor de uma expressão para uma entrada.
- **Event binding** `(x)="metodo($event)"` — executa um método quando o evento ocorre.
- **`$event`** — o dado que veio no evento (o argumento do `.emit`).
- **Two-way binding** `[(x)]` — property + event ao mesmo tempo.
- **`input` / `output` / `model`** — entrada / saída de evento / entrada-e-saída.
- **Interface** — contrato de tipos de um objeto (só existe em tempo de compilação).
- **`?`** (em interface) — campo opcional.

## Dúvidas / revisar depois

- Quando o dado deve morar no pai e quando pode morar no filho?
- `model()` por baixo dos panos é um signal? Dá para usar `.update` sempre?
- Diferença entre `EventEmitter` (antigo) e `output()` (novo).
