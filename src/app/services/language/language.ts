import { computed, Injectable, Signal, signal } from '@angular/core';
import en from './en.json';
import es from './es.json';

export type Language = {
  title: string;
  language: string;
  wordLength: string;
  difficulty: string;
  "difficulty-levels": {
    easy: string;
    medium: string;
    hard: string;
  };
  generateWord: string;
  loading: string;
  instructions: string;
  win: string;
};

@Injectable({
  providedIn: 'root'
})
export class LanguageHandler {
  private languages: Record<string, Language> = {
    en: en as Language,
    es: es as Language
  };
  private language = signal<string>('en');
  private translations: Signal<Language>;

  constructor() {
    this.translations = computed(() => this.languages[this.language()]);
  }

  getLanguage() {
    return this.language();
  }

  setLanguage(language: string) {
    this.language.set(language);
  }

  getTranslation(key: keyof Language): string {
    const keys = key.split('.');
    let translation = this.translations()[keys[0] as keyof Language];
    for (let i = 1; i < keys.length; i++) {
      translation = translation[keys[i] as keyof typeof translation];
    }
    return translation as string;
  }
}
