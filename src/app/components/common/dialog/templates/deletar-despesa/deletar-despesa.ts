import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PeriodicElement } from '../../../tabela/tabela';
import { Categorias } from '../../../../../models/categoria.model';
import { CategoriasService } from '../../../../../services/categorias.service';

@Component({
  selector: 'app-deletar-despesa',
  imports: [
    CurrencyPipe,
    MatButtonModule
  ],
  templateUrl: './deletar-despesa.html',
  styleUrl: './deletar-despesa.scss',
  standalone: true
})
export class DeletarDespesa implements OnInit {

  @Input() despesa: PeriodicElement | null = null;

  @Output() acaoExcluir = new EventEmitter<void>();
  @Output() acaoCancelar = new EventEmitter<void>();

  @ViewChild('contentTemplate', { static: true }) contentTemplate!: TemplateRef<unknown>;
  @ViewChild('buttonsTemplate', { static: true }) buttonsTemplate!: TemplateRef<unknown>;

  public categorias: Categorias = [];

  private readonly categoriaService = inject(CategoriasService);

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe((categorias) => {
      this.categorias = categorias;
    });
  }

  excluir(): void {
    this.acaoExcluir.emit();
  }

  cancelar(): void {
    this.acaoCancelar.emit();
  }
}
