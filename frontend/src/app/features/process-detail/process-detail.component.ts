import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ProcessService } from '../../core/services/process.service';
import { JudicialProcess } from '../../core/models/process.model';
import { StatusChipComponent } from '../../shared/components/status-chip.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-process-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule,
    StatusChipComponent
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48" />
        </div>
      } @else if (process()) {
        <!-- Header -->
        <div class="detail-header">
          <div>
            <p class="breadcrumb">
              <a routerLink="/processes">Processos</a> / Detalhes
            </p>
            <h1 class="page-title">{{ process()!.processNumber }}</h1>
            <div style="margin-top:8px">
              <app-status-chip [status]="process()!.status" />
            </div>
          </div>
          <div class="header-actions">
            <button mat-stroked-button routerLink="/processes">
              <mat-icon>arrow_back</mat-icon>
              Voltar
            </button>
            <button mat-stroked-button color="primary"
              [routerLink]="['/processes', process()!.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-raised-button color="warn"
              [disabled]="process()!.status === 'ACTIVE'"
              (click)="confirmDelete()"
              [matTooltip]="process()!.status === 'ACTIVE' ? 'Arquive o processo antes de excluir' : 'Excluir processo'">
              <mat-icon>delete</mat-icon>
              Excluir
            </button>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="detail-grid">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="primary">info</mat-icon>
              <mat-card-title>Identificação</mat-card-title>
            </mat-card-header>
            <mat-divider />
            <mat-card-content>
              <div class="info-row">
                <span class="label">Número do Processo</span>
                <span class="value mono">{{ process()!.processNumber }}</span>
              </div>
              <div class="info-row">
                <span class="label">Assunto</span>
                <span class="value">{{ process()!.subject }}</span>
              </div>
              @if (process()!.description) {
                <div class="info-row">
                  <span class="label">Descrição</span>
                  <span class="value">{{ process()!.description }}</span>
                </div>
              }
              <div class="info-row">
                <span class="label">Status</span>
                <app-status-chip [status]="process()!.status" />
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="primary">person</mat-icon>
              <mat-card-title>Responsável</mat-card-title>
            </mat-card-header>
            <mat-divider />
            <mat-card-content>
              <div class="info-row">
                <span class="label">Nome</span>
                <span class="value">{{ process()!.responsibleName }}</span>
              </div>
              <div class="info-row">
                <span class="label">E-mail</span>
                <a [href]="'mailto:' + process()!.responsibleEmail" class="value link">
                  {{ process()!.responsibleEmail }}
                </a>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="primary">calendar_today</mat-icon>
              <mat-card-title>Datas</mat-card-title>
            </mat-card-header>
            <mat-divider />
            <mat-card-content>
              <div class="info-row">
                <span class="label">Data de Abertura</span>
                <span class="value">{{ process()!.openingDate | date:'dd/MM/yyyy' }}</span>
              </div>
              @if (process()!.closingDate) {
                <div class="info-row">
                  <span class="label">Data de Encerramento</span>
                  <span class="value">{{ process()!.closingDate | date:'dd/MM/yyyy' }}</span>
                </div>
              }
              <div class="info-row">
                <span class="label">Cadastrado em</span>
                <span class="value">{{ process()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Última atualização</span>
                <span class="value">{{ process()!.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>error_outline</mat-icon>
          <h3>Processo não encontrado</h3>
          <button mat-raised-button color="primary" routerLink="/processes">
            Voltar para a lista
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
    }
    .page-title { font-size: 22px; font-weight: 600; color: #1a237e; margin-top: 4px; }
    .breadcrumb { font-size: 13px; color: #757575; }
    .breadcrumb a { color: #3f51b5; text-decoration: none; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .info-card {
      mat-card-header { padding: 16px 16px 0; }
      mat-card-content { padding: 16px; }
      mat-divider { margin: 12px 0; }
    }
    .info-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
      &:last-child { margin-bottom: 0; }
    }
    .label { font-size: 12px; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { font-size: 15px; color: #212121; }
    .mono { font-family: monospace; font-size: 14px; }
    .link { color: #3f51b5; text-decoration: none; }
    .link:hover { text-decoration: underline; }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80px 0;
      gap: 16px;
      color: #9e9e9e;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .header-actions { width: 100%; }
    }
  `]
})
export class ProcessDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly processService = inject(ProcessService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  process = signal<JudicialProcess | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.processService.findById(+id).subscribe({
        next: (p) => { this.process.set(p); this.loading.set(false); },
        error: () => { this.loading.set(false); }
      });
    }
  }

  confirmDelete(): void {
    const p = this.process();
    if (!p) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Excluir Processo',
        message: `Confirma a exclusão do processo ${p.processNumber}?`,
        confirmText: 'Excluir',
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.processService.delete(p.id).subscribe({
          next: () => {
            this.snackBar.open('Processo excluído.', 'Fechar', {
              duration: 4000, panelClass: ['snack-success']
            });
            this.router.navigate(['/processes']);
          }
        });
      }
    });
  }
}
