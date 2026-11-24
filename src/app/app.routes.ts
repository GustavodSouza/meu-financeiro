import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'despesas',
        loadComponent: () => import('./pages/despesas/despesas').then(m => m.Despesas)
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./pages/configuracoes/configuracoes').then(m => m.Configuracoes)
      }
    ]
  }
];
