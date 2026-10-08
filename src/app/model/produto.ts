const estados = ['novo', 'usado', 'esgotado'] as const; // Definindo os estados possíveis para 
// os produtos

// Interface Produto define a estrutura de um produto, incluindo propriedades como id, nome, 
// preço, descrição, URL da imagem, se está em promoção e seu estado (novo, usado ou esgotado).
export interface Produto {
    id: number;
    nome: string;
    preco: number;
    descricao: string;
    imageUrl?: string;
    promo?: boolean;
    estado?: 'novo' | 'usado' | 'esgotado';
    categoria: string;
}

// A classe ProdutoMapper fornece métodos estáticos para converter entre objetos JSON e 
// instâncias da interface Produto. O método fromJson cria um objeto Produto a partir de um 
// JSON, atribuindo valores às propriedades e determinando aleatoriamente o estado do produto. 
// O método toJson é definido, mas ainda não implementado, e deve ser usado para converter um 
// objeto Produto de volta para JSON.
export class ProdutoMapper {
    // Usamos static para que o método possa ser chamado sem a necessidade de instanciar a 
    // classe ProdutoMapper. 
    static fromJson(json: any): Produto {

        // Seleciona aleatoriamente um estado para o produto a partir do array de estados 
        // definidos.
        let _estado = estados[Math.floor(Math.random() * estados.length)];
        return {
            id: json.id,
            nome: json.title,
            preco: json.price,
            descricao: json.description,
            imageUrl: json.image,
            promo: json.id % 5 === 0 && _estado !== 'esgotado',
            estado: _estado,
            categoria: json.category
        }
    }

    // Usamos static para que o método possa ser chamado sem a necessidade de instanciar a 
    // classe ProdutoMapper.
    static toJson(produto: Produto): any {
        return {
            id: produto.id,
            title: produto.nome,
            price: produto.preco,
            description: produto.descricao,
            image: produto.imageUrl,
            category: 'produto.categoria'
        }
    }
}