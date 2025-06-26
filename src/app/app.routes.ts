import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
 {
        path: '',
        component: MainLayoutComponent,
        children: [
            // CAMBIO: La ruta por defecto ahora es el dashboard
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            // RUTA NUEVA:
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'tickets',
                loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
            },
            {
                path: 'tickets/merge',
                loadComponent: () => import('./features/tickets/ticket-merge/ticket-merge.component').then(m => m.TicketMergeComponent)
            },
            {
                path: 'tickets/new',
                loadComponent: () => import('./features/tickets/ticket-create/ticket-create.component').then(m => m.TicketCreateComponent)
            },
            {
                path: 'tickets/:id',
                loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
            }
        ]
    }
];
