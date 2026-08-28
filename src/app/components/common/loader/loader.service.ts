import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isLoading = signal(false);

  public show(): void {
    this.isLoading.set(true);
  }

  public hide(): void {
    this.isLoading.set(false);
  }
}
