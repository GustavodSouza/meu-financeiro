import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataUtil } from '../../utils/data.util';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class Dashboard {

  public periodoSelecionado: Date = new Date();

  public retrocederMes(): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() - 1, 1);
  }

  public avancarMes(): void {
    this.periodoSelecionado = new Date(this.periodoSelecionado.getFullYear(), this.periodoSelecionado.getMonth() + 1, 1);
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
}
