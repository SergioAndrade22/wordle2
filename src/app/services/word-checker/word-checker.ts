import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WordChecker {
  private baseURL = 'https://api.dictionaryapi.dev/api/v2/entries';
  private http = inject(HttpClient);

  async checkWord(word: string, language: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.get<{ word?: string }[]>(`${this.baseURL}/${language}/${word.toLowerCase()}`));
      return response.length > 1 || response[0]?.word === word.toLowerCase();
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 404) {
          return false;
        }
      }
      console.error(error);
      return false;
    }
  }
}
