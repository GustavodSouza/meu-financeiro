export class DataUtil {

  static formatarData(data: Date): { mes_ref: string; ano_ref: number; dt_reg: string } {
    return {
      mes_ref: this.capitalize(data.toLocaleString('pt-BR', { month: 'long' })),
      ano_ref: data.getFullYear(),
      dt_reg: data.toISOString()
    }
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static qtdDiasMes(data: Date = new Date()): number {
    return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
  }
}
