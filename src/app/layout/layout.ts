import { Component, ViewChild } from '@angular/core';
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
export class Layout {
  @ViewChild('drawer')
  drawer!: MatSidenav;

  constructor(private menuService: MenuService) {}

  ngAfterViewInit(): void {
    this.menuService.opened$.subscribe(async (opened) => {
      console.log('antes');

      if (opened) {
        console.log('abrindo...');
        await this.drawer.open();
        console.log('abriu');
      } else {
        console.log('fechando...');
        await this.drawer.close();
        console.log('fechou');
      }
    });
  }
}
