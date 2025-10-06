import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-mayor-o-menor',
  templateUrl: './mayor-o-menor.component.html',
  styleUrls: ['./mayor-o-menor.component.css'],
  imports: [CommonModule],
})
export class MayorOMenorComponent implements OnInit {
  barajaId: string = '';
  cartaActual: any = null;
  cartaSiguiente: any = null;
  isCardReady: boolean = false;
  puntaje: number = 0;
  mensaje: string = '';
  jugando: boolean = false;
  usuario: any = 'Jugador1';
  private userSub: any;
  tiempo: number = 0;
  intervalo: any = null;

  constructor(private dbService: SupabaseService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.crearBaraja();
    this.userSub = this.authService.user$.subscribe(u => {
      this.usuario = u;
    });
  }

  async crearBaraja() {
    await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then((response) => response.json())
      .then((data) => {
        this.barajaId = data.deck_id;
        this.iniciarJuego();
      });
  }

  iniciarJuego() {
    this.puntaje = 0;
    this.mensaje = '';
    this.jugando = true;
    this.isCardReady = false;
    this.tiempo = 0;

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    this.intervalo = setInterval(() => {
      this.tiempo++;
    }, 1000);

    this.obtenerCarta();
  }

  async terminarJuego() {
    this.mensaje += ` Tu puntaje final es ${this.puntaje} en ${this.tiempo} segundos.`;
    this.jugando = false;
    this.isCardReady = false;

    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }

    if (this.usuario && this.usuario.email) {
      try {
        await this.dbService.guardarStatsHiLo({
          usuario_id: this.usuario.id,
          puntaje: this.puntaje,
          tiempo: this.tiempo,
          fecha: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error guardando la partida:', e);
      }
    } else {
      console.warn('No se pudo guardar la partida: usuario no logueado.');
    }
  }

  async obtenerCarta() {
    if (!this.barajaId) return;

    await fetch(`https://deckofcardsapi.com/api/deck/${this.barajaId}/draw/?count=1`)
      .then((response) => response.json())
      .then((data) => {
        if (data.cards && data.cards.length > 0) {
          if (!this.cartaActual) {
            this.cartaActual = data.cards[0];
            // load the next card so the UI is ready for the first guess
            this.obtenerCarta();
            this.isCardReady = !!this.cartaActual && !!this.cartaSiguiente;
          } else {
            this.cartaSiguiente = data.cards[0];
            this.isCardReady = !!this.cartaActual && !!this.cartaSiguiente;
          }
        } else {
          this.terminarJuego();
        }
      });
  }

  convertirValorCarta(valor: string): number {
    if (valor === 'KING') {
      return 13;
    } else if (valor === 'QUEEN') {
      return 12;
    } else if (valor === 'JACK') {
      return 11;
    } else if (valor === 'ACE') {
      return 1;
    } else {
      return parseInt(valor);
    }
  }

  adivinarMayor() {
    if (!this.jugando || !this.cartaSiguiente || !this.isCardReady) return;

    const valorCartaActual = this.convertirValorCarta(this.cartaActual.value);
    const valorCartaSiguiente = this.convertirValorCarta(
      this.cartaSiguiente.value
    );

    if (valorCartaSiguiente > valorCartaActual) {
      this.puntaje++;
      this.mensaje = '¡Correcto!';
    } else if (valorCartaSiguiente === valorCartaActual) {
      this.mensaje = 'Las cartas son iguales. No suma punto, pero continúa.';
    } else {
      this.mensaje = '¡Incorrecto!';
      this.terminarJuego();
    }

    this.cartaActual = this.cartaSiguiente;
    this.isCardReady = false;
    this.obtenerCarta();
  }

  adivinarMenor() {
    if (!this.jugando || !this.cartaSiguiente || !this.isCardReady) return;

    const valorCartaActual = this.convertirValorCarta(this.cartaActual.value);
    const valorCartaSiguiente = this.convertirValorCarta(
      this.cartaSiguiente.value
    );

    if (valorCartaSiguiente < valorCartaActual) {
      this.puntaje++;
      this.mensaje = '¡Correcto!';
    } else if (valorCartaSiguiente === valorCartaActual) {
      this.mensaje = 'Las cartas son iguales. No suma punto, pero continúa.';
    } else {
      this.mensaje = '¡Incorrecto!';
      this.terminarJuego();
    }

    this.cartaActual = this.cartaSiguiente;
    this.isCardReady = false;
    this.obtenerCarta();
  }
  volver(){
    this.router.navigate(['/home/juegos']);
  }
}
