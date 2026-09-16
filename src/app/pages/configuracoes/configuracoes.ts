import { Component, inject, OnInit, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../app/directives/currency-mask.directive';
import { OrcamentosService } from '../../services/orcamentos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataUtil } from '../../utils/data.util';
import { DespesasService } from '../../services/despesas.service';

@Component({
  selector: 'app-configuracoes',
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyMaskDirective
  ],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit {
  public orcamentoPadrao = signal(0);
  private totalDespesas = signal(0);

  // Injects
  private readonly _snackBar = inject(MatSnackBar);
  private orcamentosService = inject(OrcamentosService);
  private despesaService = inject(DespesasService);

  ngOnInit(): void {
    this.buscarOrcamentoPadrao();
    this.buscarTotalDespesas();
  }

  buscarOrcamentoPadrao(): void {
    this.orcamentosService.buscaOrcamentoPadrao().subscribe((resp) => {
      this.orcamentoPadrao.set(resp?.valor || 0);
    });
  }

  buscarTotalDespesas(): void {
    this.despesaService.getDespesas().subscribe(({ totalAtual }) => {
      this.totalDespesas.set(totalAtual);
    })
  }

  salvarAlteracoes(): void {
    if (this.orcamentoPadrao() !== 0) {
      this.cadastrarOrcamentoPadrao();
    }
  }

  cadastrarOrcamentoPadrao(): void {
    this.orcamentosService.salvarOrcamentoPadrao(this.orcamentoPadrao()).then(() => {
      this._snackBar.open('Orçamento Padrão criado com sucesso!', 'Fechar', { duration: 4000 });
    }).catch((error) => {
      console.error('Erro ao criar Orçamento:', error);
      this._snackBar.open('Erro ao criar o Orçamento. Por favor, tente novamente.', 'Fechar', { duration: 4000 });
    });
  }

  get valorPorDia(): string {
    return Number(this.orcamentoPadrao() / DataUtil.qtdDiasMes()).toFixed(2);
  }

  get valorPorSemana(): string {
    return Number(Number(this.valorPorDia) * 7).toFixed(2);
  }

  get gastoEmPorcentagem(): string {
    const orcamento = this.orcamentoPadrao();

    if (!orcamento) {
      return '0.00';
    }

    return ((this.totalDespesas() / orcamento) * 100).toFixed(2);
  }
}
