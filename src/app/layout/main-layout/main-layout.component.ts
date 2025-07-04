import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <aside class="w-64 bg-gray-800 text-white p-4">
        <h2 class="text-2xl font-bold mb-4">Help Desk</h2>
        <nav>
          <ul>
            <li class="mb-2"><a routerLink="/dashboard" routerLinkActive="font-bold bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Dashboard</a></li>
            <li class="mb-2"><a routerLink="/tickets" routerLinkActive="font-bold bg-gray-700" class="block p-2 rounded hover:bg-gray-700">Tickets</a></li>
          </ul>
        </nav>
      </aside>

      <main class="flex-1 flex flex-col">
        <header class="bg-white shadow p-4">
          <h1 class="text-xl font-semibold">Bienvenido</h1>
        </header>

        <div class="flex-1 p-6 overflow-y-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class MainLayoutComponent { }
