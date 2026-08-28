import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { Footer } from "./core/footer/footer";
import { Banner } from "./core/banner/banner";
import { QuantidadeControle } from "./shared/quantidade-controle/quantidade-controle";
import { Produto } from './model/produto';
import { CardProduto } from "./features/produtos/card-produto/card-produto";
import { ListaProdutos } from "./features/produtos/lista-produtos/lista-produtos";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Banner, QuantidadeControle, CardProduto, ListaProdutos],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Loja TP1 2026');
  sobre?: string;

  receberSobre(msg: string): void{
    this.sobre = msg;
  }

}
