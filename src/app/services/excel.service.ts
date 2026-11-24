import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ColunaExcel<T> {
  /** Texto do cabeçalho da coluna na planilha. */
  cabecalho: string;
  /** Campo da linha que alimenta a coluna. */
  campo: keyof T;
  /** Converte o valor antes de ir para a célula (opcional). */
  formatar?: (valor: T[keyof T], linha: T) => string | number | Date | null | undefined;
  /** Formato numérico do Excel, ex.: '"R$" #,##0.00' (opcional). */
  formatoNumero?: string;
  /** Largura da coluna em caracteres (opcional; calculada pelo conteúdo se omitida). */
  largura?: number;
}

export interface OpcoesExportacaoExcel {
  nomeArquivo?: string;
  nomePlanilha?: string;
}

export const FORMATO_MOEDA_BRL = '"R$" #,##0.00';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  exportToExcel<T extends object>(
    dados: readonly T[],
    colunas: readonly ColunaExcel<T>[],
    { nomeArquivo = 'relatorio', nomePlanilha = 'Dados' }: OpcoesExportacaoExcel = {}
  ): void {
    const cabecalhos = colunas.map(coluna => coluna.cabecalho);
    const linhas = dados.map(linha =>
      colunas.map(coluna => {
        const valor = linha[coluna.campo];
        return coluna.formatar ? coluna.formatar(valor, linha) : valor;
      })
    );

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([cabecalhos, ...linhas]);

    this.aplicarFormatosNumericos(worksheet, colunas, linhas.length);

    worksheet['!cols'] = colunas.map((coluna, indice) => ({
      wch: coluna.largura ?? this.calcularLargura(cabecalhos[indice], linhas.map(linha => linha[indice])),
    }));

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nomePlanilha);

    const buffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(blob, `${nomeArquivo}.xlsx`);
  }

  private aplicarFormatosNumericos<T>(
    worksheet: XLSX.WorkSheet,
    colunas: readonly ColunaExcel<T>[],
    totalLinhas: number
  ): void {
    colunas.forEach((coluna, c) => {
      if (!coluna.formatoNumero) return;

      // A linha 0 é o cabeçalho; os dados começam na linha 1.
      for (let r = 1; r <= totalLinhas; r++) {
        const celula = worksheet[XLSX.utils.encode_cell({ r, c })];
        if (celula?.t === 'n') {
          celula.z = coluna.formatoNumero;
        }
      }
    });
  }

  private calcularLargura(cabecalho: string, valores: unknown[]): number {
    const maior = valores.reduce<number>(
      (max, valor) => Math.max(max, String(valor ?? '').length),
      cabecalho.length
    );
    return Math.min(maior + 2, 60);
  }
}
