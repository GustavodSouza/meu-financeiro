import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataUtil } from '../../utils/data.util';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';

import { CurrencyPipe } from '@angular/common';
import { DespesasService, NovaDespesa as NovaDespesaDados } from '../../services/despesas.service';
import { OrcamentosService } from '../../services/orcamentos.service';
import { Despesa } from '../../models/despesa.model';
import { CardPorCategoria } from './cards/card-por-categoria/card-por-categoria';
import { CardUltimasDespesas } from './cards/card-ultimas-despesas/card-ultimas-despesas';
import { NovaDespesa } from '../../components/common/dialog/templates/nova-despesa/nova-despesa';
import { Dialog } from '../../components/common/dialog/dialog';
import { BrDateAdapter } from '../../adapters/br-date-adapter';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    CurrencyPipe,
    CardPorCategoria,
    CardUltimasDespesas,
    NovaDespesa,
    MatSnackBarModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: BrDateAdapter },
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard implements OnInit {
  @ViewChild(NovaDespesa)
  novaDespesaCmp!: NovaDespesa;

  @ViewChild(CardUltimasDespesas)
  cardUltimasDespesas!: CardUltimasDespesas;

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
      return diasRestantes ? Math.max(this.orcamentoRestante(), 0) / diasRestantes : 0;
    });

  private despesaService = inject(DespesasService);
  private orcamentosService = inject(OrcamentosService);

  private breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false }
  );
  private readonly _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);

  dialogRef?: MatDialogRef<Dialog>;

  public formDespesas = new FormGroup({
    id: new FormControl(''),
    descricao: new FormControl('', [Validators.required]),
    data: new FormControl<Date | null>(null, [Validators.required]),
    preco: new FormControl(0, [Validators.required]),
    categoria: new FormControl('', [Validators.required]),
    observacao: new FormControl(''),
  });

  public projecaoConfiavel = computed(() => !this.periodoEhAtual || this.diasDecorridos() >= 5);

  public despesas = signal<Despesa[]>([]);

  ngOnInit(): void {
    this.carregarDespesas(new Date());
  }

  public retrocederMes(): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() - 1, 1);
    this.carregarDespesas(this.periodoSelecionado);
  }

  public avancarMes(): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() + 1, 1);
    this.carregarDespesas(this.periodoSelecionado);
  }

  openDialog(): void {
    this.formDespesas.reset({ id: '', preco: 0 });

    this.dialogRef = this.dialog.open(Dialog, {
      width: '600px',
      data: {
        titulo: 'Nova Despesa',
        content: this.novaDespesaCmp.formTemplate,
        buttons: this.novaDespesaCmp.buttonsTemplate
      },
    });
  }

  closeDialog(): void {
    this.dialogRef?.close();
  }

  async salvarDespesa(): Promise<void> {
    if (this.formDespesas.invalid) {
      this.formDespesas.markAllAsTouched();
      return;
    }

    const { descricao, categoria, data, preco, observacao } = this.formDespesas.getRawValue();

    const novaDespesa: NovaDespesaDados = {
      descricao: descricao!,
      categoria: categoria!,
      data: data!,
      preco: preco!,
      observacao: observacao ?? ''
    };

    await this.despesaService.addDespesa(novaDespesa).then(() => {
      this._snackBar.open('Despesa adicionada com sucesso!', 'Fechar', { duration: 4000 });
    }).catch((error) => {
      console.error('Erro ao adicionar despesa:', error);
      this._snackBar.open('Erro ao adicionar despesa. Por favor, tente novamente.', 'Fechar', { duration: 4000 });
    });

    this.carregarDespesas(this.periodoSelecionado);
    this.cardUltimasDespesas.carregar();
    this.formDespesas.reset();
    this.closeDialog();
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

  private carregarDespesas(mesSelecionado: Date): void {
    this.despesaService.getDespesas(mesSelecionado).subscribe(({ totalAtual, despesas }) => {
      this.totalDespesa.set(totalAtual);
      this.despesas.set(despesas);
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
    let diasRestantes: number;

    if (this.periodoEhAtual) {
      diasDecorridos = hoje.getDate();                  // média: hoje conta como decorrido
      diasRestantes = totalDiasMes - hoje.getDate() + 1; // pode gastar: hoje ainda está disponível
    } else if (this.periodoSelecionado < hoje) {
      diasDecorridos = totalDiasMes;
      diasRestantes = 0;
    } else {
      diasDecorridos = 0;
      diasRestantes = totalDiasMes;
    }

    this.diasDecorridos.set(diasDecorridos);
    this.diasRestantesMes.set(diasRestantes);
    this.mediaDiaria.set(diasDecorridos ? this.totalDespesa() / diasDecorridos : 0);
    this.projecao.set(this.mediaDiaria() * totalDiasMes);
  }
}
