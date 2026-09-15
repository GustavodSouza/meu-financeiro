import { Component, EventEmitter, inject, Input, OnInit, Output, signal, TemplateRef, ViewChild } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Categorias } from '../../../../../models/categoria.model';
import { CategoriasService } from '../../../../../services/categorias.service';
import { CurrencyMaskDirective } from '../../../../../directives/currency-mask.directive';

@Component({
  selector: 'app-nova-despesa',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    CurrencyMaskDirective
  ],
  templateUrl: './nova-despesa.html',
  styleUrl: './nova-despesa.scss',
  standalone: true
})
export class NovaDespesa implements OnInit {

  @Input() form: FormGroup = new FormGroup({});

  @Output() acaoSalvar = new EventEmitter<void>();
  @Output() acaoEditar = new EventEmitter<void>();
  @Output() acaoCancelar = new EventEmitter<void>();

  @ViewChild('formTemplate', { static: true }) formTemplate!: TemplateRef<unknown>;
  @ViewChild('buttonsTemplate', { static: true }) buttonsTemplate!: TemplateRef<unknown>;

  public categorias: Categorias = [];

  readonly isMobile = signal(false);

  private readonly categoriaService = inject(CategoriasService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe((categorias) => {
      this.categorias = categorias;
    });

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  salvarDespesa(): void {
    this.acaoSalvar.emit();
  }

  editarDespesa(): void {
    this.acaoEditar.emit();
  }

  cancelar(): void {
    this.acaoCancelar.emit();
  }
}
