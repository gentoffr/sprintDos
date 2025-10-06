import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-coinflip',
  imports: [CommonModule],
  templateUrl: './coinflip.component.html',
  styleUrls: ['./coinflip.component.css']
})
export class CoinflipComponent implements OnInit{
  currentDegrees = 0;
  aciertos:any = 0;
  errores:any = 0;
  userSub: any;
  isFlipping = false;
  seleccion: 'rojo' | 'azul' | null = null;
  usuario: any = 'Jugador1';
  constructor(private toast: ToastService, private router: Router, private authService: AuthService, private supabaseService: SupabaseService) {}

  seleccionar(color: 'rojo' | 'azul') {
    this.seleccion = color;
  }
  async ngOnInit() {
    this.userSub = this.authService.user$.subscribe(u => {
      this.usuario = u;
    });
    const puntaje: any = await this.supabaseService.getCoinflipStats(this.usuario.id);
    if (!puntaje || puntaje.length === 0) {
      this.aciertos = 0;
      this.errores = 0;
      return;
    }
    this.aciertos = puntaje[0].aciertos;
    this.errores = puntaje[0].errores;
    console.log(puntaje);
  }
  async onFlipCoin(coinElement: HTMLElement) {
    if (this.isFlipping) return;
    if (!this.seleccion) {
      this.toast.info('Selecciona Rojo o Azul antes de tirar la moneda');
      return;
    }

    this.isFlipping = true;

    const random = Math.floor(Math.random() * 4 + 9); 
    this.currentDegrees += 180 * random;

    // Determinar resultado: azul si par, rojo si impar
    const resultado = this.currentDegrees % 360 === 0 ? 'azul' : 'rojo';

  coinElement.style.transform = `translate(-50%, -50%) rotateX(${this.currentDegrees}deg)`;

    setTimeout(async () => {
      if (this.seleccion === resultado) {
        this.aciertos++;
      } else {
        this.errores++;
      }
      this.isFlipping = false;
      this.seleccion = null;
      await this.supabaseService.postCoinflip(this.usuario.id, this.aciertos, this.errores);
    }, 5000 );
    if (!this.isFlipping) {
      
    }
  }
  volver() {
    this.router.navigate(['/home/juegos']);
  }
}
