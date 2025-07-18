import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketStatus } from '../../../core/models/ticket-status.enum';
import { TicketPriority } from '../../../core/models/ticket-priority.enum';
import { AddCommentDto } from '../../../core/models/add-comment.dto';
import { AssignTicketDto } from '../../../core/models/assign-ticket.dto';


import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { EditorModule } from 'primeng/editor';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PanelModule,
    TagModule,
    ButtonModule,
    CardModule,
    TimelineModule,
    EditorModule,
    CheckboxModule,
    ToastModule,
    DropdownModule,
    TabViewModule,
    TableModule
  ],
  template: `
    <p-toast></p-toast>
    <div *ngIf="ticket; else loading">
      <p-panel>
        <ng-template pTemplate="header">
          <div class="flex items-center gap-2">
            <a routerLink="/tickets" pButton icon="pi pi-arrow-left" class="p-button-text p-button-rounded"></a>
            <span class="font-bold text-xl">Ticket #{{ ticket.id }} - {{ ticket.title }}</span>
          </div>
        </ng-template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <p-card header="Descripción">
              <div [innerHTML]="ticket.description"></div>
            </p-card>

            <p-tabView styleClass="mt-4">
              <p-tabPanel header="Conversación">
                <p-timeline [value]="(comments$ | async) || []" layout="vertical">
                    <ng-template pTemplate="content" let-comment>
                        <p-card [header]="'Usuario #' + comment.authorId" [subheader]="(comment.createdAt | date:'full') ?? ''">
                            <div [innerHTML]="comment.content"></div>
                        </p-card>
                    </ng-template>
                </p-timeline>
                <form [formGroup]="commentForm" (ngSubmit)="onAddComment()" class="mt-6">
                  <p-editor formControlName="content" [style]="{'height':'120px'}"></p-editor>
                  <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center">
                        <p-checkbox formControlName="isPrivate" [binary]="true" inputId="isPrivate"></p-checkbox>
                        <label for="isPrivate" class="ml-2">Nota privada (solo para agentes)</label>
                    </div>
                    <button pButton pRipple type="submit" label="Enviar Respuesta" [disabled]="commentForm.invalid"></button>
                  </div>
                </form>
              </p-tabPanel>

              <p-tabPanel header="Tickets Fusionados" *ngIf="(mergedTickets$ | async)?.length">
                <p>La siguiente lista muestra los tickets que han sido cerrados y fusionados dentro de este ticket principal.</p>
                <p-table [value]="(mergedTickets$ | async) || []" styleClass="mt-2">
                  <ng-template pTemplate="header">
                      <tr>
                          <th>ID</th>
                          <th>Título</th>
                          <th>Estado</th>
                      </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-mergedTicket>
                      <tr>
                          <td>#{{ mergedTicket.id }}</td>
                          <td>{{ mergedTicket.title }}</td>
                          <td>
                              <p-tag [value]="getStatusText(mergedTicket.status)" [severity]="getStatusSeverity(mergedTicket.status)"></p-tag>
                          </td>
                      </tr>
                  </ng-template>
                </p-table>
              </p-tabPanel>
            </p-tabView>
          </div>

          <div class="md:col-span-1">
            <p-panel header="Propiedades">
                <ul class="list-none p-0 m-0">
                  <li class="flex items-center justify-between mb-4">
                    <span class="font-semibold">Estado:</span>
                    <p-dropdown
                        [options]="statusOptions"
                        [(ngModel)]="ticket.status"
                        optionLabel="label"
                        optionValue="value"
                        (onChange)="onStatusChange($event)"></p-dropdown>
                  </li>
                  <li class="flex items-center justify-between mb-4">
                    <span class="font-semibold">Prioridad:</span>
                     <p-dropdown
                        [options]="priorityOptions"
                        [(ngModel)]="ticket.priority"
                        optionLabel="label"
                        optionValue="value"
                        (onChange)="onPriorityChange($event)"></p-dropdown>
                  </li>
                  <li class="flex items-center justify-between mb-4">
                    <span class="font-semibold">Agente:</span>
                    <p-dropdown
                        [options]="agentOptions"
                        [(ngModel)]="ticket.assignedAgentId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="No asignado" [showClear]="true"
                        (onChange)="onAssignmentChange()"></p-dropdown>
                  </li>
                  <li class="flex items-center justify-between mb-4">
                    <span class="font-semibold">Grupo:</span>
                     <p-dropdown
                        [options]="groupOptions"
                        [(ngModel)]="ticket.assignedGroupId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Sin grupo"
                        [showClear]="true"
                        (onChange)="onAssignmentChange()"></p-dropdown>
                  </li>
                  <li class="flex items-center justify-between mb-3">
                    <span class="font-semibold">Solicitante:</span>
                    <span>Usuario #{{ ticket.requesterId || 'N/A' }}</span>
                  </li>
                  <li class="flex items-center justify-between mb-3">
                    <span class="font-semibold">Creado:</span>
                    <span>{{ ticket.createdDate | date:'dd/MM/yyyy' }}</span>
                  </li>
                </ul>
            </p-panel>
          </div>
        </div>
      </p-panel>
    </div>

    <ng-template #loading>
      <p>Cargando detalles del ticket...</p>
    </ng-template>
  `,
  styles: `
    :host ::ng-deep .p-card-body .ql-editor { padding: 0; }
    :host ::ng-deep .p-card-body p { margin: 0; }
  `
})
export class TicketDetailComponent implements OnInit, OnDestroy {

  ticket: Ticket | null = null;
  comments$!: Observable<Comment[]>;
  mergedTickets$!: Observable<Ticket[]>;
  commentForm: FormGroup;

  statusOptions: { label: string, value: number }[];
  priorityOptions: { label: string, value: number }[];
  agentOptions: { label: string, value: number }[];
  groupOptions: { label: string, value: number }[];

  private ticketId!: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
      isPrivate: [false]
    });

    this.statusOptions = this.getEnumOptions(TicketStatus);
    this.priorityOptions = this.getEnumOptions(TicketPriority);

    this.agentOptions = [
      { label: 'Agente 1', value: 1 },
      { label: 'Agente 2', value: 2 },
      { label: 'Agente 3', value: 3 }
    ];

    this.groupOptions = [
      { label: '1ra Línea', value: 1 },
      { label: '2da Línea', value: 2 },
      { label: 'DBA', value: 3 }
    ];
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(params => {
        this.ticketId = Number(params.get('id'));
        this.loadRelatedData();
        return this.ticketService.getTicketById(this.ticketId);
      })
    ).subscribe(ticketData => {
      this.ticket = ticketData;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadTicket(): void {
    if (!this.ticketId) return;
    this.ticketService.getTicketById(this.ticketId).subscribe(data => {
        this.ticket = data;
        this.cdr.detectChanges();
    });
  }

  loadRelatedData(): void {
    if (!this.ticketId) return;
    this.comments$ = this.ticketService.getComments(this.ticketId);
    this.mergedTickets$ = this.ticketService.getMergedTickets(this.ticketId);
  }

  onAddComment(): void {
    if (this.commentForm.invalid || !this.ticket) return;

    const newComment: AddCommentDto = {
      content: this.commentForm.value.content,
      isPrivate: this.commentForm.value.isPrivate,
      authorId: 1
    };

    this.ticketService.addComment(this.ticket.id, newComment).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comentario añadido.' });
        this.commentForm.reset({ content: '', isPrivate: false });
        this.loadRelatedData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo añadir el comentario.' });
        console.error(err);
      }
    });
  }

  onStatusChange(event: any): void {
    if (!this.ticket) return;
    this.ticketService.changeStatus(this.ticket.id, { newStatusId: event.value }).subscribe({
      next: (updatedTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado.' });
        this.ticket = updatedTicket;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado.' });
        this.loadTicket();
        console.error(err);
      }
    });
  }

  onPriorityChange(event: any): void {
      if (!this.ticket) return;
      this.ticketService.changePriority(this.ticket.id, { newPriorityId: event.value }).subscribe({
      next: (updatedTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Prioridad actualizada.' });
        this.ticket = updatedTicket;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la prioridad.' });
        this.loadTicket();
        console.error(err);
      }
    });
  }

  onAssignmentChange(): void {
    if (!this.ticket) return;

    const dto: AssignTicketDto = {
      agentId: this.ticket.assignedAgentId,
      groupId: this.ticket.assignedGroupId
    };

    this.ticketService.assignTicket(this.ticket.id, dto).subscribe({
      next: (updatedTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket asignado.' });
        this.ticket = updatedTicket;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo asignar el ticket.' });
        this.loadTicket();
        console.error(err);
      }
    });
  }

  private getEnumOptions(enumObject: any): { label: string, value: number }[] {
    return Object.keys(enumObject)
      .filter(key => !isNaN(Number(enumObject[key])))
      .map(key => ({
        label: key.replace(/([A-Z])/g, ' $1').trim(),
        value: Number(enumObject[key])
      }));
  }

  getStatusText(status: TicketStatus): string {
    return TicketStatus[status]?.replace(/([A-Z])/g, ' $1').trim() || 'Desconocido';
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
}
