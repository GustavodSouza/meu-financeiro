import { inject, Injectable } from '@angular/core';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { FIREBASE_FIRESTORE } from '../core/firebase/firebase.providers';
import { AuthService } from '../core/auth/auth.service';
import { LoaderService } from '../components/common/loader/loader.service';
import { Observable, defer, finalize, from, map, of, switchMap } from 'rxjs';
import { Orcamento } from '../models/orcamento.model';

@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);
  private readonly authService = inject(AuthService);
  private readonly loaderService = inject(LoaderService);

  private async runWithLoader<T>(action: () => Promise<T>): Promise<T> {
    this.loaderService.show();

    try {
      return await action();
    } finally {
      this.loaderService.hide();
    }
  }

  private withLoader<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.loaderService.show();
      return source$;
    }).pipe(finalize(() => this.loaderService.hide()));
  }

  salvarOrcamentoPadrao(valorPadrao: number): Promise<void> {
    return this.runWithLoader(async () => {
      const user = await this.authService.waitForAuthInit();

      if (!user) {
        return;
      }

      await setDoc(
        doc(this.firestore, `orcamento/${user.uid}`),
        {
          valorPadrao,
          atualizadoEm: serverTimestamp(),
        },
        { merge: true },
      );
    });
  }

  buscaOrcamentoPadrao(): Observable<Orcamento | null> {
    return this.withLoader(
      defer(() => this.authService.waitForAuthInit()).pipe(
        switchMap((user) => {
          if (!user) {
            return of<Orcamento | null>(null);
          }

          const orcamentoRef = doc(this.firestore, `orcamento/${user.uid}`);

          return from(getDoc(orcamentoRef)).pipe(
            map((snapshot) => (snapshot.exists() ? this.toOrcamento(snapshot.data()) : null)),
          );
        }),
      ),
    );
  }

  private toOrcamento(data: Record<string, unknown>): Orcamento {
    const atualizadoEm = data['atualizadoEm'];

    return {
      valor: data['valorPadrao'] as number,
      atualizadorEm: atualizadoEm instanceof Timestamp ? atualizadoEm.toDate().toISOString() : '',
    };
  }
}
