import { Injectable, inject } from '@angular/core';
import { Timestamp, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Observable, defer, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { FIREBASE_FIRESTORE } from '../firebase/firebase.providers';
import { Despesa } from './despesa.model';

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
          orderBy('data', 'desc'),
        );

        return from(getDocs(despesasQuery)).pipe(
          map((snapshot) => snapshot.docs.map((doc) => this.toDespesa(doc.id, doc.data()))),
        );
      }),
    );
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
