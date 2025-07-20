import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordGenerator {
  private languageList = ['en', 'es', 'fr', 'de', 'it', 'zh', 'pt-br'];
  private baseUrl = 'https://random-word-api.herokuapp.com/word';
  private http = inject(HttpClient);

  getAvailableLanguages() {
    return this.languageList;
  }

  getWord(language: string, wordLength: number): Observable<string> {
    if (language === 'en') {
      return this.http.get<string[]>(`${this.baseUrl}?length=${wordLength}`).pipe(
        map((res: string[]) => res[0])
      );
    }
    return this.http.get<string[]>(`${this.baseUrl}?length=${wordLength}&lang=${language}`).pipe(
      map((res: string[]) => res[0])
    );
  }
}
