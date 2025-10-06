import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from '../services/http.service';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.css'],
})
export class PreguntadosComponent {
  pregunta = signal<string>('');
  cargandoPregunta = signal<boolean>(false);
  user: any;
  respuestas = signal<string[]>([]);
  correcta = signal<string>('');
  resultado = signal<string>('');
  seleccion = signal<string | null>(null);
  aciertos = signal<number>(0);
  errores = signal<number>(0);

  constructor(
    private database: SupabaseService,
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router
  ) {}

  async ngOnInit() {
    const userSub = this.authService.user$.subscribe(async (u) => {
      this.user = u;
      await this.database.getPuntajePreguntados(this.user.id).then((res) => {
        if (res && res.length > 0) {
          this.aciertos.set(res[0].aciertos);
          this.errores.set(res[0].errores);
        }
      });
    });
    const nombre = this.user.id;
    if (nombre) {
      await this.database.iniciarNuevaPartidaPreguntados(nombre);
      this.cargarPregunta();
    }
  }
  
  async ngOnDestroy() {
    const nombre = this.user.id;
    if (nombre) {
      await this.database.finalizarPartidaPreguntados(nombre);
    }
  }

  cargarPregunta() {
    this.cargandoPregunta.set(true);
    this.httpService.traerPreguntaTrivia().subscribe({
      next: (data) => {
        if (data.results.length === 0) {
          this.resultado.set(' No se pudo obtener una pregunta.');
          this.cargandoPregunta.set(false);
          return;
        }

        const resultado = data.results[0];
        const pregunta = this.decodeHtml(resultado.question);
        const correcta = this.decodeHtml(resultado.correct_answer);
        const respuestas = [resultado.correct_answer, ...resultado.incorrect_answers].map(
          this.decodeHtml
        );
        const mezcladas = this.shuffle(respuestas);

        setTimeout(() => {
          this.pregunta.set(pregunta);
          this.correcta.set(correcta);
          this.respuestas.set(mezcladas);
          this.resultado.set('');
          this.seleccion.set(null);
          this.cargandoPregunta.set(false);
        }, 2500);
      },
      error: (err) => {
        console.error('Error al traer la pregunta:', err);
        this.cargandoPregunta.set(false);
      },
    });
  }

  async responder(opcion: string) {
    this.seleccion.set(opcion);
    const esCorrecta = opcion === this.correcta();
    console.log('Respuesta seleccionada:', opcion, 'Correcta:', this.correcta(), 'Es correcta:', esCorrecta);
    console.log('User:', this.user);
    console.log('User nomrbre' + this.user.id);
    if (esCorrecta) {
      this.aciertos.update((n) => n + 1);
    } else {
      this.errores.update((n) => n + 1);
    }

    const nombre = this.user.id;
    console.log('Nombre usuario:', nombre);
    if (nombre) {
      await this.database.actualizarPreguntados(nombre, esCorrecta);
    }
  }

  shuffle(array: string[]): string[] {
    return array.sort(() => Math.random() - 0.5);
  }

  decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
  async siguientePregunta() {
    const yaRespondio = this.seleccion() !== null;

    if (!yaRespondio) {
      this.errores.update((n) => n + 1);

      const nombre = this.user.id;
      if (nombre) {
        await this.database.actualizarPreguntados(nombre, false);
      }

      this.resultado.set(' No respondiste la pregunta.');
    }

  this.cargarPregunta();
  }
  volver(){
    this.router.navigate(['/home/juegos']);
  }
}
