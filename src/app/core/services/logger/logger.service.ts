import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

// Classe LoggerService que fornece métodos para registrar mensagens de log no console. 
// Possui três métodos: info, warn e error, que registram mensagens de informação, aviso 
// e erro, respectivamente. Cada método aceita uma mensagem (msg) e um parâmetro opcional ]
// (extra) que pode ser usado para fornecer informações adicionais. Se o parâmetro extra não 
// for fornecido, ele será substituído por uma string vazia.
export class LoggerService {
  
  info(msg: string, extra?: unknown) {
    console.info(msg, extra ?? '');
  }

  warn(msg: string, extra?: unknown) {
    console.info(msg, extra ?? '');
  }

  error(msg: string, extra?: unknown) {
    console.info(msg, extra ?? '');
  }

}
