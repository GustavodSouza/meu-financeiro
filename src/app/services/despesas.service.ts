import { Injectable, inject } from '@angular/core';
import { Timestamp, addDoc, collection, deleteDoc, doc, getAggregateFromServer, getDoc, getDocs, orderBy, query, sum, updateDoc, where } from 'firebase/firestore';
import { Observable, defer, forkJoin, from, of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth.service';
import { FIREBASE_FIRESTORE } from '../core/firebase/firebase.providers';
import { Despesa } from '../models/despesa.model';
import { DataUtil } from '../utils/data.util';
import { LoaderService } from '../components/common/loader/loader.service';

export interface NovaDespesa {
  descricao: string;
  categoria: string;
  preco: number;
  observacao?: string;
  data: Date;
}

export interface DespesasPeriodo {
  despesas: Despesa[];
  totalAtual: number;
  totalMesAnterior: number;
}

@Injectable({ providedIn: 'root' })
export class DespesasService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);
  private readonly authService = inject(AuthService);
  private readonly loaderService = inject(LoaderService);

  private withLoader<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.loaderService.show();
      return source$;
    }).pipe(finalize(() => this.loaderService.hide()));
  }

  private async runWithLoader<T>(action: () => Promise<T>): Promise<T> {
    this.loaderService.show();

    try {
      return await action();
    } finally {
      this.loaderService.hide();
    }
  }

  getDespesas(periodo: Date = new Date()): Observable<DespesasPeriodo> {
    return this.withLoader(
      defer(() => this.authService.waitForAuthInit()).pipe(
        switchMap((user) => {
          if (!user) {
            return of<DespesasPeriodo>({ despesas: [], totalAtual: 0, totalMesAnterior: 0 });
          }

          const { mes_ref: mesRef, ano_ref: anoRef } = DataUtil.formatarData(periodo);

          const mesAnterior = new Date(periodo.getFullYear(), periodo.getMonth() - 1, 1);
          const { mes_ref: mesRefAnterior, ano_ref: anoRefAnterior } = DataUtil.formatarData(mesAnterior);

          const despesasCollection = collection(this.firestore, `users/${user.uid}/despesas`);

          const despesasQuery = query(
            despesasCollection,
            where('mes_ref', '==', mesRef),
            where('ano_ref', '==', anoRef),
            orderBy('dt_reg', 'desc'),
          );

          const totalMesAnteriorQuery = query(
            despesasCollection,
            where('mes_ref', '==', mesRefAnterior),
            where('ano_ref', '==', anoRefAnterior),
          );

          return forkJoin({
            despesas: from(getDocs(despesasQuery)).pipe(
              map((snapshot) => snapshot.docs.map((doc) => this.toDespesa(doc.id, doc.data()))),
            ),
            totalMesAnterior: from(
              getAggregateFromServer(totalMesAnteriorQuery, { total: sum('preco') }),
            ).pipe(map((snapshot) => snapshot.data().total)),
          }).pipe(
            map(({ despesas, totalMesAnterior }) => ({
              despesas,
              totalAtual: despesas.reduce((acc, despesa) => acc + despesa.preco, 0),
              totalMesAnterior,
            })),
          );
        }),
      ),
    );
  }

  getDespesasById(id: string): Observable<Despesa | null> {
    return this.withLoader(
      defer(() => this.authService.waitForAuthInit()).pipe(
        switchMap((user) => {
          if (!user) {
            return of<Despesa | null>(null);
          }

          const despesaRef = doc(this.firestore, `users/${user.uid}/despesas/${id}`);

          return from(getDoc(despesaRef)).pipe(
            map((snapshot) => (snapshot.exists() ? this.toDespesa(snapshot.id, snapshot.data()) : null)),
          );
        }),
      ),
    );
  }

  addDespesa(despesa: NovaDespesa): Promise<void> {
    return this.runWithLoader(async () => {
      const user = await this.authService.waitForAuthInit();

      if (!user) {
        return;
      }

      const { mes_ref: mesRef, ano_ref: anoRef, dt_reg: dtReg } = DataUtil.formatarData(despesa.data);

      await addDoc(collection(this.firestore, `users/${user.uid}/despesas`), {
        descricao: despesa.descricao,
        categoria: despesa.categoria,
        preco: despesa.preco,
        observacao: despesa.observacao ?? '',
        dt_reg: dtReg,
        mes_ref: mesRef,
        ano_ref: anoRef,
      });
    });
  }

  updateDespesa(id: string, despesa: NovaDespesa): Promise<void> {
    return this.runWithLoader(async () => {
      const user = await this.authService.waitForAuthInit();

      if (!user) {
        return;
      }

      const { mes_ref: mesRef, ano_ref: anoRef, dt_reg: dtReg } = DataUtil.formatarData(despesa.data);

      await updateDoc(doc(this.firestore, `users/${user.uid}/despesas/${id}`), {
        descricao: despesa.descricao,
        categoria: despesa.categoria,
        preco: despesa.preco,
        observacao: despesa.observacao ?? '',
        dt_reg: dtReg,
        mes_ref: mesRef,
        ano_ref: anoRef,
      });
    });
  }

  deleteDespesa(id: string): Promise<void> {
    return this.runWithLoader(async () => {
      const user = await this.authService.waitForAuthInit();

      if (!user) {
        return;
      }

      await deleteDoc(doc(this.firestore, `users/${user.uid}/despesas/${id}`));
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
