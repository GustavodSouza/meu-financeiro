import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Observable } from 'rxjs';

import { BrDateAdapter } from '../../adapters/br-date-adapter';
import { Dialog } from '../../components/common/dialog/dialog';
import { DeletarDespesa } from '../../components/common/dialog/templates/deletar-despesa/deletar-despesa';
import { NovaDespesa as NovaDespesaComponent } from '../../components/common/dialog/templates/nova-despesa/nova-despesa';
import { PeriodicElement, Tabela } from '../../components/common/tabela/tabela';
import { Despesa } from '../../models/despesa.model';
import { DespesasService, NovaDespesa } from '../../services/despesas.service';
import { DataUtil } from '../../utils/data.util';

@Component({
  selector: 'app-despesas',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    CurrencyPipe,
    MatTooltipModule,
    MatSnackBarModule,
    Tabela,
    NovaDespesaComponent,
    DeletarDespesa,
  ],
  templateUrl: './despesas.html',
  styleUrl: './despesas.scss',
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: BrDateAdapter },
  ],
  standalone: true
})
export class Despesas implements OnInit {
  @ViewChild(NovaDespesaComponent)
  novaDespesaCmp!: NovaDespesaComponent;

  @ViewChild(DeletarDespesa)
  deletarDespesaCmp!: DeletarDespesa;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly despesaService = inject(DespesasService);
  private readonly _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<PeriodicElement>([]);
  dialogRef?: MatDialogRef<Dialog>;

  readonly isMobile = signal(false);
  readonly totalDespesasMesAnterior = signal(0);
  readonly percentualRelacaoMesAnterior = signal(0);
  readonly mesAnterior = signal('');

  public formDespesas: FormGroup = new FormGroup({});
  public periodoSelecionado: Date = new Date();
  public despesaExcluir: PeriodicElement | null = null;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.formDespesas = this.formBuilder.group({
      id: new FormControl(''),
      descricao: new FormControl('', [Validators.required]),
      data: new FormControl('', [Validators.required]),
      preco: new FormControl(0, [Validators.required]),
      categoria: new FormControl('', [Validators.required]),
      observacao: new FormControl(''),
    });
  }

  async ngOnInit(): Promise<void> {
    this.carregarDespesas();

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  private carregarDespesas(): void {
    this.despesaService.getDespesas(this.periodoSelecionado).subscribe(({ despesas, totalAtual, totalMesAnterior }) => {
      this.dataSource.data = despesas.map(despesa => ({
        id: despesa.id,
        descricao: despesa.descricao,
        data: new Date(despesa.data).toLocaleDateString('pt-BR'),
        preco: despesa.preco,
        categoria: despesa.categoria
      }));

      this.totalDespesasMesAnterior.set(totalMesAnterior);

      this.calcularPercentualRelacaoMesAnterior(totalAtual, totalMesAnterior);

      this.obtemMesAnteriorExtenso();
    });
  }

  private calcularPercentualRelacaoMesAnterior(totalDespesasAtual: number, totalDespesasMesAnterior: number): void {
    const totalPorcentagem: number = (totalDespesasAtual - totalDespesasMesAnterior) / (totalDespesasMesAnterior || 1) * 100;

    this.percentualRelacaoMesAnterior.set(parseFloat(totalPorcentagem.toFixed(2)));
  }

  private obtemMesAnteriorExtenso(): void {
    const mesAnterior = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() - 1, 1);

    const mes = mesAnterior.toLocaleDateString('pt-BR', {
      month: 'long'
    });

    this.mesAnterior.set(mes.charAt(0).toUpperCase() + mes.slice(1));
  }

  private buscarDespesasPorId(id: string): Observable<Despesa | null> {
    return this.despesaService.getDespesasById(id);
  }

  onAnoSelecionado(ano: Date): void {
    this.periodoSelecionado = new Date(ano.getFullYear(), this.periodoSelecionado.getMonth(), 1);
  }

  onMesSelecionado(mes: Date, datepicker: MatDatepicker<Date>): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), mes.getMonth(), 1);
    datepicker.close();
    this.carregarDespesas();
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

  openDialogEditar(id: string): void {
    this.buscarDespesasPorId(id).subscribe((despesa) => {
      if (!despesa) {
        return;
      }

      this.formDespesas.patchValue({
        id: despesa.id,
        descricao: despesa.descricao,
        categoria: despesa.categoria,
        data: despesa.data,
        preco: despesa.preco,
        observacao: despesa.observacao,
      });

      this.dialogRef = this.dialog.open(Dialog, {
        width: '600px',
        data: {
          titulo: 'Editar Despesa',
          content: this.novaDespesaCmp.formTemplate,
          buttons: this.novaDespesaCmp.buttonsTemplate
        },
      });
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

    const { descricao, categoria, data, preco, observacao } = this.formDespesas.value;

    const novaDespesa: NovaDespesa = { descricao, categoria, data, preco, observacao };

    await this.despesaService.addDespesa(novaDespesa).then(() => {
      this._snackBar.open('Despesa adicionada com sucesso!', 'Fechar', { duration: 4000 });
    }).catch((error) => {
      console.error('Erro ao adicionar despesa:', error);
      this._snackBar.open('Erro ao adicionar despesa. Por favor, tente novamente.', 'Fechar', { duration: 4000 });
    });

    this.carregarDespesas();
    this.formDespesas.reset();
    this.closeDialog();
  }

  async editarDespesa(): Promise<void> {
    if (this.formDespesas.invalid) {
      this.formDespesas.markAllAsTouched();
      return;
    }

    const { id, descricao, categoria, data, preco, observacao } = this.formDespesas.value;

    const despesaAtualizada: NovaDespesa = { descricao, categoria, data, preco, observacao };

    await this.despesaService.updateDespesa(id, despesaAtualizada).then(() => {
      this._snackBar.open('Despesa atualizada com sucesso!', 'Fechar', { duration: 4000 });
    }).catch((error) => {
      console.error('Erro ao atualizar despesa:', error);
      this._snackBar.open('Erro ao atualizar despesa. Por favor, tente novamente.', 'Fechar', { duration: 4000 });
    });

    this.carregarDespesas();
    this.formDespesas.reset();
    this.closeDialog();
  }

  resetarPeriodo(): void {
    this.periodoSelecionado = new Date();
    this.carregarDespesas();
  }

  openDialogExcluir(despesa: PeriodicElement): void {
    this.despesaExcluir = despesa;

    // Garante que o @Input() despesa do DeletarDespesa já esteja atualizado
    // antes do MatDialog renderizar o conteúdo (ver contentTemplate/buttonsTemplate).
    this.changeDetectorRef.detectChanges();

    this.dialogRef = this.dialog.open(Dialog, {
      width: '400px',
      data: {
          titulo: 'Excluir Despesa',
          content: this.deletarDespesaCmp.contentTemplate,
          buttons: this.deletarDespesaCmp.buttonsTemplate,
          edit: true
        },
      });
  }

  excluirDespesa(): void {
    if (!this.despesaExcluir) {
      return;
    }

    this.despesaService.deleteDespesa(this.despesaExcluir.id).then(() => {
      this.carregarDespesas();
      this.closeDialog();
      this.despesaExcluir = null;
      this._snackBar.open('Despesa deletada com sucesso!', 'Fechar', { duration: 4000 });
    }).catch((error) => {
      console.error('Erro ao deletar despesa:', error);
      this._snackBar.open('Erro ao deletar despesa. Por favor, tente novamente.', 'Fechar', { duration: 4000 });
    });
  }

  obterTotalDespesas(): number {
    return this.dataSource.data.reduce((total, despesa) => total + despesa.preco, 0);
  }

  obterValorMaiorDespesa(): number {
    return this.dataSource.data.reduce((maior, despesa) => Math.max(maior, despesa.preco), 0);
  }

  obterValorMenorDespesa(): number {
    return this.dataSource.data.reduce((menor, despesa) => Math.min(menor, despesa.preco), Infinity);
  }

  obterMaiorDespesa(): PeriodicElement | undefined {
    return this.dataSource.data.reduce((maior, despesa) => {
      return despesa.preco > (maior?.preco ?? 0) ? despesa : maior;
    }, undefined as PeriodicElement | undefined);
  }

  obterMenorDespesa(): PeriodicElement | undefined {
    return this.dataSource.data.reduce((menor, despesa) => {
      return despesa.preco < (menor?.preco ?? Infinity) ? despesa : menor;
    }, undefined as PeriodicElement | undefined);
  }

  obterMediaDespesas(): string {
    const totalGastos = this.obterTotalDespesas();

    const hoje = new Date();
    const totalDias = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

    return Number(totalGastos / totalDias).toFixed(2);
  }

  copyValue(value: number): void {
    const input = document.createElement('input');
    input.value = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    this._snackBar.open('Valor copiado!', 'Fechar', { duration: 4000 });
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

  get corNegativa(): boolean {
    return this.percentualRelacaoMesAnterior() > 0;
  }

  get corPositiva(): boolean {
    return this.percentualRelacaoMesAnterior() < 0;
  }
}
