import { Injectable, inject } from '@angular/core';
import { Timestamp, addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Observable, defer, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';
import { FIREBASE_FIRESTORE } from '../core/firebase/firebase.providers';
import { Despesa } from '../models/despesa.model';

export interface NovaDespesa {
  descricao: string;
  categoria: string;
  preco: number;
  observacao?: string;
  data: Date;
}

@Injectable({ providedIn: 'root' })
export class DespesasService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);
  private readonly authService = inject(AuthService);

  getDespesas(): Observable<Despesa[]> {
    return defer(() => this.authService.waitForAuthInit()).pipe(
      switchMap((user) => {
        if (!user) {
          return of<Despesa[]>([]);
        }

        const hoje = new Date();
        const mesRef = this.capitalize(hoje.toLocaleString('pt-BR', { month: 'long' }));
        const anoRef = hoje.getFullYear();

        const despesasQuery = query(
          collection(this.firestore, `users/${user.uid}/despesas`),
          where('mes_ref', '==', mesRef),
          where('ano_ref', '==', anoRef),
          orderBy('dt_reg', 'desc'),
        );

        return from(getDocs(despesasQuery)).pipe(
          map((snapshot) => snapshot.docs.map((doc) => this.toDespesa(doc.id, doc.data()))),
        );
      }),
    );
  }

  async addDespesa(despesa: NovaDespesa): Promise<void> {
    const user = await this.authService.waitForAuthInit();

    if (!user) {
      return;
    }

    await addDoc(collection(this.firestore, `users/${user.uid}/despesas`), {
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      preco: despesa.preco,
      observacao: despesa.observacao ?? '',
      dt_reg: despesa.data.toISOString(),
      mes_ref: this.capitalize(despesa.data.toLocaleString('pt-BR', { month: 'long' })),
      ano_ref: despesa.data.getFullYear(),
    });
  }

  private toDespesa(id: string, dataReceived: Record<string, unknown>): Despesa {
    return {
      id,
      descricao: dataReceived['descricao'] as string,
      categoria: dataReceived['categoria'] as string | undefined,
      preco: dataReceived['preco'] as number,
      observacao: dataReceived['observacao'] as string | undefined,
      data: this.toDate(dataReceived['dt_reg']),
    };
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private toDate(value: unknown): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (typeof value === 'string') {
      const match = value.match(
        /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2}):(\d{2})$/,
      );

      if (match) {
        const [, day, month, year, hour, minute, second] = match;
        return new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second),
        );
      }

      return new Date(value);
    }

    return new Date(value as string);
  }
}
