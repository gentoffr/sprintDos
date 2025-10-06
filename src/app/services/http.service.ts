import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(protected httpClient: HttpClient) {}

  traerPreguntaTrivia() {
    return this.httpClient.get<any>('https://opentdb.com/api.php?amount=1&type=multiple');
  }
}
