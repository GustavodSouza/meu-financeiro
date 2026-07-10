import { AfterViewInit, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { Dialog } from '../../components/common/dialog/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079},
  {position: 2, name: 'Helium', weight: 4.0026},
  {position: 3, name: 'Lithium', weight: 6.941},
  {position: 4, name: 'Beryllium', weight: 9.0122},
  {position: 5, name: 'Boron', weight: 10.811},
  {position: 6, name: 'Carbon', weight: 12.0107},
  {position: 7, name: 'Nitrogen', weight: 14.0067},
  {position: 8, name: 'Oxygen', weight: 15.9994},
  {position: 9, name: 'Fluorine', weight: 18.9984},
  {position: 10, name: 'Neon', weight: 20.1797},
  {position: 1, name: 'Hydrogen', weight: 1.0079},
  {position: 2, name: 'Helium', weight: 4.0026},
  {position: 3, name: 'Lithium', weight: 6.941},
  {position: 4, name: 'Beryllium', weight: 9.0122},
  {position: 5, name: 'Boron', weight: 10.811},
  {position: 6, name: 'Carbon', weight: 12.0107},
  {position: 7, name: 'Nitrogen', weight: 14.0067},
  {position: 8, name: 'Oxygen', weight: 15.9994},
  {position: 9, name: 'Fluorine', weight: 18.9984},
  {position: 10, name: 'Neon 2', weight: 20.1797}
];

@Component({
  selector: 'app-despesas',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    ScrollingModule,
    MatPaginator,
    MatPaginatorModule,
    MatCardModule,
    Dialog,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  templateUrl: './despesas.html',
  styleUrl: './despesas.scss',
  providers: [provideNativeDateAdapter()],
  standalone: true
})
export class Despesas implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('novaDespesa')
  novaDespesa!: TemplateRef<any>;

  @ViewChild('botoes')
  botoes!: TemplateRef<any>;

  displayedColumns: string[] = ['position', 'name', 'weight'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  trackBy = (index: number, el: PeriodicElement) => el.position;

  readonly dialog = inject(MatDialog);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  get viewportHeight(): string {
    const itemCount = this.dataSource.data.length; // ou o length da página atual
    const itemSize = 52;
    const maxHeight = 600; // seu limite atual do CSS, ajuste conforme necessário

    const calculatedHeight = itemCount * itemSize;
    return `${Math.min(calculatedHeight, maxHeight)}px`;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(Dialog, {
      width: '600px',
      data: {
        titulo: 'Nova Despesa',
        content: this.novaDespesa,
        buttons: this.botoes
      },
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   if (result !== undefined) {
    //     this.animal.set(result);
    //   }
    // });
  }
}
