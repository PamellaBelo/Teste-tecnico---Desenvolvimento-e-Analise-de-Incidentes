import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessStatus, PROCESS_STATUS_LABELS } from '../../core/models/process.model';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-chip" [ngClass]="status">{{ label }}</span>
  `
})
export class StatusChipComponent {
  @Input({ required: true }) status!: ProcessStatus;

  get label(): string {
    return PROCESS_STATUS_LABELS[this.status] ?? this.status;
  }
}
