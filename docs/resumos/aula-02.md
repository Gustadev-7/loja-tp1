# Aula 02 — Signals e interpolação

- **Data:** 06/08/2026
- **Commit:** `76f1578` — "exercicios aula 2"
- **Pré-requisitos:** aula 1 (criar componente, `imports`, usar no template)

## Visão geral

Dois objetivos: (1) praticar de novo a criação de componentes, criando o
`Banner`; (2) conhecer **signal** — a forma do Angular de guardar um valor que a
tela precisa acompanhar. Troquei o título fixo do header (`<h1>Loja TP1</h1>`)
por um signal exibido com **interpolação** (`{{ title() }}`).

## Conceitos aprendidos

### 1. Signal

**O que é:** uma "caixinha" reativa que guarda um valor. Quando o valor muda, o
Angular atualiza sozinho todo lugar da tela que estava mostrando esse valor.

**Por que existe / que problema resolve:** sem signals, você teria que manualmente
avisar a tela "ei, esse dado mudou, redesenha". O signal faz esse rastreamento
automático — você só troca o valor e a interface se atualiza.

**Como se usa:**

```ts
// src/app/core/header/header.ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly title = signal('Loja TP1');  // cria o signal com valor inicial
}
```

**Detalhes / pegadinhas:**

- **Para LER o valor, você chama o signal como função:** `title()` — com
  parênteses. `title` sozinho é a caixinha; `title()` é o conteúdo dela.
- Para ESCREVER, existem `title.set(novoValor)` e `title.update(fn)` (aparecem na aula 3).
- `readonly` protege a **referência** da caixinha (você não vai fazer
  `this.title = outraCoisa`), mas o **conteúdo** ainda pode mudar via `.set`/`.update`.
- `protected` = visível no template e em subclasses, mas não "de fora" do componente.

### 2. Interpolação `{{ ... }}`

**O que é:** a sintaxe que coloca no HTML o resultado de uma expressão do
componente.

**Como se usa:**

```html
<!-- src/app/core/header/header.html -->
<header>
  <img src="images/logoifsp.png" />
  <h1>{{ title() }}</h1>     <!-- mostra "Loja TP1" -->
  <nav>
    <a href="#">Home</a>
    <a href="#">Produtos</a>
    <a href="#">Sobre</a>
  </nav>
</header>
```

**Detalhes:**

- Dentro de `{{ }}` vai uma **expressão**, não um comando. Pode ser `title()`,
  `1 + 2`, `produto().nome`, mas não um `if` ou um `for`.
- Como `title` é um signal, precisa dos parênteses: `{{ title() }}`. Esquecer os
  parênteses (`{{ title }}`) mostraria o objeto da função, não o texto.

### 3. Reforço: criar e compor componentes (`Banner`)

Mesma receita da aula 1, agora sozinho:

```ts
// src/app/core/banner/banner.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {}
```

```html
<!-- src/app/core/banner/banner.html -->
<section>
  <p>Aqui é o banner</p>
</section>
```

E no `App`: importar a classe + usar a tag.

```ts
// app.ts
import { Banner } from './core/banner/banner';

@Component({
  imports: [RouterOutlet, Header, Footer, Banner],
  // ...
})
```

```html
<!-- app.html -->
<app-header></app-header>
<app-banner></app-banner>
<div class="container"> ... </div>
<app-footer></app-footer>
```

## Como as peças se encaixam

```
App
├── <app-header>   → agora mostra title() (signal), não texto fixo
├── <app-banner>   → componente novo
├── conteúdo
└── <app-footer>
```

O header deixou de ter um texto "chumbado" no HTML. O texto agora vem de um dado
da classe (`title`), e a tela só reflete esse dado. Se amanhã o título precisar
mudar em runtime, basta um `title.set(...)`.

## Arquivos tocados

- `src/app/core/banner/*` — componente novo
- `src/app/app.ts` — `Banner` no `imports`
- `src/app/app.html` — `<app-banner>` adicionado
- `src/app/core/header/header.ts` — `import { signal }` + `title = signal('Loja TP1')`
- `src/app/core/header/header.html` — `<h1>Loja TP1</h1>` → `<h1>{{ title() }}</h1>`

## Erros e ajustes que apareceram

- Fácil esquecer os parênteses ao ler o signal no template. Regra: **signal sempre com `()` para ler**.

## Glossário rápido

- **Signal** — valor reativo; a tela se atualiza sozinha quando ele muda.
- **Reatividade** — a interface "reage" automaticamente a mudanças nos dados.
- **Interpolação** (`{{ }}`) — insere o valor de uma expressão no HTML.
- **Expressão** — algo que produz um valor (`title()`, `a + b`); não é um comando.

## Dúvidas / revisar depois

- Quando um dado deve ser `signal` e quando pode ser propriedade normal (`x = 5`)?
- Já ouvi falar de `computed` e `effect` — o que são? (aparecem na aula 5).
- O signal `title` foi marcado `protected readonly` — por que não `private`?
