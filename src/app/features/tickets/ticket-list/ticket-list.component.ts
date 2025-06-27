import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketStatus } from '../../../core/models/ticket-status.enum';
import { TicketPriority } from '../../../core/models/ticket-priority.enum';
import { TicketService } from '../../../core/services/ticket.service';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    RouterModule
  ],
  template: `
    <div class="p-card p-4">
      <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">Gestión de Tickets</h2>
          <div class="flex gap-2">
            <a routerLink="/tickets/merge" pButton icon="pi pi-compass" label="Fusionar Tickets" class="p-button-outlined"></a>
            <a routerLink="/tickets/new" pButton icon="pi pi-plus" label="Nuevo Ticket"></a>
          </div>
      </div>

      <p-table
        [value]="(tickets$ | async) || []"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-striped"
        [tableStyle]="{'min-width': '50rem'}"
        sortField="createdDate"
        [sortOrder]="-1">

        <ng-template pTemplate="header">
          <tr>
            <th style="width:5rem" pSortableColumn="id">ID <p-sortIcon field="id"></p-sortIcon></th>
            <th pSortableColumn="title">Título <p-sortIcon field="title"></p-sortIcon></th>
            <th pSortableColumn="status">Estado <p-sortIcon field="status"></p-sortIcon></th>
            <th pSortableColumn="priority">Prioridad <p-sortIcon field="priority"></p-sortIcon></th>
            <th pSortableColumn="createdDate">Fecha Creación <p-sortIcon field="createdDate"></p-sortIcon></th>
            <th style="width:8rem">Acciones</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-ticket>
          <tr>
            <td>{{ ticket.id }}</td>
            <td>{{ ticket.title }}</td>
            <td>
              <p-tag [value]="getStatusText(ticket.status)" [severity]="getStatusSeverity(ticket.status)"></p-tag>
            </td>
            <td>
              <p-tag [value]="getPriorityText(ticket.priority)" [severity]="getPrioritySeverity(ticket.priority)"></p-tag>
            </td>
            <td>{{ ticket.createdDate | date:'dd/MM/yyyy h:mm a' }}</td>
            <td>
              <button pButton pRipple icon="pi pi-eye" class="p-button-rounded p-button-info p-button-text" (click)="viewTicket(ticket.id)"></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="6" class="text-center">No se encontraron tickets.</td>
            </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: ``
})
export class TicketListComponent implements OnInit {
  tickets$!: Observable<Ticket[]>
  Status = TicketStatus;
  Priority = TicketPriority;


  constructor(private ticketService: TicketService, private router: Router) { }

  ngOnInit(): void {
    this.tickets$ = this.ticketService.getAllTickets();
  }
  viewTicket(id: number): void {
    this.router.navigate(['/tickets', id]);
  }
  getStatusText(status: TicketStatus): string {
    return TicketStatus[status]?.replace(/([A-Z])/g, ' $1').trim() || 'Desconocido';
  }
  getPriorityText(priority: TicketPriority): string {
    return TicketPriority[priority] || 'Desconocido';
  }
  getStatusSeverity(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.Abierto: return 'info';
      case TicketStatus.Resuelto: return 'success';
      case TicketStatus.Cerrado: return 'warning';
      case TicketStatus.Pendiente:
      case TicketStatus.EsperandoRespuesta2daLinea:
      case TicketStatus.EsperandoRespuestaUsuario: return 'danger';
      default: return 'secondary';
    }
  }
  getPrioritySeverity(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.Bajo: return 'success';
      case TicketPriority.Medio: return 'info';
      case TicketPriority.Alto: return 'warning';
      case TicketPriority.Urgente: return 'danger';
      default: return 'secondary';
    }
  }
}
