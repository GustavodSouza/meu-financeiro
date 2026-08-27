export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

export type Categorias = Array<Categoria>;
