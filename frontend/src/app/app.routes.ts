import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'processes',
    pathMatch: 'full'
  },
  {
    path: 'processes',
    loadComponent: () =>
      import('./features/process-list/process-list.component').then(m => m.ProcessListComponent)
  },
  {
    path: 'processes/new',
    loadComponent: () =>
      import('./features/process-form/process-form.component').then(m => m.ProcessFormComponent)
  },
  {
    path: 'processes/:id/edit',
    loadComponent: () =>
      import('./features/process-form/process-form.component').then(m => m.ProcessFormComponent)
  },
  {
    path: 'processes/:id',
    loadComponent: () =>
      import('./features/process-detail/process-detail.component').then(m => m.ProcessDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'processes'
  }
];
