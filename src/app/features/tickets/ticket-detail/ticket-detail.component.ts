import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';


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

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketStatus } from '../../../core/models/ticket-status.enum';
import { TicketPriority } from '../../../core/models/ticket-priority.enum';
import { AddCommentDto } from '../../../core/models/add-comment.dto';


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
    DropdownModule
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
              <p class="m-0">{{ ticket.description }}</p>
            </p-card>

            <p-card header="Conversación" styleClass="mt-4">
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
            </p-card>
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
                  <li class="flex items-center justify-between mb-3">
                    <span class="font-semibold">Solicitante:</span>
                    <span>Usuario #{{ ticket.requesterId || 'No asignado' }}</span>
                  </li>
                  <li class="flex items-center justify-between mb-3">
                    <span class="font-semibold">Agente:</span>
                    <span>{{ ticket.assignedAgentId || 'No asignado' }}</span>
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
  :host ::ng-deep .p-card-body .ql-editor {
      padding: 0;
    }
    :host ::ng-deep .p-card-body p {
      margin: 0;
    }
  `
})
export class TicketDetailComponent implements OnInit {

  ticket: Ticket | null = null;
  comments$!: Observable<Comment[]>;
  commentForm: FormGroup;

  statusOptions: { label: string, value: number }[];
  priorityOptions: { label: string, value: number }[];

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
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(params => {
        this.ticketId = Number(params.get('id'));
        this.loadComments();
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
    this.ticketService.getTicketById(this.ticketId).subscribe(data => {
        this.ticket = data;
    });
  }

  loadComments(): void {
    this.comments$ = this.ticketService.getComments(this.ticketId);
  }

  onAddComment(): void {
    if (this.commentForm.invalid) {
      return;
    }

    const newComment: AddCommentDto = {
      content: this.commentForm.value.content,
      isPrivate: this.commentForm.value.isPrivate,
      authorId: 1 // Hardcodeado. Se reemplazará con el ID del usuario logueado.
    };

    this.ticketService.addComment(this.ticketId, newComment).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comentario añadido correctamente' });
        this.commentForm.reset({ content: '', isPrivate: false });
        this.loadComments();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo añadir el comentario' });
        console.error(err);
      }
    });
  }

  onStatusChange(event: any): void {
    if (!this.ticket) return;
    this.ticketService.changeStatus(this.ticket.id, { newStatusId: event.value }).subscribe({
      next: (updatedTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado del ticket actualizado.' });
        this.ticket = updatedTicket; // Actualizamos el ticket local con la respuesta del servidor
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado.' });
        this.loadTicket(); // Revertimos al estado anterior si hay error
        console.error(err);
      }
    });
  }

  onPriorityChange(event: any): void {
      if (!this.ticket) return;
      this.ticketService.changePriority(this.ticket.id, { newPriorityId: event.value }).subscribe({
      next: (updatedTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Prioridad del ticket actualizada.' });
        this.ticket = updatedTicket; // Actualizamos el ticket local con la respuesta del servidor
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la prioridad.' });
        this.loadTicket(); // Revertimos al estado anterior si hay error
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
}
