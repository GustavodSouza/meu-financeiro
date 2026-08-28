import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from "./components/common/loader/loader";
import { LoaderService } from './components/common/loader/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('meu-financeiro');
  public loaderService = inject(LoaderService);
  public isLoading = this.loaderService.isLoading;
}
