# Aula 04 — Listas, dados tipados e pipes nativos

- **Data:** 20/08/2026
- **Commit:** `7050925` — "aula 4"
- **Pré-requisitos:** aula 3 (`input`, `output`, `interface Produto`, `QuantidadeControle`)

## Visão geral

Construí a **funcionalidade de produtos**: um componente `CardProduto` (o cartão
de um produto) e um `ListaProdutos` (a vitrine que contém vários cartões, a partir
de uma lista de dados). O cartão recebe um `Produto` por `input`, formata o preço
com um **pipe**, e emite eventos de "adicionar ao carrinho" e "ver detalhes".

Aparece também a terceira pasta de organização: `features/`.

## Conceitos aprendidos

### 1. Organização: `core/` vs `shared/` vs `features/`

| Pasta | O que vai nela | Exemplos no projeto |
|---|---|---|
| `core/` | moldura fixa, aparece 1x | `header`, `footer`, `banner` |
| `shared/` | peças reutilizáveis genéricas | `quantidade-controle`, `pipes/` |
| `features/` | telas/blocos de uma funcionalidade | `produtos/card-produto`, `produtos/lista-produtos` |

### 2. Passar um objeto inteiro por `input`

O `input` não serve só para `string`/`number` — pode ser um objeto tipado:

```ts
// src/app/features/produtos/card-produto/card-produto.ts
import { Component, input, output, signal } from '@angular/core';
import { Produto } from '../../../model/produto';

export class CardProduto {
  produto = input.required<Produto>();     // recebe o objeto do pai
  quantidade = signal<number>(1);          // estado interno do cartão
}
```

```html
<!-- o pai passa cada item da lista -->
<app-card-produto [produto]="produtos[0]" />
```

No template do filho, acessa-se campo a campo: `produto().nome`, `produto().preco`.
(`produto()` porque é `input`/signal; `.nome` porque o valor é um objeto `Produto`.)

### 3. Lista de dados tipada

```ts
// src/app/features/produtos/lista-produtos/lista-produtos.ts
produtos = <Produto[]>[
  { id: 1, nome: 'Mounjaro', preco: 1699.9,  descricao: '...', imageUrl: 'images/mounjaro.jpg', promo: false },
  { id: 2, nome: 'Ozempic',  preco: 1299.94, descricao: '...', imageUrl: 'images/ozempic.jpg',  promo: false },
  { id: 3, nome: 'Wegovy',   preco: 2500.00, descricao: '...', imageUrl: 'images/wegovy.jpeg',  promo: true  },
];
```

- `<Produto[]>[ ... ]` é uma **type assertion**: diz ao TypeScript "trate esse
  array como `Produto[]`". Se um objeto estiver fora do formato, o editor acusa.
- São **dados mockados** (fixos, escritos na mão) — mais para frente viriam de uma API.

### 4. Property binding em atributos e classes

```html
<!-- card-produto.html -->
<article class="card" [class.promo]="produto().promo">
  <img class="thumb" [src]="produto().imageUrl" />
  <h3 class="titulo">{{ produto().nome }}</h3>
  <p class="desc">{{ produto().descricao }}</p>
  ...
</article>
```

| Sintaxe | Efeito |
|---|---|
| `[src]="expr"` | define o atributo `src` com o valor da expressão |
| `[class.promo]="condição"` | adiciona/remove **só** a classe `promo` conforme `true`/`false` |
| `{{ expr }}` | insere texto |

### 5. Pipe (nativo) — `currency`

**O que é:** uma transformação aplicada a um valor **só na hora de exibir**. Não
altera o dado original.

**Como se usa:** `valor | nomeDoPipe:argumento`

```ts
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [QuantidadeControle, CurrencyPipe],   // precisa importar o pipe
  // ...
})
```

```html
<span class="preco">{{ produto().preco | currency:'BRL' }}</span>
<!-- 1699.9  →  "R$ 1,699.90" -->
```

**Detalhes:**

- Pipes nativos (`currency`, `date`, `uppercase`, `json`...) vêm de `@angular/common`.
- Cada pipe usado precisa entrar no `imports` do componente (assim como um
  componente filho).
- A formatação de casas/locale ainda não foi ajustada aqui — isso vem na aula 5
  com `currency:'BRL':'symbol':'1.2-2'`.

### 6. `output` com um objeto no payload

O evento não precisa carregar um valor simples — pode carregar um objeto:

```ts
// card-produto.ts
add  = output<{ id: number, qtd: number }>();
view = output<number>();

onAdd()  { this.add.emit({ id: this.produto().id, qtd: this.quantidade() }); }
onView() { this.view.emit(this.produto().id); }
```

```html
<button type="button" class="btn primary" (click)="onAdd()">Adicionar</button>
<button type="button" class="btn ghost"   (click)="onView()">Detalhes</button>
```

### 7. Composição em camadas + eventos "subindo"

```html
<!-- lista-produtos.html -->
<section class="catalogo">
  <h2>Produtos</h2>
  <div class="grid">
    <app-card-produto [produto]="produtos[0]" (add)="onAddProduct($event)" (view)="onViewProduct($event)" />
    <app-card-produto [produto]="produtos[1]" (add)="onAddProduct($event)" (view)="onViewProduct($event)" />
    <app-card-produto [produto]="produtos[2]" (add)="onAddProduct($event)" (view)="onViewProduct($event)" />
  </div>
</section>
```

```ts
// lista-produtos.ts
onViewProduct(id: number) {
  alert(`Visualizando produto id: ${id}`);
}
onAddProduct(produto: { id: number, qtd: number }) {
  alert(`Adicionando produto id: ${produto.id} | Quantidade: ${produto.qtd}`);
}
```

## Como as peças se encaixam

```
App
└── <app-lista-produtos>            ← tem o array `produtos` + os handlers
      └── <app-card-produto> (x3)   ← recebe [produto], emite (add)/(view)
            └── <app-quantidade-controle>  ← [(contador)] com a quantidade do cartão
```

Dados descem: `produtos[i]` → `[produto]` do card.
Eventos sobem: clique no botão → `output` do card → método na lista → `alert`.
Cada camada só conversa com a vizinha.

## Arquivos tocados

- `src/app/features/produtos/card-produto/*` — componente novo
- `src/app/features/produtos/lista-produtos/*` — componente novo + array mockado + handlers
- `src/app/app.ts` / `app.html` — importa e usa `<app-lista-produtos>` (comentou o `<h2>` de aula)
- `public/images/` — `mounjaro.jpg`, `ozempic.jpg`, `wegovy.jpeg`

## Erros e ajustes que apareceram

- Os 3 `<app-card-produto>` foram escritos na mão, repetidos. Na aula 5 isso vira um `@for`.
- Typo nos botões: `tyoe="button"` em vez de `type="button"` (corrigido em parte na aula 5).
- Ainda usando `alert(...)` como "ação" — placeholder até ter carrinho de verdade.

## Glossário rápido

- **Pipe** — transforma um valor **na exibição** (`{{ valor | pipe }}`), sem mudar o dado.
- **Dados mockados** — dados fixos escritos no código, simulando o que viria de um servidor.
- **Type assertion** (`<Tipo>valor`) — força o TypeScript a tratar algo como um tipo.
- **`[class.x]="cond"`** — liga/desliga uma classe CSS conforme uma condição.
- **Payload** — o "conteúdo" que um evento carrega.
- **Handler** — método que trata um evento.

## Dúvidas / revisar depois

- Como o `currency` decide o locale (ponto vs vírgula, "R$" antes/depois)?
- Por que o `card-produto.ts` importa `signal` mas o `quantidade` também pode vir por `model`?
- Vale a pena tipar o payload do `output` com uma `interface` em vez de objeto inline?
