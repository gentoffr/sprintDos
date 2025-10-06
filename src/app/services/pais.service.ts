import { Injectable } from '@angular/core';
import paises from '../../paises.json';

export interface Pais {
	codigo: string;
	nombre: string;
}

@Injectable({
	providedIn: 'root'
})
export class PaisService {
	private paises: Pais[];

	constructor() {
		// Convertir el objeto a array de {codigo, nombre}
		this.paises = Object.entries(paises).map(([codigo, nombre]) => ({ codigo, nombre }));
	}

	getPaises(): Pais[] {
		return this.paises;
	}
}
