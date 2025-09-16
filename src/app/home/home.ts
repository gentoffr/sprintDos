import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Cada vez que cambia el usuario, se actualiza esta variable
    this.authService.user$.subscribe(u => {
      this.user = u;
    });
  }
  logout() {
    this.authService.logout().then(() => {
      window.location.href = '/login'; // Redirige al login después de cerrar sesión
    });
  }
}