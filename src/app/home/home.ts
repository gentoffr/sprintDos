import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
// import { ChatService, ChatMessage } from '../services/chat.service';
import { SupabaseService } from '../services/supabase.service';
import { PaisService, Pais } from '../services/pais.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CardsJuegos } from './cards-juegos/cards-juegos';
import { RouterOutlet } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, CommonModule, RouterOutlet, RouterLinkActive],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  user: any = null;
  private subscriptions: Subscription[] = [];
  usuariosPais: { [email: string]: string } = {};
  paises: Pais[] = [];

  constructor(
    private authService: AuthService,
  // private chatService: ChatService,
    private supabaseService: SupabaseService,
    private paisService: PaisService
  ) {
  }

  async ngOnInit() {
    // Cada vez que cambia el usuario, se actualiza esta variable
    const userSub = this.authService.user$.subscribe(u => {
      this.user = u;
    });
    this.subscriptions.push(userSub);

    // Cargar países de usuarios
    await this.loadUsuariosPais();

    // ...existing code...
  }
  async loadUsuariosPais() {
    try {
      const usuarios = await this.supabaseService.getUsers();
      this.usuariosPais = {};
      for (const u of usuarios) {
        this.usuariosPais[u.email] = u.pais;
      }
    } catch (e) {
      // Si falla, no rompe el chat
      this.usuariosPais = {};
    }
  }

  getBanderaPais(email: string): string | null {
    const codigo = this.usuariosPais[email];
    if (!codigo) return null;
    return `https://flagcdn.com/24x18/${codigo}.png`;
  }

  getNombrePais(email: string): string | null {
    const codigo = this.usuariosPais[email];
    if (!codigo) return null;
    const pais = this.paises.find(p => p.codigo === codigo);
    return pais ? pais.nombre : null;
  }
  // ...existing code...

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout() {
    this.authService.logout().then(() => {
      this.authService.redirectToLogin();
    });
  }

  // ...existing code...
}