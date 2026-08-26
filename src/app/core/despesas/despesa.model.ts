export interface Despesa {
  id: string;
  descricao: string;
  categoria?: string;
  data: Date;
  preco: number;
  observacao?: string;
}
