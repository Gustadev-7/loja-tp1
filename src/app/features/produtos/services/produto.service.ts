import { inject, Injectable } from '@angular/core';
import { LoggerService } from '../../../core/services/logger/logger.service';
import { Produto, ProdutoMapper } from '../../../model/produto';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, delay, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class ProdutoService {
  
  // Injeção do serviço LoggerService para registrar mensagens de log.
  private logger = inject(LoggerService);

  // Injeção do serviço HttpClient para realizar requisições HTTP.
  private http = inject(HttpClient);

  // URL da API de produtos, utilizada para buscar dados de produtos de forma remota.
  private apiUrl = 'https://fakestoreapi.com/products';

  // O método listar retorna um Observable contendo a lista de produtos obtida 
  // da API remota. Ele utiliza o serviço HttpClient para fazer uma requisição 
  // GET à URL da API, mapeando os dados recebidos para instâncias da interface 
  // Produto usando o ProdutoMapper. Caso ocorra algum erro durante a requisição,
  // ele captura o erro e retorna um Observable com uma lista vazia.
  listar(): Observable<Produto[]> {
    this.logger.info("[PRODUTO SERVICE] - Retornando lista de produtos");
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(lista => lista.map(prod => ProdutoMapper.fromJson(prod))),
      catchError(erro => {
        this.logger.error("[PRODUTO SERVICE] - Erro ao buscar lista de produtos");
        return of([]);
      })
    );
  }

  // Método getById que recebe um id de produto e retorna um Observable contendo o produto correspondente
  // da lista mockada. Se o produto não for encontrado, retorna undefined. A busca pelo produto é
  // feita utilizando o método find do array, que percorre a lista de produtos e retorna o primeiro
  // produto que possui o id correspondente. O resultado é retornado com um atraso de 500 milissegundos
  // para simular uma chamada assíncrona.
  getById(id: number): Observable<Produto | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(prod => ProdutoMapper.fromJson(prod)),
      catchError(erro => {
        this.logger.error("[PRODUTO SERVICE] - Erro ao buscar produto por ID");
        return of(undefined);
      })
    );
  }

  // O método criar recebe um objeto Produto e realiza uma requisição POST para a API remota, enviando os dados 
  // do produto convertidos para JSON utilizando o ProdutoMapper. O método retorna um Observable contendo a 
  // resposta da API, que pode ser utilizada para verificar se o produto foi criado com sucesso ou para tratar 
  // possíveis erros.
  criar(produto: Produto): Observable<any> {
    return this.http.post<any>(this.apiUrl, ProdutoMapper.toJson(produto));
  }
}
