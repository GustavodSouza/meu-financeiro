import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Navbar } from '../components/navbar/navbar';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MenuService } from '../components/services/menu.service';
import { MatListModule, MatNavList } from '@angular/material/list';

@Component({
  selector: 'app-layout',
  imports: [
    MatButtonModule,
    MatInputModule,
    Navbar,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    RouterOutlet,
    MatNavList,
    MatIcon,
    MatListModule,
    RouterModule,
    RouterLink,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
})
export class Layout implements OnInit {
  @ViewChild('drawer')
  drawer!: MatSidenav;

  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isMobile.set(result.matches);

      if (result.matches) {
        this.menuService.close();
      } else {
        this.menuService.open();
      }
    });
  }

  ngAfterViewInit(): void {
    this.menuService.opened$.subscribe(async (opened) => {
      if (opened) {
        await this.drawer.open();
      } else {
        await this.drawer.close();
      }
    });
  }

  onDrawerOpenedChange(opened: boolean): void {
    if (opened) {
      this.menuService.open();
    } else {
      this.menuService.close();
    }
  }

  onNavLinkClick(): void {
    if (this.isMobile()) {
      this.menuService.close();
    }
  }
}
