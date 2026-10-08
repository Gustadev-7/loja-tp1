# Aula 08 — HttpClient, mapper e mais um pipe customizado

- **Data:** 17/09/2026
- **Commit:** `1b7dfee` — "aula 8"
- **Pré-requisitos:** aula 6 (services, Observable, `toSignal`), aula 7 (routing, `ActivatedRoute`/`getById`)

## Visão geral

Até aqui o `ProdutoService` devolvia sempre a mesma lista mockada (`listaMock`),
só fingindo demora com `delay(...)`. Nesta aula ele passou a **buscar os
produtos de verdade numa API** (`fakestoreapi.com`), usando `HttpClient`.

Como o formato da API é diferente do `Produto` usado na loja (`title` em vez de
`nome`, `price` em vez de `preco`...), apareceu o padrão **mapper**
(`ProdutoMapper`) para traduzir de um formato para o outro. Também apareceu um
estado de **carregando** exposto pro template, e um pipe novo (`Truncar`) para
cortar textos longos nos cartões.

## Conceitos aprendidos

### 1. `HttpClient` — chamando uma API de verdade

**O que é:** o service do Angular para fazer requisições HTTP (GET, POST...).

**Por que existe:** é a forma padrão e testável de conversar com um backend —
sem usar `fetch` cru espalhado pelo código.

```ts
// produto.service.ts
import { HttpClient } from '@angular/common/http';

export class ProdutoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fakestoreapi.com/products';

  listar(): Observable<Produto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(/* ... */);
  }
}
```

**Detalhes / pegadinhas:**

- `http.get<T>(url)` já devolve um **Observable**, igual o `of(...)` da aula 6 —
  o resto do código (`.pipe`, `toSignal`, etc.) não muda.
- **`HttpClient` só funciona se for registrado na aplicação.** Isso se faz uma
  vez em `app.config.ts` com `provideHttpClient()`. ⚠️ Ver seção de erros — isso
  ficou faltando neste commit.

### 2. Mapper — traduzir um formato de dado para outro

**O que é:** uma função (ou classe) cuja única tarefa é converter um objeto de
um formato para outro.

**Por que existe:** a API (`fakestoreapi`) devolve campos em inglês
(`title`, `price`, `image`) e no formato dela. A loja usa a interface `Produto`,
em português (`nome`, `preco`, `imageUrl`). Sem um mapper, esses dois formatos
ficariam misturados por todo o código.

```ts
// src/app/model/produto.ts
const estados = ['novo', 'usado', 'esgotado'] as const;

export class ProdutoMapper {
  static fromJson(json: any): Produto {
    // sorteia um estado só pra ter dado de exemplo (a API não tem esse campo)
    let _estado = estados[Math.floor(Math.random() * estados.length)];

    return {
      id: json.id,
      nome: json.title,
      preco: json.price,
      descricao: json.description,
      imageUrl: json.image,
      promo: json.id % 5 === 0 && _estado !== 'esgotado',
      estado: _estado,
    };
  }

  static toJson(produto: Produto): any {
    return {
      id: produto.id,
      title: produto.nome,
      price: produto.preco,
      description: produto.descricao,
      image: produto.imageUrl,
      category: 'general',
    };
  }
}
```

**Detalhes:**

- `fromJson` = API → `Produto` (usado ao **ler**). `toJson` = `Produto` → API
  (usado ao **enviar**, ainda sem uso no projeto).
- Métodos `static`: chama-se `ProdutoMapper.fromJson(x)` direto na classe, sem
  `new ProdutoMapper()`. Faz sentido aqui porque o mapper não guarda estado, só
  transforma dado.
- `estados` é um array com `as const`: o TypeScript entende cada item como o
  **texto literal** (`'novo'`, `'usado'`, `'esgotado'`), não como `string`
  genérico — por isso `estados[i]` já bate certinho com o tipo
  `'novo' | 'usado' | 'esgotado'` da interface `Produto`.

### 3. Operadores RxJS: `map`, `catchError`, `finalize`

**O que são:** funções que entram no `.pipe(...)` de um Observable para
transformar, tratar erro ou reagir ao fim do fluxo — o mesmo `.pipe` que já
existia desde a aula 6, só que agora com mais peças.

```ts
listar(): Observable<Produto[]> {
  this.logger.info("[PRODUTO SERVICE] - Retornando lista de produtos");
  return this.http.get<any[]>(this.apiUrl).pipe(
    map(lista => lista.map(prod => ProdutoMapper.fromJson(prod))),  // traduz cada item
    catchError(erro => {                                            // trata erro
      this.logger.error("[PRODUTO SERVICE] - Erro ao buscar lista de produtos");
      return of([]);   // devolve uma lista vazia em vez de quebrar
    })
  );
}
```

| Operador | Papel |
|---|---|
| `map(fn)` | transforma o valor emitido (aqui: JSON cru → `Produto[]`) |
| `catchError(fn)` | intercepta um erro do Observable e devolve **outro** Observable no lugar (evita que o erro "estoure" pra quem assinou) |
| `finalize(fn)` | roda `fn` quando o Observable **termina**, com sucesso ou com erro — bom pra desligar um "carregando" |

**Pegadinha do `map`:** aqui tem um `map` "de fora" (o operador RxJS, dentro do
`.pipe`) e um `.map` "de dentro" (o método de array do JavaScript, rodando em
cada item da lista). São nomes iguais, coisas diferentes — o de fora vem de
`rxjs`, o de dentro já existe em qualquer array.

### 4. Estado de carregamento como signal público

```ts
// lista-produtos.ts
import { finalize } from 'rxjs/internal/operators/finalize';

export class ListaProdutos {
  public carregando = signal(true);

  private produtos = toSignal<Produto[], Produto[]>(
    this.produtoService.listar().pipe(
      finalize(() => this.carregando.set(false))
    ),
    { initialValue: [] }
  );
}
```

```html
<!-- lista-produtos.html -->
@if (carregando()) {
  <p>Carregando produtos...</p>
} @else if (produtosExibidos().length === 0) {
  <p class="vazio">Nenhum produto encontrado.</p>
} @else {
  <div class="grid"> ... </div>
}
```

- `carregando` começa `true` (tela mostra "Carregando produtos...").
- Quando o Observable de `listar()` **termina** (chegou a resposta, com ou sem
  erro), o `finalize` roda e faz `carregando.set(false)`.
- No template, virou `@if / @else if / @else` — uma sequência de três estados
  (carregando → vazio → lista), no lugar do `@if/@else` de dois estados da
  aula 5.

### 5. Pipe customizado com vários parâmetros — `Truncar`

**O que é:** mesmo conceito de pipe da aula 5 (`DescontoPipe`), agora com
**múltiplos parâmetros com valor padrão**.

```ts
// src/app/shared/pipes/truncar-pipe.ts
@Pipe({ name: 'truncar', pure: true })
export class Truncar implements PipeTransform {
  transform(
    valor: string | null | undefined,
    max = 100,
    limite = true,
    etc = '…'
  ): string {
    if (!valor) return '';
    if (valor.length <= max) return valor;

    const parte = valor.slice(0, max);
    if (!limite) return parte + etc;

    const espFinal = parte.lastIndexOf(' ');
    return (espFinal > 0 ? parte.slice(0, espFinal) : parte) + etc;
  }
}
```

```html
<h3 class="titulo">{{ produto().nome | truncar: 25 }}</h3>
<p class="desc">{{ produto().descricao | truncar: 100 }}</p>
```

**Detalhes:**

- `max = 100`, `limite = true`, `etc = '…'` são **valores padrão dos parâmetros**
  — se o template só passar `truncar: 25`, os outros dois ficam no padrão.
- `limite: true` corta no **último espaço antes do limite** (não quebra uma
  palavra no meio); `limite: false` corta exatamente em `max` caracteres.
- `valor.slice(0, max)` pega os primeiros `max` caracteres; `lastIndexOf(' ')`
  acha o último espaço nesse trecho pra cortar ali.
- Precisa entrar no `imports` do `CardProduto`, como qualquer pipe:
  `imports: [QuantidadeControle, CurrencyPipe, DescontoPipe, Truncar]`.

## Como as peças se encaixam

```
ListaProdutos
  carregando = signal(true)
        │
        ▼
ProdutoService.listar()
  http.get(apiUrl)                    ← chamada HTTP real (fakestoreapi.com)
    .pipe(
       map(lista → lista.map(ProdutoMapper.fromJson)),   ← traduz JSON → Produto[]
       catchError(→ of([]))                              ← erro vira lista vazia
    )
        │
        ▼ (toSignal, na ListaProdutos)
  .pipe(finalize(→ carregando.set(false)))                ← desliga o loading no fim
        │
        ▼
produtos()  →  produtosExibidos = computed(...)  →  @for no template
                                                        │
                                              <app-card-produto [produto]="prod">
                                                 nome        | truncar:25
                                                 descricao   | truncar:100
                                                 preco       | desconto:10 | currency...
```

## Arquivos tocados

- `src/app/features/produtos/services/produto.service.ts` — `HttpClient`,
  `apiUrl`, `listar()` e `getById()` agora usam `http.get` + `map` +
  `catchError` em vez do `listaMock` com `delay`
- `src/app/model/produto.ts` — `ProdutoMapper` (`fromJson`/`toJson`) e o array
  `estados` (a interface `Produto` continua igual)
- `src/app/features/produtos/lista-produtos/lista-produtos.ts` / `.html` —
  signal `carregando` + `finalize`, terceiro estado no `@if/@else if/@else`
- `src/app/features/produtos/card-produto/card-produto.ts` / `.html` — usa o
  pipe `truncar` no nome e na descrição
- `src/app/shared/pipes/truncar-pipe.ts` — pipe novo
- `*.css` (`app.css`, `footer.css`, `card-produto.css`, `lista-produtos.css`,
  `styles.css`) — reformatação (aspas/indentação, grid da vitrine)

## Erros e ajustes que apareceram

- **`HttpClient` não foi registrado em `app.config.ts`.** Falta
  `provideHttpClient()` nos `providers`:
  ```ts
  import { provideHttpClient } from '@angular/common/http';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(routes),
      provideHttpClient(),   // <- faltando
    ],
  };
  ```
  Sem isso, o `inject(HttpClient)` do `ProdutoService` quebra em runtime
  ("`NullInjectorError: No provider for HttpClient!`") assim que a tela tentar
  carregar os produtos — vale testar no navegador e ver o console.
- Import "profundo" de novo: `import { finalize } from 'rxjs/internal/operators/finalize'`
  — o caminho certo é `import { finalize } from 'rxjs'` (mesmo ponto já visto
  com `Observable` na aula 6).
- O comentário de `getById` ainda fala em "atraso de 500 milissegundos", mas o
  método não usa mais `delay` — agora é uma chamada HTTP real. Comentário ficou
  desatualizado.
- `ProdutoMapper.toJson` existe mas ainda não é chamado em lugar nenhum —
  código morto por enquanto (ok para quando existir uma tela de cadastro/edição).
- O nome do parâmetro `limite` no `Truncar` é um pouco ambíguo (parece "tamanho
  máximo", mas controla *se corta ou não no espaço*). Um nome como
  `cortarNoEspaco` deixaria a intenção mais clara.

## Glossário rápido

- **`HttpClient`** — service do Angular pra fazer requisições HTTP.
- **`provideHttpClient()`** — registra o `HttpClient` na aplicação (vai em `app.config.ts`).
- **Mapper** — função/classe que só converte um formato de dado para outro.
- **`fromJson` / `toJson`** — convenção de nomes para "ler de fora" / "preparar pra enviar".
- **`as const`** — trava um array/objeto como valores literais, não tipos genéricos.
- **`map` (RxJS)** — operador que transforma cada valor emitido pelo Observable.
- **`catchError`** — operador que troca um erro por um Observable alternativo.
- **`finalize`** — operador que roda algo quando o Observable termina (sucesso ou erro).
- **Código morto** — código escrito mas que ninguém chama ainda.

## Dúvidas / revisar depois

- Quando `getById` falhar (produto não existe na API), `catchError` devolve
  `of(undefined)` — isso está de acordo com o `@if (!produto())` da tela de
  detalhe (aula 7)?
- Por que registrar `provideHttpClient()` é necessário mesmo o `HttpClient`
  sendo `@Injectable`? (diferença entre uma classe injetável e ela estar
  *provida* na árvore de injeção.)
- Vale mover o "sorteio" de `estado` pra dentro do próprio `ProdutoService`, já
  que é regra de negócio (mock), não de conversão de formato?
- Como testar `ProdutoMapper.fromJson` isoladamente (é uma função pura, dá pra
  testar sem Angular)?
