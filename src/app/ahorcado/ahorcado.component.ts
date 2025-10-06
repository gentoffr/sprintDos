import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-ahorcado',
  standalone: true,
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.css'],
  imports: [CommonModule,]
})
export class AhorcadoComponent implements OnInit {
  letras: string[] = [];
  palabraSecreta: string = '';
  palabraOculta: string = '';
  intentosRestantes: number = 6;
  juegoTerminado: boolean = false;
  mensaje: string = '';

  fila1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  fila2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  fila3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  errores: number = 0;
  aciertos: number = 0;
  letrasSeleccionadas: string[] = [];
  erroresTotales: number = 0;
  usuario: any = 'Jugador1';
  private userSub: any;

  constructor(private dbService: SupabaseService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userSub = this.authService.user$.subscribe(u => {
      this.usuario = u;
    });
    this.inicializarJuego();
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }

  inicializarJuego() {
    this.errores = 0;
    this.letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const palabras = ['ANGULAR', 'AHORCADO', 'JUEGO', 'PROGRAMACION', 'COMPONENTE', 'WEB', 'LABORATORIO', 'USUARIO', 'TYPESCRIPT', 'SERVICIO', 'APLICACION', 'HORCA', 'PALABRA'];
    this.palabraSecreta = palabras[Math.floor(Math.random() * palabras.length)];
    this.palabraOculta = '_'.repeat(this.palabraSecreta.length);
    this.intentosRestantes = 6;
    this.juegoTerminado = false;
    this.mensaje = '';
    this.letrasSeleccionadas = [];
  }

  seleccionarLetra(letra: string) {
    if (this.juegoTerminado || this.letrasSeleccionadas.includes(letra)) return;
    this.letrasSeleccionadas.push(letra);
    let acierto = false;
    let nuevaPalabraOculta = '';
    for (let i = 0; i < this.palabraSecreta.length; i++) {
      if (this.palabraSecreta[i] === letra) {
        nuevaPalabraOculta += letra;
        acierto = true;
      } else {
        nuevaPalabraOculta += this.palabraOculta[i];
      }
    }
    this.palabraOculta = nuevaPalabraOculta;
    if (!acierto) {
      this.intentosRestantes--;
      this.errores++;
    }
    this.verificarEstadoJuego();
  }

  verificarEstadoJuego() {
    if (this.palabraOculta === this.palabraSecreta) {
      this.aciertos++;
      this.mensaje = '¡Ganaste!';
      this.juegoTerminado = true;
      // Aquí podrías guardar stats de victoria si quieres
    } else if (this.intentosRestantes === 0) {
      // Mostrar el moñigote final inmediatamente, pero retrasar el mensaje y el estado de derrota
      setTimeout(() => {
        this.mensaje = `¡Perdiste! La palabra era: ${this.palabraSecreta}`;
        this.juegoTerminado = true;
        this.erroresTotales += this.errores;
        this.dbService.guardarStatsAhorcado(this.usuario, this.aciertos, this.erroresTotales).then((error) => {
          if (error) {
            console.error('Error al guardar las estadísticas:', error);
          } else {
            console.log('Estadísticas guardadas exitosamente.');
          }
        });
      }, 600); // 600ms para mostrar el moñigote antes de la pantalla de derrota
    }
  }
  volver(){
    this.router.navigate(['/home/juegos']);
  }
}
