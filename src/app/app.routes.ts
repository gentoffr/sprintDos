import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  { path: 'home', 
    loadComponent: () => import('./home/home').then((m) => m.Home),
    children: [
      { path: 'juegos', loadComponent: () => import('./home/cards-juegos/cards-juegos').then((m) => m.CardsJuegos) },
      { path:'quien-soy', loadComponent: () => import('./home/quien-soy/quien-soy').then((m) => m.QuienSoy)},
    ]},
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro').then((m) => m.RegistroComponent),
  },
  {
    path: 'ahorcado',
    loadComponent: () => import('./ahorcado/ahorcado.component').then((m) => m.AhorcadoComponent),
  },
  {
    path: 'hi-lo',
    loadComponent: () =>
      import('./mayor-o-menor/mayor-o-menor.component').then((m) => m.MayorOMenorComponent),
  },
  {
    path: 'preguntados',
    loadComponent: () =>
      import('./preguntados/preguntados.component').then((m) => m.PreguntadosComponent),
  },
  {
    path: 'Coinflip',
    loadComponent: () => import('./coinflip/coinflip.component').then((m) => m.CoinflipComponent),
  },
];
