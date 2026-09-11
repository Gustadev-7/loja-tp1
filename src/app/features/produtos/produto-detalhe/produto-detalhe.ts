import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '../services/produto.service';
import { Produto } from '../../../model/produto';
import { DescontoPipe } from '../../../shared/pipes/desconto-pipe';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-produto-detalhe',
  imports: [DescontoPipe, CurrencyPipe],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css',
})
export class ProdutoDetalhe {
  // Injeção dos serviços Router, ActivatedRoute e ProdutoService para navegação, 
  // obtenção de parâmetros de rota e acesso aos dados dos produtos.
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produtoService = inject(ProdutoService);

  // Sinais (signals) para controlar o estado de carregamento e armazenar o 
  // produto atual.
  carregando = signal(true);
  produto = signal<Produto | undefined>(undefined);

  // Construtor da classe ProdutoDetalhe, onde é feita a inscrição no paramMap da rota para obter o ID do produto.
  constructor() {
    // Inscrição no paramMap da rota para obter o ID do produto a ser exibido.
    this.route.paramMap.subscribe( pm => {
      // Obtém o ID do produto a partir dos parâmetros da rota.
      const id = pm.get('id') ? Number(pm.get('id')) : NaN;
      // Verifica se o ID é um número válido
      if (isNaN(id)) {
        this.produto.set(undefined); // Define o produto como indefinido e encerra o carregamento.
        this.carregando.set(false); // Define o estado de carregamento como falso.
        return;
      }
      // Se o ID for válido
      this.carregando.set(true); // Define o estado de carregamento como verdadeiro.
      // Chama o serviço ProdutoService para obter o produto pelo ID.
      this.produtoService.getById(id).subscribe( p => {
        this.produto.set(p); // Define o produto obtido no sinal produto.
        this.carregando.set(false); // Define o estado de carregamento como falso após a obtenção do produto.
      });
    });
  }

  // Função para navegar de volta para a lista de produtos.
  voltar() {
    this.router.navigateByUrl('/produtos'); // Navega de volta para a lista de produtos.
    this.router.navigate(['/produtos']); // Navega de volta para a lista de produtos (alternativa).
  }

}
