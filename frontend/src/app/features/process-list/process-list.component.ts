import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { ProcessService } from '../../core/services/process.service';
import { JudicialProcess, ProcessStatus, PROCESS_STATUS_OPTIONS } from '../../core/models/process.model';
import { StatusChipComponent } from '../../shared/components/status-chip.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-process-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatProgressSpinnerModule,
    MatCardModule, MatChipsModule,
    StatusChipComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Processos Judiciais</h1>
          <p class="page-subtitle">{{ totalElements() }} processo(s) encontrado(s)</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/processes/new">
          <mat-icon>add</mat-icon>
          Novo Processo
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar por número, assunto ou responsável</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Ex: 1234567 ou Execução Fiscal">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusControl">
                <mat-option value="">Todos</mat-option>
                @for (opt of statusOptions; track opt.value) {
                  <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()" [disabled]="!hasFilters()">
              <mat-icon>clear</mat-icon>
              Limpar filtros
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="48" />
              <p>Carregando processos...</p>
            </div>
          } @else if (processes().length === 0) {
            <div class="empty-state">
              <mat-icon>folder_open</mat-icon>
              <h3>Nenhum processo encontrado</h3>
              <p>Tente ajustar os filtros ou <a routerLink="/processes/new">cadastre um novo processo</a>.</p>
            </div>
          } @else {
            <table mat-table [dataSource]="processes()" class="full-width">

              <ng-container matColumnDef="processNumber">
                <th mat-header-cell *matHeaderCellDef>Número do Processo</th>
                <td mat-cell *matCellDef="let p">
                  <a [routerLink]="['/processes', p.id]" class="process-link">
                    {{ p.processNumber }}
                  </a>
                </td>
              </ng-container>

              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>Assunto</th>
                <td mat-cell *matCellDef="let p" class="subject-cell">{{ p.subject }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <app-status-chip [status]="p.status" />
                </td>
              </ng-container>

              <ng-container matColumnDef="responsibleName">
                <th mat-header-cell *matHeaderCellDef class="hide-mobile">Responsável</th>
                <td mat-cell *matCellDef="let p" class="hide-mobile">{{ p.responsibleName }}</td>
              </ng-container>

              <ng-container matColumnDef="openingDate">
                <th mat-header-cell *matHeaderCellDef class="hide-mobile">Abertura</th>
                <td mat-cell *matCellDef="let p" class="hide-mobile">
                  {{ p.openingDate | date:'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let p" class="actions-cell">
                  <button mat-icon-button color="primary"
                    [routerLink]="['/processes', p.id]"
                    matTooltip="Ver detalhes">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button
                    [routerLink]="['/processes', p.id, 'edit']"
                    matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn"
                    (click)="confirmDelete(p)"
                    matTooltip="Excluir"
                    [disabled]="p.status === 'ACTIVE'">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="table-row"
                  [class.clickable]="true"
                  (click)="navigate(row)"></tr>
            </table>

            <mat-paginator
              [length]="totalElements()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              [pageIndex]="currentPage()"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-title { font-size: 24px; font-weight: 500; color: #1a237e; }
    .page-subtitle { font-size: 13px; color: #757575; margin-top: 2px; }

    .filter-card { margin-bottom: 16px; }
    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-field { flex: 2; min-width: 220px; }
    .status-field { flex: 1; min-width: 160px; }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 0;
      gap: 16px;
      color: #9e9e9e;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; }
    .empty-state h3 { margin: 0; font-size: 18px; }

    .table-card { overflow: hidden; }
    .subject-cell { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .process-link { color: #3f51b5; text-decoration: none; font-weight: 500; }
    .process-link:hover { text-decoration: underline; }
    .actions-cell { text-align: right; white-space: nowrap; }

    tr.table-row:hover { background: #f5f5f5; cursor: pointer; }
    tr.table-row td { border-bottom: 1px solid #f0f0f0; }
  `]
})
export class ProcessListComponent implements OnInit, OnDestroy {
  private readonly processService = inject(ProcessService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  displayedColumns = ['processNumber', 'subject', 'status', 'responsibleName', 'openingDate', 'actions'];
  statusOptions = PROCESS_STATUS_OPTIONS;

  searchControl = new FormControl('');
  statusControl = new FormControl<ProcessStatus | ''>('');

  processes = signal<JudicialProcess[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = 10;

  hasFilters = computed(() =>
    !!this.searchControl.value || !!this.statusControl.value
  );

  ngOnInit(): void {
    this.loadProcesses();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadProcesses();
    });

    this.statusControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadProcesses();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProcesses(): void {
    this.loading.set(true);
    this.processService.findAll({
      search: this.searchControl.value ?? undefined,
      status: (this.statusControl.value as ProcessStatus) || undefined,
      page: this.currentPage(),
      size: this.pageSize
    }).subscribe({
      next: (res) => {
        this.processes.set(res.content);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize = event.pageSize;
    this.loadProcesses();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
  }

  navigate(process: JudicialProcess): void {
    this.router.navigate(['/processes', process.id]);
  }

  confirmDelete(process: JudicialProcess): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Excluir Processo',
        message: `Deseja excluir o processo ${process.processNumber}? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.processService.delete(process.id).subscribe({
          next: () => {
            this.snackBar.open('Processo excluído com sucesso.', 'Fechar', {
              duration: 4000, panelClass: ['snack-success']
            });
            this.loadProcesses();
          }
        });
      }
    });
  }
}
