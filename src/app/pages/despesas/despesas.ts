import { AfterViewInit, Component, inject, LOCALE_ID, TemplateRef, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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


export interface PeriodicElement {
  descricao: string;
  data: string;
  preco: number;
  acoes?: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'},
  { descricao: 'Hydrogen', data: '01/01/2024', preco: 1.0079, acoes: 'teste' },
  { descricao: 'Helium', data: '02/01/2024', preco: 4.0026, acoes: 'teste'}
];

@Component({
  selector: 'app-despesas',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
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
    CurrencyMaskDirective
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
export class Despesas implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('novaDespesa')
  novaDespesa!: TemplateRef<any>;

  @ViewChild('botoes')
  botoes!: TemplateRef<any>;

  displayedColumns: string[] = ['descricao', 'data', 'preco', 'acoes'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  trackBy = (index: number, el: PeriodicElement) => el.descricao;

  readonly dialog = inject(MatDialog);
  dialogRef?: MatDialogRef<Dialog>;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
}
