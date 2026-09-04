# Aula 05 — Control flow, `computed` e pipe customizado

- **Data:** 27/08/2026
- **Commit:** `b4b0091` — "aula 5"
- **Pré-requisitos:** aula 4 (lista de produtos, `input`, pipes nativos, signals)

## Visão geral

A vitrine ficou "inteligente":

- os 3 cartões repetidos na mão viraram um **`@for`** sobre a lista;
- um botão **"Promoções"** filtra a lista usando um **`computed()`** (valor
  derivado);
- os cartões mostram **selos** ("Novo", "Esgotado", "Aproveite") com **`@switch`**
  e **`@if`**;
- criei o primeiro **pipe customizado** (`DescontoPipe`) para calcular preço com
  desconto, e **encadeei** pipes.

## Conceitos aprendidos

### 1. Control flow no template: `@if`, `@for`, `@switch`

**O que é:** sintaxe de blocos para condicionais e repetição direto no HTML.
Substitui os antigos `*ngIf`, `*ngFor`, `*ngSwitch`.

**Por que é melhor:** não precisa importar nada, a sintaxe é mais parecida com
JavaScript, e o `@for` é mais rápido.

**`@if` / `@else`:**

```html
@if (produtosExibidos().length === 0) {
  <p class="vazio">Nenhum produto encontrado.</p>
} @else {
  <div class="grid">
    ...
  </div>
}
```

**`@for`** (repetição) — **`track` é obrigatório**:

```html
@for (prod of produtosExibidos(); track prod.id) {
  <app-card-produto
    [produto]="prod"
    (add)="onAddProduct($event)"
    (view)="onViewProduct($event)">
  </app-card-produto>
}
```

- `track prod.id` diz ao Angular como identificar cada item. Assim, ao filtrar a
  lista, ele reaproveita os cartões que continuaram e só mexe no que mudou (em vez
  de redesenhar tudo). Use uma **chave única e estável** (o `id`).

**`@switch` / `@case`:**

```html
@switch (produto().estado) {
  @case ('novo')     { <span class="selo novo">Novo</span> }
  @case ('esgotado') { <span class="selo esgotado">Esgotado</span> }
}
```

**Combinando condições** (o botão "Adicionar" só aparece se dá para comprar):

```html
@if (produto().estado !== 'esgotado' && quantidade() > 0) {
  <button type="button" class="btn primary" (click)="onAdd()">Adicionar</button>
}
```

### 2. `computed()` — signal derivado

**O que é:** um signal cujo valor é **calculado a partir de outros signals**. Ele
se recalcula sozinho quando qualquer dependência muda, e "lembra" o resultado
enquanto nada muda (cache).

**Por que existe:** evita repetir lógica no template e evita recalcular à toa. É a
forma certa de ter "um dado que depende de outro dado".

```ts
// src/app/features/produtos/lista-produtos/lista-produtos.ts
import { Component, computed, signal } from '@angular/core';

export class ListaProdutos {
  apenasPromo = signal(false);           // estado: o filtro está ligado?

  produtosExibidos = computed(() =>      // deriva de apenasPromo() + produtos
    this.apenasPromo()
      ? this.produtos.filter(p => p.promo)
      : this.produtos
  );

  alternarPromo() {
    this.apenasPromo.update(v => !v);    // liga/desliga o filtro
  }
}
```

```html
<button class="btn sopromo" [class.ativo]="apenasPromo()" (click)="alternarPromo()">
  @if (apenasPromo()) { Mostrar Todos } @else { Promoções }
</button>
```

**Pegadinha:** dentro do `computed`, para ele "enxergar" a dependência, você tem
que **ler o signal** (`this.apenasPromo()`). É essa leitura que registra a
dependência.

### 3. Pipe customizado

**O que é:** sua própria classe de transformação para usar com `|` no template.

**Como se cria:** classe com `@Pipe(...)` que implementa `PipeTransform` (ou seja,
tem um método `transform`).

```ts
// src/app/shared/pipes/desconto-pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'desconto',   // nome usado no template:  valor | desconto:10
  pure: true,
})
export class DescontoPipe implements PipeTransform {
  // 1º parâmetro = valor à esquerda do "|"; os outros vêm depois dos ":"
  transform(valor: number | undefined | null, percentual = 0): number {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return 0;                                   // proteção contra valor inválido
    }
    const perc = Math.min(Math.max(percentual, 0), 100);   // trava entre 0 e 100
    return Math.round(valor * (1 - perc / 100) * 100) / 100; // 2 casas decimais
  }
}
```

**`pure: true` vs `pure: false`:**

- `pure: true` (padrão) → só recalcula quando o **input muda** (referência).
  Rápido. É o certo para cálculos como este.
- `pure: false` → recalcula a cada ciclo de detecção de mudança. Caro; só em casos
  específicos.

**Uso:** importar `DescontoPipe` no `imports` do componente que usa.

### 4. Encadear pipes e passar parâmetros

```html
{{ produto().preco | desconto:10 | currency:'BRL':'symbol':'1.2-2' }}
```

- O resultado de `desconto:10` entra como entrada do `currency`.
- `desconto:10` → o `10` é o `percentual` do `transform`.
- `currency:'BRL':'symbol':'1.2-2'` → moeda `BRL`, exibe o **símbolo** (`R$`),
  formato `1.2-2` = no mínimo 1 dígito inteiro, e **exatamente 2** casas decimais.

No cartão, o preço promocional aparece riscado ao lado do cheio:

```html
@if (produto().promo) {
  <span class="preco desconto">
    {{ produto().preco | desconto:10 | currency:'BRL':'symbol':'1.2-2' }}
  </span>
  <span class="preco original">
    {{ produto().preco | currency:'BRL':'symbol':'1.2-2' }}
  </span>
} @else {
  <span class="preco">{{ produto().preco | currency:'BRL':'symbol':'1.2-2' }}</span>
}
```

### 5. Union type no model

```ts
// src/app/model/produto.ts
export interface Produto {
  // ...
  estado?: 'novo' | 'usado' | 'esgotado';   // só um desses 3 textos é válido
}
```

O editor passa a sugerir os 3 valores e acusa erro em qualquer outro
(`estado: 'quebrado'` → erro).

### 6. Teste do pipe (`desconto-pipe.spec.ts`)

O CLI gerou um `.spec.ts` para o pipe. Um pipe é uma classe pura (entra valor,
sai valor), então é o tipo de coisa mais fácil de testar isoladamente:
`new DescontoPipe().transform(100, 10)` deve dar `90`.

## Como as peças se encaixam

```
ListaProdutos
├── apenasPromo: signal(false)      ← estado do filtro
├── produtos: Produto[]             ← dados (agora com `estado` e 4 itens)
├── produtosExibidos = computed(…)  ← deriva dos dois de cima
│
└── template
    ├── botão  (click)="alternarPromo()"   → vira apenasPromo → recalcula computed
    ├── @if (produtosExibidos().length === 0) { vazio } @else { grid }
    └── @for (prod of produtosExibidos(); track prod.id) {
          <app-card-produto [produto]="prod">
            ├── @switch (produto().estado)  → selo Novo/Esgotado
            ├── @if (produto().promo)       → selo "Aproveite" + preço com | desconto
            └── @if (estado != 'esgotado')  → mostra o contador de quantidade
        }
```

Clicar no botão muda **um** signal (`apenasPromo`); o `computed` reage; o `@for`
re-renderiza só o necessário graças ao `track`.

## Arquivos tocados

- `src/app/shared/pipes/desconto-pipe.ts` (+ `desconto-pipe.spec.ts`) — pipe novo
- `src/app/features/produtos/lista-produtos/*` — `@for`, `@if`, `computed`,
  `apenasPromo`, botão de filtro, 4º produto (Novalgina), campo `estado` nos dados
- `src/app/features/produtos/card-produto/*` — `@if`/`@switch`, selos, preço
  promocional com `DescontoPipe`, `type="button"` corrigido em parte
- `src/app/model/produto.ts` — `estado?: 'novo' | 'usado' | 'esgotado'`
- `src/app/app.ts` — limpeza de linhas em branco

## Erros e ajustes que apareceram

- O método ficou nomeado `altenarPromo` (faltou o "r" de "alternar") — vale renomear.
- No `DescontoPipe`, variável `percFInal` com maiúscula no meio (`perc` bastaria).
- Ainda restou um `tyoe="button"` no botão "Detalhes".
- Comentários de código antigo (o bloco `linhapreco`) ficaram no HTML — dá para limpar.

## Glossário rápido

- **Control flow** — `@if` / `@for` / `@switch` no template (substituem `*ngIf` etc.).
- **`track`** — expressão que identifica cada item de um `@for` (use uma chave única).
- **`computed()`** — signal derivado de outros signals; recalcula sozinho, com cache.
- **Pipe puro (`pure: true`)** — só recalcula quando o input muda.
- **`PipeTransform`** — interface que obriga a ter o método `transform(...)`.
- **Encadear pipes** — `a | p1 | p2`: a saída de `p1` alimenta `p2`.
- **Union type** — `'a' | 'b' | 'c'`: o valor só pode ser um desses.

## Dúvidas / revisar depois

- Quando usar `computed` e quando um método normal (`getProdutos()`) resolveria?
- O `@empty { }` do `@for` — dá para usar em vez do `@if (...length === 0)`?
- Como testar o pipe na prática (montar o `.spec.ts`)?
- `pure: false` — algum exemplo real onde faz sentido?
