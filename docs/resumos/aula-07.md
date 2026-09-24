# Aula 07 — Roteamento (Angular Router)

- **Data:** 10/09/2026
- **Commit:** `1b095ab` — "aula 7"
- **Pré-requisitos:** aula 6 (services, `inject`, Observable, `toSignal`)

## Visão geral

Até aqui a aplicação era **uma tela só**: o `App` montava `Header` + a lista de
produtos direto no `app.html`. Nesta aula a loja virou **multi-página** de
verdade, usando o **Angular Router**:

- `Home` (`/`) mostra a vitrine de produtos;
- `Produtos` (`/produtos`) é a mesma lista, agora acessível por URL própria;
- `ProdutoDetalhe` (`/produtos/:id`) mostra um produto específico, buscado pelo
  `id` da URL;
- `Sobre` (`/sobre`) é uma página estática nova.

O `Header` deixou de usar `href="#"` e `(click)` para navegar e passou a usar
`routerLink`, que troca de tela **sem recarregar a página**.

## Conceitos aprendidos

### 1. Rotas (`Routes`) — mapa de URL → componente

**O que é:** uma lista que diz "quando a URL for X, mostre o componente Y".

**Por que existe:** para a aplicação ter páginas com URL própria (compartilhável,
com botão voltar do navegador funcionando), mesmo sendo uma SPA (tudo roda no
mesmo HTML, sem recarregar).

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { ListaProdutos } from './features/produtos/lista-produtos/lista-produtos';
import { ProdutoDetalhe } from './features/produtos/produto-detalhe/produto-detalhe';
import { Sobre } from './features/sobre/sobre';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'produtos', component: ListaProdutos },
  { path: 'produtos/:id', component: ProdutoDetalhe },
  { path: 'sobre', component: Sobre },
  { path: '**', redirectTo: '' },   // qualquer URL desconhecida volta pra Home
];
```

**Detalhes / pegadinhas:**

- `path: ''` é a **home** (URL raiz, sem nada depois da barra).
- `path: ':id'` — os `:` marcam um **parâmetro de rota**: `produtos/5`,
  `produtos/42` etc. caem todos aqui, com `id` variando.
- `path: '**'` é o **coringa**: pega qualquer URL que não bateu com nenhuma regra
  acima (tem que ser a **última** da lista — a ordem importa).
- Essas rotas são registradas no `app.config.ts` via `provideRouter(routes)`
  (isso já vinha pronto do `ng new`, desde o início do projeto).

### 2. `<router-outlet>` — onde a página troca

**O que é:** uma "moldura" no template. O Angular desenha ali o componente da
rota atual.

```html
<!-- src/app/app.html -->
<app-header [titulo]="title()" (textosobre)="receberSobre($event)"></app-header>
<main class="container">
  <router-outlet></router-outlet>   <!-- aqui entra Home, ListaProdutos, Sobre... -->
</main>
<app-footer></app-footer>
```

Repare que o `App` **não** importa mais `Banner`, `QuantidadeControle`,
`CardProduto` nem `ListaProdutos` diretamente — quem decide o que aparece ali
agora é a rota, não o `App`.

### 3. `routerLink` — navegar sem recarregar

**O que é:** a versão "roteada" do `href`. Troca de página trocando só o
`router-outlet`, sem o navegador recarregar o HTML inteiro (SPA de verdade).

```html
<!-- src/app/core/header/header.html -->
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/produtos">Produtos</a>
  <a routerLink="/sobre">Sobre</a>
</nav>
```

```ts
// header.ts
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  // ...
})
```

**Pegadinha:** `routerLink` precisa da diretiva `RouterLink` no `imports` do
componente — como qualquer outra diretiva/componente usado no template.

### 4. Ler parâmetro de rota — `ActivatedRoute`

**O que é:** o service que dá acesso a informações da rota atual (parâmetros,
query string, etc).

**Por que existe:** o componente `ProdutoDetalhe` só sabe qual produto mostrar
depois de saber **qual `id` veio na URL**.

```ts
// src/app/features/produtos/produto-detalhe/produto-detalhe.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '../services/produto.service';

export class ProdutoDetalhe {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produtoService = inject(ProdutoService);

  carregando = signal(true);
  produto = signal<Produto | undefined>(undefined);

  constructor() {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id') ? Number(pm.get('id')) : NaN;

      if (isNaN(id)) {
        this.produto.set(undefined);
        this.carregando.set(false);
        return;
      }

      this.carregando.set(true);
      this.produtoService.getById(id).subscribe(p => {
        this.produto.set(p);
        this.carregando.set(false);
      });
    });
  }
}
```

**Detalhes:**

- `route.paramMap` é um **Observable** (igual o que veio da aula 6): assinar com
  `.subscribe(...)` roda o código toda vez que o parâmetro muda — inclusive se o
  usuário for de `/produtos/1` direto para `/produtos/2` sem sair da tela.
- `pm.get('id')` devolve uma **string** (ou `null`); por isso o `Number(...)`
  para converter, e o `isNaN` para checar se é um número válido.
- Só depois de saber o `id`, chama `produtoService.getById(id)` (criado na aula 6)
  — outro Observable, assinado do mesmo jeito.
- Dois signals controlam a tela: `carregando` (mostrar "Carregando...") e
  `produto` (o resultado, ou `undefined` se não achar).

### 5. Navegar por código — `Router`

**O que é:** o service que troca de rota "na mão", sem precisar de um `routerLink`
no HTML (por exemplo, depois de uma ação do usuário).

```ts
voltar() {
  this.router.navigateByUrl('/produtos');
}
```

`navigateByUrl('/produtos')` recebe uma **string de URL pronta**.
`navigate(['/produtos'])` faz a mesma coisa recebendo um **array de segmentos**
(mais útil quando a URL tem partes dinâmicas, tipo `navigate(['/produtos', id])`).

### 6. Operador de asserção não-nula (`!`) no template

**O que é:** `produto()!.imageUrl` diz ao TypeScript "confia em mim, aqui não é
`undefined`".

**Por que é seguro aqui:** o template só chega nesse trecho **depois** de passar
por `@if (!produto()) { ... } @else { /* aqui */ }` — ou seja, dentro do `@else`,
o Angular (e o dev) já garantiu que `produto()` existe.

```html
@if (!produto()) {
  <p>Produto não encontrado!</p>
} @else {
  <h2>{{ produto()!.nome }}</h2>
  <p class="descricao">{{ produto()!.descricao }}</p>
}
```

**Pegadinha:** o `!` não faz nenhuma verificação em tempo de execução — se o
`@if` de guarda estivesse errado, o `!` não impediria um erro. Ele só silencia o
aviso do TypeScript.

### 7. Novas páginas simples: `Home` e `Sobre`

`Home` só reaproveita o componente que já existia:

```ts
// src/app/features/home/home.ts
import { ListaProdutos } from '../produtos/lista-produtos/lista-produtos';

@Component({
  selector: 'app-home',
  imports: [ListaProdutos],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
```

```html
<!-- home.html -->
<app-lista-produtos></app-lista-produtos>
```

`Sobre` é só conteúdo estático — mesmo padrão de componente das primeiras aulas.

## Como as peças se encaixam

```
Usuário clica "Produtos" no <nav>
        │  routerLink="/produtos"
        ▼
Router troca a URL e decide o componente pela lista de `routes`
        │
        ▼
<router-outlet> desenha  →  ListaProdutos  (mesma tela da aula 6)
        │
        │  usuário clica em "Detalhes" de um card (ainda via alert, não navega)
        ▼
   (próxima etapa: onView deveria dar router.navigate(['/produtos', id]))

URL /produtos/5 digitada direto
        │
        ▼
ProdutoDetalhe  ← ActivatedRoute.paramMap dá id=5 → ProdutoService.getById(5)
        │
        ├─ carregando() = true   → "Carregando..."
        └─ carregando() = false, produto() = {...} ou undefined
```

Note que a **lista ainda não linka** para o detalhe (o `onViewProduct` do
`ListaProdutos` continua dando `alert`, da aula 4) — a ligação entre clicar num
card e navegar para `/produtos/:id` fica para uma próxima aula.

## Arquivos tocados

- `src/app/app.routes.ts` — as 5 rotas (`Home`, `Produtos`, `ProdutoDetalhe`, `Sobre`, coringa)
- `src/app/app.html` — trocou o conteúdo fixo por `<router-outlet>`
- `src/app/app.ts` — `imports` não precisa mais de `Banner`/`QuantidadeControle`/`CardProduto`/`ListaProdutos`
- `src/app/core/header/header.html` / `.ts` — `routerLink` no lugar de `href="#"`; importa `RouterLink`
- `src/app/features/home/*` — página nova (reaproveita `ListaProdutos`)
- `src/app/features/sobre/*` — página nova, estática
- `src/app/features/produtos/produto-detalhe/*` — página nova: `ActivatedRoute`, `Router`, signals `carregando`/`produto`
- `src/app/features/produtos/services/produto.service.ts` — `getById(id)` (adicionado)

## Erros e ajustes que apareceram

- Em `app.ts`, o `imports` ficou `[RouterOutlet, Header, Footer, RouterOutlet]` —
  **`RouterOutlet` duplicado**. Não quebra nada, mas é sobra de edição; um dos
  dois deve sair.
- Em `voltar()`, o método chama **as duas formas de navegar**, uma atrás da
  outra:
  ```ts
  voltar() {
    this.router.navigateByUrl('/produtos');
    this.router.navigate(['/produtos']);
  }
  ```
  Isso dispara duas navegações seguidas para o mesmo lugar — funciona porque o
  destino é igual, mas é redundante. Ficar só com uma linha.
- `header.ts` importa `CommonModule`, mas o `header.html` não usa nenhuma
  diretiva dele (`*ngIf`, `*ngFor` etc.) — import que sobrou de teste.
- `produtoService.getById` ainda compara com `p.id == id` (`==`, não `===`),
  mesmo ponto já observado na aula 6.
- `ListaProdutos.onViewProduct` continua com `alert(...)` em vez de navegar para
  `/produtos/:id` — a tela de detalhe existe mas ainda não é alcançável clicando
  num produto, só digitando a URL.

## Glossário rápido

- **Router** — módulo do Angular que liga URLs a componentes.
- **`Routes`** — array de configuração: `{ path, component }`.
- **Parâmetro de rota** (`:id`) — parte variável da URL, lida via `ActivatedRoute`.
- **Rota coringa** (`**`) — casa com qualquer URL não mapeada; deve ser a última.
- **`<router-outlet>`** — local do template onde o componente da rota atual é renderizado.
- **`routerLink`** — diretiva para navegar via template, sem recarregar a página.
- **`ActivatedRoute`** — service com dados da rota atual (parâmetros, query params).
- **`Router`** — service para navegar programaticamente (`navigate`, `navigateByUrl`).
- **`paramMap`** — Observable com os parâmetros da rota atual.
- **`!` (non-null assertion)** — diz ao TypeScript "isso não é null/undefined", sem checar em runtime.
- **SPA (Single Page Application)** — uma página HTML só; o "trocar de tela" é só re-renderizar componentes.

## Dúvidas / revisar depois

- Como ligar o clique em "Detalhes" (`CardProduto.onView`) para navegar de
  verdade até `/produtos/:id`?
- Diferença prática entre `navigate(['/produtos', id])` e `navigateByUrl('/produtos/' + id)`.
- Vale a pena usar `input()` de rota (`withComponentInputBinding`) em vez de
  `ActivatedRoute.paramMap` manual?
- Por que `CommonModule` foi parar no `Header` sem uso aparente — apagar ou tinha algum plano?
