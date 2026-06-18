import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <mat-icon>gavel</mat-icon>
      <span style="margin-left:8px; font-weight:500;" routerLink="/processes" style="cursor:pointer">
        Gestão de Processos Judiciais
      </span>
      <span class="spacer"></span>
      <button mat-button routerLink="/processes">
        <mat-icon>list</mat-icon> Processos
      </button>
      <button mat-raised-button color="accent" routerLink="/processes/new">
        <mat-icon>add</mat-icon> Novo Processo
      </button>
    </mat-toolbar>
    <router-outlet />
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .spacer { flex: 1 1 auto; }
    mat-toolbar button { margin-left: 8px; }
  `]
})
export class AppComponent {}
