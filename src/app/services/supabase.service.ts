import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      global: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    });
  }

  // ejemplo: traer todos los usuarios
  async getUsers() {
    const { data, error } = await this.supabase
      .from('usuarios') // tabla en tu base
      .select('*');

    if (error) throw error;
    return data;
  }

  async addUser(email: any, password: any) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .insert([
        {
          email: email,
          password: password,
        },
      ])
      .select();

    if (error) {
      console.error('Error insertando:', error);
      return;
    }

    console.log('Usuario creado:', data);
  }
}
