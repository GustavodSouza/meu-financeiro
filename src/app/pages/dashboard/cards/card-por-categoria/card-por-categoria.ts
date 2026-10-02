import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';

import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import { Despesa } from '../../../../models/despesa.model';
import { Categoria } from '../../../../models/categoria.model';
import { CategoriasService } from '../../../../services/categorias.service';

interface GastosPorCategoria {
  categoria: string,
  valor: number,
  cor: string
}

// Paleta padrão do ECharts, usada para categorias sem cor cadastrada.
// A cor precisa ser definida aqui porque a legenda é renderizada no HTML, fora do gráfico.
const PALETA_PADRAO = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

@Component({
  selector: 'app-card-por-categoria',
  imports: [
    MatCardModule,
    CurrencyPipe,
    NgxEchartsDirective
  ],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './card-por-categoria.html',
  styleUrl: './card-por-categoria.scss',
  host: { class: 'flex flex-1' }
})
export class CardPorCategoria {

  public despesas = input<Despesa[]>([]);

  private categoriasService = inject(CategoriasService);
  private breakpointObserver = inject(BreakpointObserver);

  public isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false }
  );
  private categorias = toSignal(this.categoriasService.getCategorias(), { initialValue: [] });

  public gastosPorCategoria = computed(() => this.agruparPorCategoria(this.despesas(), this.categorias()));
  public option = computed(() => this.montarGrafico(this.gastosPorCategoria()));

  private agruparPorCategoria(despesas: Despesa[], categorias: Categoria[]): GastosPorCategoria[] {
    const totais = new Map<string, number>();

    for (const despesa of despesas) {
      const id = despesa.categoria ?? '';
      totais.set(id, (totais.get(id) ?? 0) + despesa.preco);
    }

    return [...totais.entries()]
      .map(([id, valor]) => {
        const categoria = categorias.find(c => c.id === id);
        return {
          categoria: categoria?.nome ?? 'Outros',
          valor,
          cor: categoria?.cor ?? ''
        };
      })
      .sort((a, b) => b.valor - a.valor)
      .map((gasto, i) => ({ ...gasto, cor: gasto.cor || PALETA_PADRAO[i % PALETA_PADRAO.length] }));
  }

  private montarGrafico(gastos: GastosPorCategoria[]): EChartsOption {
    const dados = gastos.map(({ categoria, valor, cor }) => ({
      name: categoria,
      value: valor,
      itemStyle: { color: cor }
    }));

    return {
      tooltip: {
        trigger: 'item',
        valueFormatter: (valor) => this.formatarMoeda(Number(valor))
      },
      series: [
        {
          name: 'Por categoria',
          type: 'pie',
          radius: ['50%', '85%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: dados
        }
      ]
    };
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
