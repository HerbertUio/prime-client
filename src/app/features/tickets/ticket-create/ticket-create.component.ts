import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Services, DTOs, and Enums
import { TicketService } from '../../../core/services/ticket.service';
import { CreateTicketDto } from '../../../core/models/create-ticket.dto';
import { TicketType } from '../../../core/models/ticket-type.enum'; // <-- Importación nueva

// PrimeNG Modules
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PanelModule,
    InputTextModule,
    DropdownModule,
    EditorModule,
    ButtonModule,
    ToastModule,
    FloatLabelModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="p-card p-4 shadow-md rounded-lg">
      <div class="flex items-center gap-2 border-b pb-3 mb-5">
        <a routerLink="/tickets" pButton icon="pi pi-arrow-left" class="p-button-text p-button-rounded"></a>
        <h2 class="font-bold text-2xl text-gray-800">Crear Nuevo Ticket de Soporte</h2>
      </div>

      <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 p-fluid">

          <div class="md:col-span-2 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Título del ticket *</label>
            <input
              pInputText
              id="title"
              formControlName="title"
              class="w-full"
              placeholder="Ej: No puedo acceder a mi correo"
            />
          </div>

          <div class="mb-6 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Ticket *</label>
            <p-dropdown
              inputId="typeTicketId"
              [options]="typeOptions"
              formControlName="typeTicketId"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione el tipo de solicitud"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Oficina *</label>
            <p-dropdown
              inputId="officeId"
              [options]="officeOptions"
              formControlName="officeId"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione una oficina"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Área *</label>
            <p-dropdown
              inputId="areaId"
              [options]="areaOptions"
              formControlName="areaId"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un área"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="md:col-span-2 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción del ticket *</label>
            <p-editor
              formControlName="description"
              [style]="{ height: '200px' }">
            </p-editor>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-secondary" routerLink="/tickets"></button>
          <button pButton type="submit" label="Crear Ticket" icon="pi pi-check" [disabled]="ticketForm.invalid || isSubmitting" [loading]="isSubmitting"></button>
        </div>
      </form>
    </div>
  `,
  // Los estilos no cambian
  styles: `
   .p-error { display: block; margin-top: 0.25rem; }
   .ng-invalid.ng-touched { border-color: #dc3545 !important; }
  `
})
export class TicketCreateComponent implements OnInit {
  ticketForm!: FormGroup;
  officeOptions: any[] = [];
  areaOptions: any[] = [];
  typeOptions: any[] = []; // <-- Propiedad nueva
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeOptions();
    this.initializeForm();
  }

  private initializeOptions(): void {
    this.officeOptions = [
      { label: 'Oficina Central (CTO LPB)', value: 1 },
      { label: 'Aeropuerto (ATO CBB)', value: 2 },
      { label: 'Ventas Centro', value: 3 }
    ];

    this.areaOptions = [
      { label: 'Ventas', value: 1 },
      { label: 'Tráfico', value: 2 },
      { label: 'Sistemas', value: 3 },
      { label: 'Administración', value: 4 }
    ];

    // CAMBIO: Se inicializan las opciones para el nuevo campo
    this.typeOptions = Object.keys(TicketType)
      .filter(key => !isNaN(Number(TicketType[key as any])))
      .map(key => ({ label: key, value: Number(TicketType[key as any]) }));
  }

  private initializeForm(): void {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      typeTicketId: [null, Validators.required], // <-- Control nuevo
      officeId: [null, Validators.required],
      areaId: [null, Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, complete todos los campos requeridos.' });
      return;
    }

    this.isSubmitting = true;

    // CAMBIO: Se añade typeTicketId al objeto que se envía
    const dto: CreateTicketDto = {
      title: this.ticketForm.value.title.trim(),
      description: this.ticketForm.value.description,
      officeId: this.ticketForm.value.officeId,
      areaId: this.ticketForm.value.areaId,
      typeTicketId: this.ticketForm.value.typeTicketId, // <-- Propiedad nueva
      requesterId: 1 // TODO: Obtener del servicio de autenticación
    };

    this.ticketService.createTicket(dto).subscribe({
      next: (newTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Ticket #${newTicket.id} creado correctamente.` });
        setTimeout(() => {
          this.router.navigate(['/tickets', newTicket.id]);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket. Por favor, intente nuevamente.' });
        console.error('Error creating ticket:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
