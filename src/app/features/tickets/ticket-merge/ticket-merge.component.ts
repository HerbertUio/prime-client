import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { Observable } from 'rxjs';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { MergeTicketsDto } from '../../../core/models/merge-tickets.dto';
@Component({
  selector: 'app-ticket-merge',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PanelModule,
    ButtonModule,
    TableModule,
    RadioButtonModule,
    ToastModule,
    CardModule
  ],
  template: `
   <p-toast></p-toast>
    <div class="p-card p-4 shadow-md rounded-lg">
      <div class="flex items-center justify-between border-b pb-3 mb-5">
        <div class="flex items-center gap-2">
            <a routerLink="/tickets" pButton icon="pi pi-arrow-left" class="p-button-text p-button-rounded"></a>
            <h2 class="font-bold text-2xl text-gray-800">Fusionar Tickets</h2>
        </div>
        <button pButton
            label="Confirmar Fusión"
            icon="pi pi-check"
            [disabled]="!primaryTicketId || !secondaryTicketId || primaryTicketId === secondaryTicketId"
            [loading]="isSubmitting"
            (click)="confirmMerge()">
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
            <p-panel header="1. Seleccione el Ticket Principal">
                <p-table [value]="(allTickets$ | async) || []" [scrollable]="true" scrollHeight="400px">
                    <ng-template pTemplate="body" let-ticket>
                        <tr>
                            <td style="width: 3rem">
                                <p-radioButton name="primaryGroup" [value]="ticket.id" [(ngModel)]="primaryTicketId"></p-radioButton>
                            </td>
                            <td>#{{ticket.id}} - {{ticket.title}}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-panel>
        </div>

        <div>
            <p-panel header="2. Seleccione el Ticket a Fusionar (Secundario)">
                 <p-table [value]="(allTickets$ | async) || []" [scrollable]="true" scrollHeight="400px">
                    <ng-template pTemplate="body" let-ticket>
                        <tr>
                            <td style="width: 3rem">
                                <p-radioButton name="secondaryGroup" [value]="ticket.id" [(ngModel)]="secondaryTicketId" [disabled]="ticket.id === primaryTicketId"></p-radioButton>
                            </td>
                            <td>#{{ticket.id}} - {{ticket.title}}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-panel>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class TicketMergeComponent {
  allTickets$!: Observable<Ticket[]>;
  primaryTicketId: number | null = null;
  secondaryTicketId: number | null = null;
  isSubmitting: boolean = false;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.allTickets$ = this.ticketService.getAllTickets();
  }

  confirmMerge(): void {
    if (!this.primaryTicketId || !this.secondaryTicketId || this.primaryTicketId === this.secondaryTicketId) {
      this.messageService.add({severity: 'warn', summary: 'Selección Inválida', detail: 'Debe seleccionar dos tickets diferentes.'});
      return;
    }

    this.isSubmitting = true;
    const dto: MergeTicketsDto = {
      primaryTicketId: this.primaryTicketId,
      ticketToMergeId: this.secondaryTicketId
    };

    this.ticketService.mergeTickets(dto).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Éxito', detail: 'Los tickets se han fusionado correctamente.'});
        setTimeout(() => {
          this.router.navigate(['/tickets']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'No se pudo completar la fusión.'});
        console.error(err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

}
