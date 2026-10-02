import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';

import { MatCardModule } from '@angular/material/card';

import { Despesa } from '../../../../models/despesa.model';
import { DespesasService } from '../../../../services/despesas.service';

const QUANTIDADE_ULTIMAS_DESPESAS = 5;

@Component({
  selector: 'app-card-ultimas-despesas',
  imports: [
    MatCardModule,
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './card-ultimas-despesas.html',
  styleUrl: './card-ultimas-despesas.scss',
})
export class CardUltimasDespesas implements OnChanges {

  @Input() mesSelecionado = new Date();

  private despesaService = inject(DespesasService);

  private breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false }
  );

  public despesas = signal<Despesa[]>([]);

  ngOnChanges(): void {
    this.carregar();
  }

  public carregar(): void {
    this.despesaService.getDespesasByLimit(QUANTIDADE_ULTIMAS_DESPESAS, this.mesSelecionado).subscribe((despesas) => {
      this.despesas.set(despesas);
    });
  }
}
