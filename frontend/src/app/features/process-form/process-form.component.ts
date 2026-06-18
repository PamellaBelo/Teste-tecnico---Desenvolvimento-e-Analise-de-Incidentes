import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ProcessService } from '../../core/services/process.service';
import { PROCESS_STATUS_OPTIONS } from '../../core/models/process.model';

const CNJ_REGEX = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

function closingDateValidator(group: AbstractControl): ValidationErrors | null {
  const opening = group.get('openingDate')?.value;
  const closing = group.get('closingDate')?.value;
  if (opening && closing && new Date(closing) < new Date(opening)) {
    return { closingBeforeOpening: true };
  }
  return null;
}

@Component({
  selector: 'app-process-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <mat-icon>{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon>
            {{ isEdit ? 'Editar Processo' : 'Novo Processo' }}
          </h1>
          <p class="breadcrumb">
            <a routerLink="/processes">Processos</a> /
            {{ isEdit ? 'Editar' : 'Novo' }}
          </p>
        </div>
      </div>

      @if (loadingProcess()) {
        <div class="loading-container">
          <mat-spinner diameter="48" />
          <p>Carregando processo...</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Identification -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Identificação</mat-card-title>
            </mat-card-header>
            <mat-divider />
            <mat-card-content class="form-grid">

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Número do Processo (CNJ)</mat-label>
                <input matInput formControlName="processNumber"
                  placeholder="0000000-00.0000.0.00.0000">
                <mat-hint>Formato: 9999999-99.9999.9.99.9999</mat-hint>
                @if (f['processNumber'].invalid && f['processNumber'].touched) {
                  <mat-error>
                    @if (f['processNumber'].errors?.['required']) { Campo obrigatório }
                    @if (f['processNumber'].errors?.['pattern']) { Formato CNJ inválido }
                  </mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Assunto</mat-label>
                <input matInput formControlName="subject"
                  placeholder="Ex: Execução Fiscal - IPTU 2024">
                @if (f['subject'].invalid && f['subject'].touched) {
                  <mat-error>Campo obrigatório (máx. 255 caracteres)</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Descrição</mat-label>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Detalhes adicionais sobre o processo"></textarea>
                <mat-hint align="end">{{ f['description'].value?.length ?? 0 }}/1000</mat-hint>
                @if (f['description'].invalid && f['description'].touched) {
                  <mat-error>Máximo 1000 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  @for (opt of statusOptions; track opt.value) {
                    <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                  }
                </mat-select>
                @if (f['status'].invalid && f['status'].touched) {
                  <mat-error>Campo obrigatório</mat-error>
                }
              </mat-form-field>

            </mat-card-content>
          </mat-card>

          <!-- Dates -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Datas</mat-card-title>
            </mat-card-header>
            <mat-divider />
            <mat-card-content class="form-grid">

              <mat-form-field appearance="outline">
                <mat-label>Data de Abertura</mat-label>
                <input matInput [matDatepicker]="openPicker" formControlName="openingDate">
                <mat-datepicker-toggle matIconSuffix [for]="openPicker" />
                <mat-datepicker #openPicker />
                @if (f['openingDate'].invalid && f['openingDate'].touched) {
                  <mat-error>Data de abertura obrigatória</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data de Encerramento</mat-label>
                <input matInput [matDatepicker]="closePicker" formControlName="closingDate">
                <mat-datepicker-toggle matIconSuffix [for]="closePicker" />
                <mat-datepicker #closePicker />
                @if (form.errors?.['closingBeforeOpening'] && f['closingDate'].touched) {
                  <mat-error>Data de encerramento anterior à data de abertura</mat-error>
                }
              </mat-form-field>

            </mat-card-content>
          </mat-card>

          <!-- Responsible -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Responsável</mat-card-title>
            </mat-card-header>
            <mat-divider />
            <mat-card-content class="form-grid">

              <mat-form-field appearance="outline">
                <mat-label>Nome do Responsável</mat-label>
                <input matInput formControlName="responsibleName"
                  placeholder="Ex: Dra. Ana Paula Ferreira">
                @if (f['responsibleName'].invalid && f['responsibleName'].touched) {
                  <mat-error>Campo obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>E-mail do Responsável</mat-label>
                <input matInput formControlName="responsibleEmail" type="email"
                  placeholder="procurador@municipio.gov.br">
                @if (f['responsibleEmail'].invalid && f['responsibleEmail'].touched) {
                  <mat-error>
                    @if (f['responsibleEmail'].errors?.['required']) { Campo obrigatório }
                    @if (f['responsibleEmail'].errors?.['email']) { E-mail inválido }
                  </mat-error>
                }
              </mat-form-field>

            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="/processes">
              <mat-icon>arrow_back</mat-icon>
              Cancelar
            </button>
            <button mat-raised-button color="primary" type="submit"
              [disabled]="form.invalid || saving()">
              @if (saving()) {
                <mat-spinner diameter="20" />
              } @else {
                <mat-icon>save</mat-icon>
              }
              {{ isEdit ? 'Salvar Alterações' : 'Cadastrar Processo' }}
            </button>
          </div>

        </form>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 22px;
      font-weight: 500;
      color: #1a237e;
      margin-bottom: 4px;
    }
    .breadcrumb { font-size: 13px; color: #757575; }
    .breadcrumb a { color: #3f51b5; text-decoration: none; }

    .form-card {
      margin-bottom: 16px;
      mat-card-header { padding: 16px 16px 0; }
      mat-card-content { padding: 16px; }
      mat-divider { margin: 12px 0; }
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    .span-2 { grid-column: span 2; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 8px 0 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 0;
      gap: 16px;
      color: #9e9e9e;
    }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }
  `]
})
export class ProcessFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly processService = inject(ProcessService);
  private readonly snackBar = inject(MatSnackBar);

  statusOptions = PROCESS_STATUS_OPTIONS;
  isEdit = false;
  processId?: number;

  loading = signal(false);
  loadingProcess = signal(false);
  saving = signal(false);

  form: FormGroup = this.fb.group({
    processNumber:   ['', [Validators.required, Validators.pattern(CNJ_REGEX)]],
    subject:         ['', [Validators.required, Validators.maxLength(255)]],
    description:     ['', Validators.maxLength(1000)],
    status:          ['ACTIVE', Validators.required],
    responsibleName: ['', Validators.required],
    responsibleEmail:['', [Validators.required, Validators.email]],
    openingDate:     [null, Validators.required],
    closingDate:     [null]
  }, { validators: closingDateValidator });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.processId = +id;
      this.loadProcess(this.processId);
    }
  }

  loadProcess(id: number): void {
    this.loadingProcess.set(true);
    this.processService.findById(id).subscribe({
      next: (process) => {
        this.form.patchValue({
          ...process,
          openingDate: process.openingDate ? new Date(process.openingDate) : null,
          closingDate: process.closingDate ? new Date(process.closingDate) : null
        });
        this.loadingProcess.set(false);
      },
      error: () => {
        this.loadingProcess.set(false);
        this.router.navigate(['/processes']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const payload = {
      ...value,
      openingDate: this.formatDate(value.openingDate),
      closingDate: value.closingDate ? this.formatDate(value.closingDate) : undefined
    };

    const request$ = this.isEdit && this.processId
      ? this.processService.update(this.processId, payload)
      : this.processService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.snackBar.open(
          this.isEdit ? 'Processo atualizado com sucesso!' : 'Processo cadastrado com sucesso!',
          'Fechar',
          { duration: 4000, panelClass: ['snack-success'] }
        );
        this.router.navigate(['/processes', saved.id]);
      },
      error: (err) => {
        this.saving.set(false);
        if (err.status === 409) {
          this.f['processNumber'].setErrors({ duplicate: true });
        }
      }
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
