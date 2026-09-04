# Aula 01 — Primeiros componentes e estrutura do projeto

- **Data:** 06/08/2026
- **Commit:** `3a2af35` — "aula 1"
- **Pré-requisitos:** projeto criado com `ng new` (Angular CLI)

## Visão geral

O projeto recém-criado vem com uma tela de boas-vindas gigante dentro de
`src/app/app.html`. Nesta aula eu **apaguei esse template padrão** e comecei a
estrutura real da loja: criei dois componentes próprios — `Header` (cabeçalho com
logo e menu) e `Footer` (rodapé) — dentro da pasta `src/app/core/`, e os coloquei
no componente raiz da aplicação.

A ideia central da aula é entender **o que é um componente** e **como um
componente usa outro**.

## Conceitos aprendidos

### 1. Componente Angular

**O que é:** o bloco de construção da interface. Cada pedaço visual da tela
(cabeçalho, rodapé, cartão de produto...) é um componente.

**Por que existe:** para dividir a interface em partes pequenas, isoladas e
reutilizáveis, em vez de um HTML gigante só.

**Como se usa:** um componente são (normalmente) 4 arquivos na mesma pasta:

| Arquivo | Papel |
|---|---|
| `header.ts` | a classe: lógica, dados, comportamento |
| `header.html` | o template: o que aparece na tela |
| `header.css` | o estilo, que **só afeta este componente** |
| `header.spec.ts` | teste automático (gerado pelo CLI) |

```ts
// src/app/core/header/header.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',        // o "nome de tag" para usar no HTML
  imports: [],                   // o que este componente precisa usar
  templateUrl: './header.html',  // onde está o template
  styleUrl: './header.css',      // onde está o estilo
})
export class Header {}           // por enquanto sem lógica nenhuma
```

**Detalhes / pegadinhas:**

- O `@Component({...})` é um **decorator**: ele "carimba" a classe com metadados
  que dizem ao Angular como tratá-la.
- Convenção de nome do `selector`: prefixo `app-` + nome em *kebab-case*
  (`app-header`, `app-card-produto`).
- Nesta versão do Angular o CLI gera a classe sem o sufixo `Component`
  (`export class Header`, não `HeaderComponent`).

### 2. Componentes *standalone* e o array `imports`

**O que é:** nesta versão do Angular, todo componente é *standalone* — ele se
importa sozinho, sem precisar declarar num `NgModule`.

**Por que importa:** antigamente havia um arquivo `app.module.ts` que listava
todos os componentes. Agora **cada componente declara suas próprias dependências**
no próprio decorator.

**Como se usa:** para o `App` poder mostrar `<app-header>` e `<app-footer>`, ele
importa essas classes:

```ts
// src/app/app.ts
import { Header } from './core/header/header';
import { Footer } from './core/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],  // <- sem isso, as tags não funcionam
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('loja-tp1-angular');
}
```

**Pegadinha:** se você usar `<app-header>` no HTML mas esquecer de por `Header`
no `imports`, o Angular dá erro de compilação ("is not a known element").

### 3. Usar um componente no template

Depois de importado, usa-se pelo `selector`, como se fosse uma tag HTML normal:

```html
<!-- src/app/app.html -->
<app-header></app-header>

<div class="container">
  <h2>Angular - Aula 02</h2>
  <p>Em construção</p>
</div>

<app-footer></app-footer>
```

### 4. CSS com escopo por componente

**O que é:** o que você escreve em `footer.css` **só vale dentro do `footer.html`**.

**Por que é bom:** você pode ter uma regra `p { ... }` no footer sem medo de
afetar todos os `<p>` do site. O Angular isola automaticamente.

```css
/* src/app/core/footer/footer.css — só afeta este componente */
footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 15px;
  border-top: 1px solid #ccc;
}
```

`src/styles.css` continua sendo o CSS **global** (aplica ao site inteiro).

### 5. Como a aplicação "liga"

Fluxo de inicialização (não mexemos aqui, mas é bom saber):

```
index.html  →  carrega  →  main.ts
main.ts     →  bootstrapApplication(App)   // sobe o componente raiz
App         →  seu selector é <app-root>, que está no index.html
```

## Como as peças se encaixam

```
App (app-root)
├── <app-header>   → core/header
├── conteúdo
└── <app-footer>   → core/footer
```

O `App` é o "container" da página. `Header` e `Footer` são filhos dele — o `App`
importa as classes e usa as tags. Cada um é independente e tem seu próprio estilo.

## Arquivos tocados

- `src/app/app.html` — apagou toda a tela de boas-vindas; sobraram `<app-header>`,
  um `<div class="container">` e `<app-footer>`
- `src/app/app.ts` — adicionou `Header` e `Footer` no `imports`
- `src/app/core/header/*` — componente novo (logo + `<h1>` + `<nav>` com links)
- `src/app/core/footer/*` — componente novo (rodapé fixo)
- `src/styles.css` — ajustes de estilo global
- `public/images/logoifsp.png` — logo usada no header

## Erros e ajustes que apareceram

- O `<h1>` do header ficou com texto fixo (`Loja TP1`) — na aula 2 isso vira um signal.
- `app.html` ficou sem `<router-outlet />` (removido junto com o template). Como
  ainda não há rotas, tudo bem por enquanto.

## Glossário rápido

- **Componente** — classe + template + estilo que formam um pedaço da tela.
- **Decorator** (`@Component`) — anotação que adiciona metadados a uma classe.
- **`selector`** — o nome de tag do componente (`app-header`).
- **Standalone** — componente que não depende de `NgModule`; declara tudo no `imports`.
- **`templateUrl` / `styleUrl`** — caminhos para o HTML e o CSS do componente.
- **Bootstrap** — processo de "ligar" a aplicação a partir do componente raiz.

## Dúvidas / revisar depois

- `styleUrl` (string, novo) vs `styleUrls` (array, versões antigas) — quando usar cada.
- O que exatamente o `<router-outlet />` faz e quando vou precisar dele de volta.
- Diferença entre a pasta `public/` e a pasta `src/assets/`.
