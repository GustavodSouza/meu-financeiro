import { AfterViewInit, Component, EventEmitter, inject, Input, Output, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface PeriodicElement {
  id: string;
  descricao: string;
  data: string;
  preco: number;
  categoria?: string;
  acoes?: string;
}

@Component({
  selector: 'app-tabela',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatSortModule,
    MatIconModule,
    CurrencyPipe,
    FormsModule
  ],
  templateUrl: './tabela.html',
  styleUrl: './tabela.scss',
  standalone: true
})
export class Tabela implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['descricao', 'data', 'preco', 'acoes'];
  filterColumns: string[] = ['descricao-filtro', 'data-filtro', 'preco-filtro', 'acoes-filtro'];
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  trackBy = (index: number, el: PeriodicElement) => el.id;

  filtros = {
    descricao: '',
    data: '',
    preco: '',
  };

  @Input()
  set dados(dados: PeriodicElement[] | null) {
    this.dataSource.data = dados ?? [];
  }

  @Output() acaoEditar = new EventEmitter<string>();
  @Output() acaoExcluir = new EventEmitter<PeriodicElement>();

  private _liveAnnouncer = inject(LiveAnnouncer);

  constructor() {
    this.dataSource.filterPredicate = (element, filter) => {
      const filtros = JSON.parse(filter) as typeof this.filtros;
      return (
        element.descricao.toLowerCase().includes(filtros.descricao.trim().toLowerCase()) &&
        element.data.includes(filtros.data.trim()) &&
        element.preco.toString().includes(filtros.preco.trim())
      );
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  aplicarFiltro(): void {
    this.dataSource.filter = JSON.stringify(this.filtros);
  }

  openDialogEditar(element: PeriodicElement): void {
    this.acaoEditar.emit(element.id);
  }

  openDialogExcluir(element: PeriodicElement): void {
    this.acaoExcluir.emit(element);
  }

  sortTable(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
