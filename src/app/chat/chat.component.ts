import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, Input } from '@angular/core';
import { ChatService, ChatMessage } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Pais, PaisService } from '../services/pais.service';
import { SupabaseService } from '../services/supabase.service';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  @Input() user: any = null;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  private subscriptions: Subscription[] = [];
  isChatVisible: boolean = false;
  connectionStatus: string = 'connecting';
  paises: Pais[] = [];
  usuariosPais: { [email: string]: string } = {};

  
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private paisService: PaisService
  ) {
    this.paises = this.paisService.getPaises();

  }

  ngOnInit() {
    const messagesSub = this.chatService.messages$.subscribe(messages => {
      const previousMessageCount = this.messages.length;
      this.messages = messages;
      if (messages.length > previousMessageCount) {
        this.shouldScrollToBottom = true;
      }
    });
    this.subscriptions.push(messagesSub);

    // Cargar países de usuarios al iniciar
    this.loadUsuariosPais();

    setInterval(() => {
      this.connectionStatus = this.chatService.getConnectionStatus();
    }, 2000);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.unsubscribe();
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
    if (this.isChatVisible) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.log('Error al hacer scroll:', err);
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    if (!this.user?.email) {
      alert('Debes iniciar sesión para enviar mensajes en el chat');
      return;
    }
    try {
      await this.chatService.sendMessage(this.newMessage, this.user.email);
      this.newMessage = '';
      this.shouldScrollToBottom = true;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error enviando mensaje. Intenta de nuevo.');
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  forceReconnect() {
    this.chatService.forceReconnect();
    this.connectionStatus = 'reconnecting';
  }

  getConnectionIndicator(): string {
    switch (this.connectionStatus) {
      case 'SUBSCRIBED': return '🟢';
      case 'CHANNEL_ERROR': return '🔴';
      case 'connecting': return '🟡';
      case 'reconnecting': return '🟡';
      default: return '⚫';
    }
  }

  trackByMessageId(index: number, message: ChatMessage): any {
    return message.id || index;
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

}
