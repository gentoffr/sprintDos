import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast.component/toast.component';
import { ChatComponent } from './chat/chat.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastComponent, ChatComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('sprintDos');
  user$;
  currentRoute = '';

  constructor(public authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
    this.currentRoute = this.router.url;
  }

  showChat(): boolean {
    return this.currentRoute !== '/login' && this.currentRoute !== '/registro';
  }
}
