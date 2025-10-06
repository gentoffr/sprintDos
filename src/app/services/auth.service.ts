// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.supabaseService.supabase.auth.getSession().then(({ data }) => {
      this.userSubject.next(data.session?.user ?? null);
    });

    // Escuchar cambios de sesión
    this.supabaseService.supabase.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      this.userSubject.next(data.user);
      return { user: data.user };
    } catch (error) {
      return { error };
    }
  }
  async register(email: string, password: string, pais: string) {
    try {
      // Registro en auth
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email,
        password,
      });
      if (error || !data.user) {
        return { error: error || 'No se pudo crear el usuario en auth.' };
      }
      // Insertar en tabla usuarios solo si hay userId
      const userId = data.user.id;
      const { error: insertError } = await this.supabaseService.supabase
        .from('usuarios')
        .insert([
          { id: userId, email, pais }
        ]);
      if (insertError) {
        return { error: insertError };
      }
      return { user: data.user };
    } catch (error) {
      return { error };
    }
  }
  redirectToHome() {
    this.router.navigateByUrl("/home");
  }
  redirectToLogin() {
    this.router.navigateByUrl("/login");
  }
  logout() {
    return this.supabaseService.supabase.auth.signOut();
  }
}
