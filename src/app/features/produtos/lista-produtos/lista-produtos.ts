import { Component, computed, inject, signal } from '@angular/core';
import { Produto } from '../../../model/produto';
import { CardProduto } from "../card-produto/card-produto";
import { ProdutoService } from '../services/produto.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-lista-produtos',
  imports: [CardProduto],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css',
})
export class ListaProdutos {

  // Injeção do serviço ProdutoService para obter a lista de produtos.
  private produtoService = inject(ProdutoService);
  
  // Criação de um sinal (signal) que representa se a lista de produtos está sendo carregada.
  public carregando = signal(true);

  // Criação de um sinal (signal) que representa a lista de produtos obtida do serviço 
  // ProdutoService. O método toSignal é usado para converter o Observable retornado pelo método 
  // listar() do ProdutoService em um sinal (signal). O valor inicial do sinal é uma lista vazia, 
  // e o finalize é usado para definir o sinal carregando como false quando a lista de produtos 
  // for carregada.
  private produtos = toSignal<Produto[], Produto[]>(this.produtoService.listar().pipe(finalize(() => this.carregando.set(false))), { initialValue: [] });

  // Criação de um sinal (signal) que representa se apenas produtos em promoção devem ser exibidos.
  apenasPromo = signal(false);

  // Criação de um sinal (signal) computado que filtra a lista de produtos com base no valor do 
  // sinal apenasPromo.
  produtosExibidos = computed(() =>
    this.apenasPromo()
    ? this.produtos().filter(p => p.promo)
    : this.produtos()
  );

  // Método para alternar o valor do sinal apenasPromo, permitindo que o usuário filtre os 
  // produtos exibidos.
  altenarPromo(){
    this.apenasPromo.update(v => !v);
  }

  // Método chamado quando o usuário deseja visualizar um produto específico. Exibe um alerta
  onViewProduct(id: number) {
    alert(`Visualizando produto id: ${id}`);
  }

  // Método chamado quando o usuário deseja adicionar um produto ao carrinho. Exibe um alerta  
  onAddProduct(produto: {id: number, qtd: number}) {
    alert(`Adicionando produto id: ${produto.id} | Quantidade: ${produto.qtd}`);
  }
}

