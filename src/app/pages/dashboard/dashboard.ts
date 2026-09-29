import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataUtil } from '../../utils/data.util';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CurrencyPipe } from '@angular/common';
import { DespesasService } from '../../services/despesas.service';
import { OrcamentosService } from '../../services/orcamentos.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    CurrencyPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard implements OnInit {

  public periodoSelecionado: Date = new Date();
  public totalDespesa = signal<number>(0);
  public orcamentoRestante = signal<number>(0);
  public orcamentoPadrao = signal<number>(0);
  public porcentagemValorConsumido = signal<number>(0);

  public diasRestantesMes = signal<number>(0);
  public diasDecorridos = signal<number>(0);
  public mediaDiaria = signal<number>(0);
  public projecao = signal<number>(0);
  public podeGastarDia = computed(() => {
    const diasRestantes = this.diasRestantesMes();
    return diasRestantes ? this.orcamentoRestante() / diasRestantes : 0;
  });

  private despesaService = inject(DespesasService);
  private orcamentosService = inject(OrcamentosService);

  ngOnInit(): void {
    this.carregarDespesas();
  }

  public retrocederMes(): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() - 1, 1);
  }

  public avancarMes(): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() + 1, 1);
  }

  get mesRef(): string {
    return DataUtil.formatarData(this.periodoSelecionado).mes_ref;
  }

  get anoRef(): number {
    return DataUtil.formatarData(this.periodoSelecionado).ano_ref;
  }

  get periodoEhAtual(): boolean {
    const hoje = new Date();
    return (
      this.periodoSelecionado.getMonth() === hoje.getMonth() &&
      this.periodoSelecionado.getFullYear() === hoje.getFullYear()
    );
  }

  public obterPercentualOrcamentoUtilizado(): number {
    const orcamento = this.orcamentoPadrao();
    if (!orcamento) return 0;

    this.porcentagemValorConsumido.set(Math.round((this.totalDespesa() / orcamento) * 100));

    return this.porcentagemValorConsumido();
  }

  // get corNegativa(): boolean {
  //   return this.percentualRelacaoMesAnterior() > 0;
  // }

  // get corPositiva(): boolean {
  //   return this.percentualRelacaoMesAnterior() < 0;
  // }

  // obterTotalDespesas(): number {
  //   return this.dataSource.data.reduce((total, despesa) => total + despesa.preco, 0);
  // }

  private carregarDespesas(): void {
    this.despesaService.getDespesas().subscribe(({ totalAtual }) => {
      this.totalDespesa.set(totalAtual);
      this.buscarOrcamentoPadrao();
      this.calcularDiasDoMes();
    })
  }

  buscarOrcamentoPadrao(): void {
    this.orcamentosService.buscaOrcamentoPadrao().subscribe((resp) => {
      const valorOrcamentoPadrao = resp?.valor || 0;
      this.orcamentoPadrao.set(valorOrcamentoPadrao);
      this.orcamentoRestante.set(valorOrcamentoPadrao - this.totalDespesa());
      this.obterPercentualOrcamentoUtilizado();
    });
  }

  private calcularDiasDoMes(): void {
    const hoje = new Date();
    const ano = this.periodoSelecionado.getFullYear();
    const mes = this.periodoSelecionado.getMonth();
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    let diasDecorridos: number;
    if (this.periodoEhAtual) {
      diasDecorridos = hoje.getDate();
    } else if (this.periodoSelecionado < hoje) {
      diasDecorridos = totalDiasMes;
    } else {
      diasDecorridos = 0;
    }

    this.diasDecorridos.set(diasDecorridos);
    this.diasRestantesMes.set(totalDiasMes - diasDecorridos);
    this.mediaDiaria.set(diasDecorridos ? this.totalDespesa() / diasDecorridos : 0);

    this.projecao.set(this.mediaDiaria() * totalDiasMes);
  }
}
