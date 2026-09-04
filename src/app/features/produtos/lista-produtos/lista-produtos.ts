import { Component, computed, inject, signal } from '@angular/core';
import { Produto } from '../../../model/produto';
import { CardProduto } from "../card-produto/card-produto";
import { ProdutoService } from '../services/produto.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-lista-produtos',
  imports: [CardProduto],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css',
})
export class ListaProdutos {

  // Injeção do serviço ProdutoService para obter a lista de produtos.
  private produtoService = inject(ProdutoService);

  // Criação de um sinal (signal) que representa a lista de produtos obtida do serviço ProdutoService.
  // O sinal é inicializado com um valor vazio e será atualizado quando a lista de produtos for carregada.
  // O método toSignal é usado para converter o Observable retornado pelo método listar() do serviço 
  // ProdutoService em um sinal (signal).
  private produtos = toSignal<Produto[], Produto[]>(this.produtoService.listar(), { initialValue: [] });

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

