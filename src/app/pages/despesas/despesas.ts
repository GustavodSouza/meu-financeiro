import { AfterViewInit, Component, inject, LOCALE_ID, TemplateRef, ViewChild, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { Dialog } from '../../components/common/dialog/dialog';
import { CurrencyMaskDirective } from '../../directives/currency-mask.directive';
import { BrDateAdapter } from '../../adapters/br-date-adapter';
import { DespesasService } from '../../core/despesas/despesas.service';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


export interface PeriodicElement {
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
    FormsModule
],
  templateUrl: './despesas.html',
  styleUrl: './despesas.scss',
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: BrDateAdapter },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  standalone: true
})
export class Despesas implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('novaDespesa')
  novaDespesa!: TemplateRef<any>;

  @ViewChild('botoes')
  botoes!: TemplateRef<any>;

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

  constructor (private despesaService: DespesasService) {}

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

    this.despesaService.getDespesas().subscribe((despesas) => {
      this.dataSource.data = despesas.map(despesa => ({
        descricao: despesa.descricao,
        data: new Date(despesa.data).toLocaleDateString('pt-BR'),
        preco: despesa.preco,
        acoes: 'teste'
      }));
    });

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  aplicarFiltro(): void {
    this.dataSource.filter = JSON.stringify(this.filtros);
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(Dialog, {
      width: '600px',
      data: {
        titulo: 'Nova Despesa',
        content: this.novaDespesa,
        buttons: this.botoes
      },
    });
  }

  closeDialog(): void {
    this.dialogRef?.close();
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

  sortTable(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
