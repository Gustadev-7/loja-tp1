import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProdutoService } from '../services/produto.service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Produto } from '../../../model/produto';
import { finalize } from 'rxjs/internal/operators/finalize';


// O componente ProdutoForm é responsável por exibir um formulário para criação de novos produtos. 
// Ele utiliza o serviço ProdutoService para interagir com a API de produtos e o Router para navegação 
// entre páginas. A propriedade enviando é um sinal que indica se o formulário está em processo de 
// envio, permitindo desabilitar o botão de envio enquanto a requisição está em andamento.
@Component({
  selector: 'app-produto-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css',
})
export class ProdutoForm {

  private produtoService = inject(ProdutoService);
  public router = inject(Router);

  // O sinal enviando é utilizado para controlar o estado do envio do formulário. Quando o usuário 
  // clica no botão de envio, o sinal é definido como true, desabilitando o botão e evitando múltiplos 
  // envios. Após a conclusão da requisição, o sinal é redefinido para false, permitindo que o usuário 
  // envie novamente se necessário.
  enviando = signal(false);
  mensagem = signal('');
  novaCategoria = signal('');

  private produtos = toSignal(this.produtoService.listar(), {initialValue: []}); // Converte o 
  // Observable retornado pelo serviço em um sinal reativo, permitindo que o componente reaja a 
  // mudanças na lista de produtos.
  
  // Categorias é uma propriedade computada que gera uma lista de categorias únicas a partir dos produtos
  // disponíveis. Ela mapeia os produtos para suas categorias, filtra valores nulos ou indefinidos e 
  // cria um conjunto de categorias únicas, que é então convertido de volta para um array.
  categorias = computed(() => {
    const lista = this.produtos().map(p => p.categoria).filter (Boolean);
    const unicas = Array.from(new Set(lista));
    return [...unicas, 'Outra'];
  });

  // A propriedade categoriaSelecionada é um sinal que armazena a categoria atualmente selecionada 
  // pelo usuário no formulário.
  categoriaSelecionada = signal('');

  // A propriedade mostrarNovaCategoria é uma propriedade computada que determina se o campo para
  // inserir uma nova categoria deve ser exibido. Ela retorna true se a categoria selecionada for 'Outra',
  // permitindo que o usuário insira uma nova categoria personalizada.
  mostrarNovaCategoria = computed(() => this.categoriaSelecionada() === 'Outra');

  // O objeto novoProduto é uma instância da interface Produto, inicializada com valores padrão. Ele
  // é utilizado para vincular os campos do formulário aos dados do novo produto que será criado.
  novoProduto: Produto = {
    id: 0,
    nome: '',
    preco: 0,
    descricao: '',
    imageUrl: '',
    categoria: '',
  }

  // O método onSubmit é chamado quando o formulário é enviado. Ele verifica se o formulário é válido e,
  // caso contrário, define uma mensagem de erro. Se o formulário for válido, ele atualiza a categoria
  // do novo produto com base na seleção do usuário e chama o serviço para criar o produto. Durante o
  // processo de envio, o sinal enviando é definido como true para desabilitar o botão de envio.
  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.mensagem.set("Preencha todos os campos");
      return;
    }

    this.novoProduto.categoria = this.categoriaSelecionada() === 'Outra'
      ? this.novaCategoria()
      : this.categoriaSelecionada();

      this.enviando.set(true);
      this.mensagem.set("Enviando produto...");

      this.produtoService.criar(this.novoProduto).pipe(
        finalize(() => this.enviando.set(false))
      ).subscribe(
        {
          next: (resp) => {
            this.mensagem.set("Produto cadastrado com sucesso!");
            form.resetForm();
            setTimeout(() => this.router.navigate(['/produtos']), 1200);
          },
          error: (err) => {
            this.mensagem.set("Erro ao cadastrar produto!" + err);
          }
        }

      )

  }

}
