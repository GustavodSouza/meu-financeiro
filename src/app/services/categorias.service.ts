import { inject, Injectable } from "@angular/core";
import { defer, from, map, Observable, switchMap } from "rxjs";
import { Categoria } from "../models/categoria.model";
import { AuthService } from "../core/auth/auth.service";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "../core/firebase/firebase.providers";

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly firestore = inject(FIREBASE_FIRESTORE);
  private readonly authService = inject(AuthService);

  getCategorias(): Observable<Categoria[]> {
      return defer(() => this.authService.waitForAuthInit()).pipe(
        switchMap((user) => {

          const despesasQuery = query(
            collection(this.firestore, `categories`),
            orderBy('ordem', 'asc'),
          );

          return from(getDocs(despesasQuery)).pipe(
            map((snapshot) => snapshot.docs.map((doc) => this.toCategoria(doc.id, doc.data()))),
          );
        }),
      );
    }

    toCategoria(id: string, dataReceived: Record<string, unknown>): Categoria {
      return {
        id,
        nome: dataReceived['nome'] as string,
        cor: dataReceived['cor'] as string,
        icone: dataReceived['icone'] as string,
        ordem: dataReceived['ordem'] as number,
        ativo: dataReceived['ativo'] as boolean
      };
    }
}
