import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly _opened = new BehaviorSubject(true);

  readonly opened$ = this._opened.asObservable();

  toggle(): void {
    this._opened.next(!this._opened.value);
  }

  open(): void {
    this._opened.next(true);
  }

  close(): void {
    this._opened.next(false);
  }
}
