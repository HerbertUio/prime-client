import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { map, Observable } from 'rxjs';
import { TicketService } from '../../core/services/ticket.service';
import { TicketStatus } from '../../core/models/ticket-status.enum';


interface DashboardStats {
  open: number;
  unassigned: number;
  pending: number;
  solved: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    SkeletonModule
  ],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Tickets:</h2>

      <div *ngIf="stats$ | async as stats; else loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <p-card styleClass="text-center">
          <ng-template pTemplate="title"><span class="text-5xl font-bold text-blue-500">{{ stats.open }}</span></ng-template>
          <ng-template pTemplate="subtitle">Tickets Abiertos</ng-template>
        </p-card>

        <p-card styleClass="text-center">
          <ng-template pTemplate="title"><span class="text-5xl font-bold text-orange-500">{{ stats.unassigned }}</span></ng-template>
          <ng-template pTemplate="subtitle">Sin Asignar</ng-template>
        </p-card>

        <p-card styleClass="text-center">
          <ng-template pTemplate="title"><span class="text-5xl font-bold text-red-500">{{ stats.pending }}</span></ng-template>
          <ng-template pTemplate="subtitle">Pendientes</ng-template>
        </p-card>

        <p-card styleClass="text-center">
          <ng-template pTemplate="title"><span class="text-5xl font-bold text-green-500">{{ stats.solved }}</span></ng-template>
          <ng-template pTemplate="subtitle">Resueltos</ng-template>
        </p-card>

      </div>

      <ng-template #loading>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <p-skeleton height="8rem"></p-skeleton>
          <p-skeleton height="8rem"></p-skeleton>
          <p-skeleton height="8rem"></p-skeleton>
          <p-skeleton height="8rem"></p-skeleton>
        </div>
      </ng-template>
    </div>
  `
})

export class DashboardComponent implements OnInit {
  stats$!: Observable<DashboardStats>;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.stats$ = this.ticketService.getAllTickets().pipe(
      map(tickets => {
        return {
          open: tickets.filter(t => t.status === TicketStatus.Abierto).length,
          unassigned: tickets.filter(t => !t.assignedAgentId).length,
          pending: tickets.filter(t => t.status === TicketStatus.Pendiente || t.status === TicketStatus.EsperandoRespuestaUsuario || t.status === TicketStatus.EsperandoRespuesta2daLinea).length,
          solved: tickets.filter(t => t.status === TicketStatus.Resuelto || t.status === TicketStatus.Cerrado).length
        };
      })
    );
  }

}
