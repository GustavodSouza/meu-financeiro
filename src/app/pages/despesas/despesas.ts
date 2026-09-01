import { AfterViewInit, Component, inject, TemplateRef, ViewChild, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { Dialog } from '../../components/common/dialog/dialog';
import { CurrencyMaskDirective } from '../../directives/currency-mask.directive';
import { BrDateAdapter } from '../../adapters/br-date-adapter';
import { DespesasService, NovaDespesa } from '../../services/despesas.service';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CategoriasService } from '../../services/categorias.service';
import { Categorias } from '../../models/categoria.model';
import { DataUtil } from '../../utils/data.util';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Despesa } from '../../models/despesa.model';
import { Observable } from 'rxjs';


export interface PeriodicElement {
  id: string;
  descricao: string;
  data: string;
  preco: number;
  acoes?: string;
}

@Component({
  selector: 'app-despesas',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginator,
    MatPaginatorModule,
    MatCardModule,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    CurrencyPipe,
    CurrencyMaskDirective,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule
],
  templateUrl: './despesas.html',
  styleUrl: './despesas.scss',
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: BrDateAdapter },
  ],
  standalone: true
})
export class Despesas implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('novaDespesa')
  novaDespesa!: TemplateRef<any>;

  @ViewChild('excluirDespesaTemplate')
  excluirDespesaTemplate!: TemplateRef<any>;

  @ViewChild('botoes')
  botoes!: TemplateRef<any>;

  @ViewChild('botoesExcluir')
  botoesExcluir!: TemplateRef<any>;

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['descricao', 'data', 'preco', 'acoes'];
  filterColumns: string[] = ['descricao-filtro', 'data-filtro', 'preco-filtro', 'acoes-filtro'];
  dataSource = new MatTableDataSource<PeriodicElement>([]);

  trackBy = (index: number, el: PeriodicElement) => el.descricao;

  readonly isMobile = signal(false);

  filtros = {
    descricao: '',
    data: '',
    preco: '',
  };

  readonly dialog = inject(MatDialog);
  dialogRef?: MatDialogRef<Dialog>;

  private _liveAnnouncer = inject(LiveAnnouncer);

  private readonly breakpointObserver = inject(BreakpointObserver);

  private despesaService = inject(DespesasService);
  private categoriaService = inject(CategoriasService);

  public categorias: Categorias = [];

  public formDespesas: FormGroup = new FormGroup({});

  public periodoSelecionado: Date = new Date();

  public despesaExcluir: Despesa | null = null;

  public totalDespesasMesAnterior = signal(0);
  public percentualRelacaoMesAnterior = signal(0);
  public mesAnterior = signal('');

  constructor (
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async ngOnInit(): Promise<void> {
    this.dataSource.filterPredicate = (element, filter) => {
      const filtros = JSON.parse(filter) as typeof this.filtros;
      return (
        element.descricao.toLowerCase().includes(filtros.descricao.trim().toLowerCase()) &&
        element.data.includes(filtros.data.trim()) &&
        element.preco.toString().includes(filtros.preco.trim())
      );
    };

    this.carregarDespesas();

    this.categoriaService.getCategorias().subscribe((categorias) => {
      this.categorias = categorias;
    });

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  aplicarFiltro(): void {
    this.dataSource.filter = JSON.stringify(this.filtros);
  }

  private carregarDespesas(): void {
    this.despesaService.getDespesas(this.periodoSelecionado).subscribe((despesas) => {
      this.dataSource.data = despesas.map(despesa => ({
        id: despesa.id,
        descricao: despesa.descricao,
        data: new Date(despesa.data).toLocaleDateString('pt-BR'),
        preco: despesa.preco,
        categoria: despesa.categoria
      }));

      this.obterDespesasMesAnterior();
    });
  }

  private obterDespesasMesAnterior(): void {
    const mesAnterior = new Date(this.periodoSelecionado);
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);

    this.despesaService.getDespesas(mesAnterior).subscribe((despesas: Despesa[]) => {
      const totalMesAnterior = despesas.reduce((acc, despesa) => acc + despesa.preco, 0);

      this.totalDespesasMesAnterior.set(totalMesAnterior);

      this.calcularPercentualRelacaoMesAnterior(totalMesAnterior, despesas);
    });
  }

  private calcularPercentualRelacaoMesAnterior(totalDespesasMesAnterior: number, despesas: Despesa[]): void {
    const totalDespesasAtual = this.obterTotalDespesas();

    const totalPorcentagem: number = (totalDespesasAtual - totalDespesasMesAnterior) / (totalDespesasMesAnterior || 1) * 100;

    this.percentualRelacaoMesAnterior.set(parseFloat(totalPorcentagem.toFixed(2)));

    this.obtemMesAnteriorExtenso(despesas);
  }

  private obtemMesAnteriorExtenso(despesas: Despesa[]): void {
    const data = new Date(despesas[0].data);

    const mes = data.toLocaleDateString('pt-BR', {
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
        content: this.novaDespesa,
        buttons: this.botoes
      },
    });
  }

  openDialogEditar(registro: PeriodicElement): void {
    this.buscarDespesasPorId(registro.id).subscribe((despesa) => {
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
          content: this.novaDespesa,
          buttons: this.botoes
        },
      });
    });
  }

  closeDialog(): void {
    this.dialogRef?.close();
  }

  sortTable(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  async salvarDespesa(): Promise<void> {
    if (this.formDespesas.invalid) {
      this.formDespesas.markAllAsTouched();
      return;
    }

    const { descricao, categoria, data, preco, observacao } = this.formDespesas.value;

    const novaDespesa: NovaDespesa = { descricao, categoria, data, preco, observacao };

    await this.despesaService.addDespesa(novaDespesa);

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

    await this.despesaService.updateDespesa(id, despesaAtualizada);

    this.carregarDespesas();
    this.formDespesas.reset();
    this.closeDialog();
  }

  resetarPeriodo(): void {
    this.periodoSelecionado = new Date();
    this.carregarDespesas();
  }

  openDialogExcluir (despesa: Despesa): void {
    this.despesaExcluir = despesa;
    this.dialogRef = this.dialog.open(Dialog, {
      width: '400px',
      data: {
          titulo: 'Excluir Despesa',
          content: this.excluirDespesaTemplate,
          buttons: this.botoesExcluir,
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

  obterMediaDespesas(): number {
    const totalDespesas = this.dataSource.data.length;
    if (totalDespesas === 0) {
      return 0;
    }
    const somaDespesas = this.dataSource.data.reduce((total, despesa) => total + despesa.preco, 0);
    return somaDespesas / totalDespesas;
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
    return this.percentualRelacaoMesAnterior() < 0;
  }

  get corPositiva(): boolean {
    return this.percentualRelacaoMesAnterior() > 0;
  }
}
