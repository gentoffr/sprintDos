// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.supabase.auth.getSession().then(({ data }) => {
      this.userSubject.next(data.session?.user ?? null);
    });

    // Escuchar cambios de sesión
    this.supabaseService.supabase.auth.onAuthStateChange((_event, session) => {
      this.userSubject.next(session?.user ?? null);
    });
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error };
    }
    this.userSubject.next(data.user);
    return { user: data.user };
  }
  redirectToHome() {
    window.location.href = '/home';
  }
  logout() {
    return this.supabaseService.supabase.auth.signOut();
  }
}
