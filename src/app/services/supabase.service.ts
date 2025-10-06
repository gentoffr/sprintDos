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
  async guardarStatsAhorcado(usuario: any, aciertos: number, errores: number) {
    // Guarda estadísticas del juego ahorcado para un usuario
    const { data, error } = await this.supabase
      .from('ahorcado') // nombre de la tabla en Supabase
      .insert([
        {
          user_id: usuario.id,
          aciertos: aciertos,
          errores: errores,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error guardando estadísticas:', error);
      throw error;
    }
    return data;
  }
  async guardarStatsHiLo(stats: {
    usuario_id: string;
    puntaje: number;
    tiempo: number;
    fecha: string;
  }) {
    // Guarda estadísticas del juego mayor o menor para un usuario
    const { data, error } = await this.supabase
      .from('mayor_o_menor') // nombre de la tabla en Supabase
      .insert([stats]);

    if (error) {
      console.error('Error guardando estadísticas:', error);
      throw error;
    }
    return data;
  }

  async guardarPreguntados(usuario: string, aciertos: number, errores: number) {
    const fecha = new Date().toISOString();
    console.debug('[DEBUG] Insertando en preguntados:', { usuario, aciertos, errores, fecha });
    const { data, error } = await this.supabase.from('preguntados').insert([
      {
        usuario,
        aciertos,
        errores,
        fecha,
      },
    ]);

    if (error) {
      console.error('[ERROR] Error al guardar en preguntados:', error.message, error);
      return { error };
    }

    console.debug('[DEBUG] Estadística de preguntados guardada:', data);
    return { data };
  }
  async actualizarPreguntados(user_id: BigInteger, esAcierto: boolean) {
    console.log('[DEBUG] Actualizando preguntados para usuario:', user_id, '¿Acierto?', esAcierto);
    const { data: existente, error: errorSelect } = await this.supabase
      .from('preguntados')
      .select('id, aciertos, errores')
      .eq('user_id', user_id)
      .eq('finalizada', false)
      .single();
    console.log('Existente:', existente, 'Error select:', errorSelect);
    if (errorSelect && errorSelect.code !== 'PGRST116') {
      console.error('[ERROR] Error al buscar el registro de preguntados:', errorSelect.message, errorSelect);
      return { error: errorSelect };
    }

    if (!existente) {
      console.debug('[DEBUG] No existe registro, creando nuevo en preguntados');
      const { error: errorInsert } = await this.supabase.from('preguntados').insert([
        {
          user_id: user_id,
          aciertos: esAcierto ? 1 : 0,
          errores: esAcierto ? 0 : 1,
          fecha: new Date().toISOString(),
        },
      ]);

      if (errorInsert) {
        console.error('[ERROR] Error al insertar nuevo registro en preguntados:', errorInsert.message, errorInsert);
        return { error: errorInsert };
      }
    } else {
      const nuevosAciertos = existente.aciertos + (esAcierto ? 1 : 0);
      const nuevosErrores = existente.errores + (esAcierto ? 0 : 1);
      console.debug('[DEBUG] Actualizando registro existente preguntados:', { id: existente.id, nuevosAciertos, nuevosErrores });
      const { error: errorUpdate } = await this.supabase
        .from('preguntados')
        .update({
          aciertos: nuevosAciertos,
          errores: nuevosErrores,
          fecha: new Date().toISOString(),
        })
        .eq('id', existente.id);

      if (errorUpdate) {
        console.error('[ERROR] Error al actualizar preguntados:', errorUpdate.message, errorUpdate);
        return { error: errorUpdate };
      }
    }

    return { success: true };
  }
  async finalizarPartidaPreguntados(user_id: BigInteger) {
    console.debug('[DEBUG] Finalizando partida preguntados para usuario:', user_id);
    const { data: partida, error } = await this.supabase
      .from('preguntados')
      .select('id')
      .eq('user_id', user_id)
      .eq('finalizada', false)
      .single();

    if (error || !partida) {
      console.error('[ERROR] No se encontró partida activa para finalizar:', error?.message, error);
      return;
    }

    console.debug('[DEBUG] Actualizando partida a finalizada, id:', partida.id);
    const { error: updateError } = await this.supabase
      .from('preguntados')
      .update({ finalizada: true })
      .eq('id', partida.id);

    if (updateError) {
      console.error('[ERROR] Error al finalizar partida:', updateError.message, updateError);
    }
  }
  async iniciarNuevaPartidaPreguntados(user_id: bigint) {
    console.debug('[DEBUG] Iniciando nueva partida preguntados para user_id:', user_id);
    const { data: activa, error } = await this.supabase
      .from('preguntados')
      .select('id')
      .eq('user_id', user_id)
      .eq('finalizada', false)
      .single();

    if (!activa) {
      console.debug('[DEBUG] No hay partida activa, creando nueva partida preguntados');
      const { error: insertError } = await this.supabase.from('preguntados').insert([
        {
          user_id,
          aciertos: 0,
          errores: 0,
          fecha: new Date().toISOString(),
          finalizada: false,
        },
      ]);

      if (insertError) {
        console.error('[ERROR] Error al iniciar nueva partida:', insertError.message, insertError);
      }
    }
  }
  async getPuntajePreguntados(user_id: bigint) {
    const { data, error } = await this.supabase
      .from('preguntados')
      .select('aciertos, errores')
      .eq('user_id', user_id);
    if (error) {
      console.error('Error obteniendo puntaje preguntados:', error);
      throw error;
    }
    return data;
  }
  // ...existing code...
  async postCoinflip(user_id: String, aciertos: number, errores: number) {
    try {
      // Buscar si ya existe registro para el usuario
      const { data: existente, error: errorSelect } = await this.supabase
        .from('coinflip')
        .select('id')
        .eq('id', user_id)
        .single();

      if (errorSelect && errorSelect.code !== 'PGRST116') {
        // Error inesperado al buscar
        console.error('Error buscando registro coinflip:', errorSelect);
        return errorSelect;
      }

      if (!existente) {
        // No existe, insertar nuevo registro
        const { data, error } = await this.supabase
          .from('coinflip')
          .insert([
            { id: user_id, aciertos, errores, created_at: new Date().toISOString() },
          ]);
        if (error) {
          console.error('Error insertando coinflip:', error);
          return error;
        }
        return data;
      } else {
        // Existe, actualizar registro
        const { data, error } = await this.supabase
          .from('coinflip')
          .update({
            aciertos,
            errores,
          })
          .eq('id', user_id);
        if (error) {
          console.error('Error actualizando coinflip:', error);
          return error;
        }
        return data;
      }
    } catch (error) {
      console.error('Error en postCoinflip:', error);
      return error;
    }
  }
// ...existing code...

  async getCoinflipStats(user_id: String) {
    try {
      const { data, error } = await this.supabase
        .from('coinflip')
        .select('*')
        .eq('id', user_id)
        .order('created_at', { ascending: false });
      return data;
    } catch (error) {
      console.error('Error obteniendo stats coinflip:', error);
      return error;
    }
  }
}
