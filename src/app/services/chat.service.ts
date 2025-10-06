import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface ChatMessage {
  id?: number;
  content: string;
  user_email: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private channel: any;

  constructor(private supabaseService: SupabaseService) {
    this.loadMessages();
    this.subscribeToMessages();
  }

  // Cargar mensajes existentes
  async loadMessages() {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      this.messagesSubject.next(data || []);
      return data;
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      throw error;
    }
  }

  // Enviar un nuevo mensaje
  async sendMessage(content: string, userEmail: string) {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('chat_messages')
        .insert([{
          content: content.trim(),
          user_email: userEmail
        }])
        .select();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  // Suscribirse a cambios en tiempo real
  private subscribeToMessages() {
    this.channel = this.supabaseService.supabase
      .channel('chat_messages_realtime', {
        config: {
          broadcast: { self: false }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        console.log('Nuevo mensaje detectado:', payload);
        // Agregar el nuevo mensaje directamente sin recargar todo
        const newMessage = payload.new as ChatMessage;
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, newMessage]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        console.log('Mensaje eliminado:', payload);
        // Remover el mensaje eliminado
        const deletedMessage = payload.old as ChatMessage;
        const currentMessages = this.messagesSubject.value;
        const filteredMessages = currentMessages.filter(msg => msg.id !== deletedMessage.id);
        this.messagesSubject.next(filteredMessages);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        console.log('Mensaje actualizado:', payload);
        // Actualizar el mensaje modificado
        const updatedMessage = payload.new as ChatMessage;
        const currentMessages = this.messagesSubject.value;
        const updatedMessages = currentMessages.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        );
        this.messagesSubject.next(updatedMessages);
      })
      .subscribe((status) => {
        console.log('Estado del canal de tiempo real:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Chat en tiempo real conectado exitosamente');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en la conexión de tiempo real');
          // Intentar reconectar después de 5 segundos
          setTimeout(() => this.reconnectRealtime(), 5000);
        }
      });
  }

  // Reconectar el tiempo real en caso de error
  private reconnectRealtime() {
    console.log('🔄 Intentando reconectar tiempo real...');
    this.unsubscribe();
    this.subscribeToMessages();
  }

  // Limpiar suscripciones cuando sea necesario
  unsubscribe() {
    if (this.channel) {
      this.supabaseService.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  // Verificar el estado de la conexión en tiempo real
  getConnectionStatus(): string {
    return this.channel?.state || 'disconnected';
  }

  // Método para forzar una reconexión manual
  forceReconnect() {
    this.reconnectRealtime();
  }
}