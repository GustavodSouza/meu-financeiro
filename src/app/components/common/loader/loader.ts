import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  private readonly loaderService = inject(LoaderService);
  private readonly popover = viewChild<ElementRef<HTMLElement>>('loaderPopover');

  mode = signal<ProgressSpinnerMode>('indeterminate');
  isLoading = this.loaderService.isLoading;

  constructor() {
    effect(() => {
      const element = this.popover()?.nativeElement;

      if (!element) {
        return;
      }

      const isOpen = element.matches(':popover-open');

      if (this.isLoading() && !isOpen) {
        element.showPopover();
      } else if (!this.isLoading() && isOpen) {
        element.hidePopover();
      }
    });
  }
}
