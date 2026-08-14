import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  titulo = input.required<string>(); // Chamada de API
  textosobre = output<string>(); // Chamada de API

  enviarSobre(): void {
    this.textosobre.emit('Técnincas de Programação I.\nDesenvolvido por Gustavo')
  }

  exibirMensagem(msg: string): void {
    alert(msg);
  }

}
