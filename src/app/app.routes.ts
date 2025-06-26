import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
   {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'tickets',
                pathMatch: 'full'
            },
            {
                path: 'tickets',
                // Carga diferida (lazy loading) del componente de la lista de tickets
                loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
            }
            // Aquí añadiremos las rutas para el detalle, creación, etc.
        ]
    }
];
