import { Component, computed, inject, Signal, signal } from '@angular/core';
import { WordGenerator } from './services/word-generator/word-generator';
import { CommonModule } from '@angular/common';
import { WordChecker } from './services/word-checker/word-checker';
import { Language, LanguageHandler } from './services/language/language';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Configuration constants
  protected title = 'Wordle 2.0 - When one word is not enough';
  protected difficultyList = {
    easy: 8,
    medium: 5,
    hard: 3,
  };
  protected possibleDifficulties = Object.keys(this.difficultyList);
  protected allLetters = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Services
  protected wordGenerator = inject(WordGenerator);
  protected wordChecker = inject(WordChecker);
  protected languageHandler = inject(LanguageHandler);

  // Configuration variables
  protected loading = signal<boolean>(false);
  protected selectedLanguage = signal<string>('en');
  protected selectedWordLength = signal<number>(3);
  protected difficulty = signal<string>('easy');
  protected numberOfTries: Signal<number[]>;

  // Game variables
  protected word = signal<string>('');
  protected currentTry = signal<number>(0);
  protected wordArray = signal<{ element: HTMLSpanElement, letter: string }[]>([]);
  protected wordIsCorrect = signal<boolean>(false);

  constructor() {
    this.numberOfTries = computed(() => Array.from({ length: this.difficultyList[this.difficulty() as keyof typeof this.difficultyList] }, (_, i) => i));
  }

  getDifficultyTranslation(difficulty: string) {
    const key = 'difficulty-levels.' + difficulty as unknown as keyof Language;
    return this.languageHandler.getTranslation(key);
  }

  resetGame() {
    this.word.set('');
    this.wordArray.set([]);
    this.wordIsCorrect.set(false);
    this.currentTry.set(0);
    for (let letter of document.querySelectorAll('.letter')) {
      letter.classList.remove('right-letter');
      letter.classList.remove('wrong-position-letter');
      letter.classList.remove('wrong-letter');
    }
    for (let letter of document.querySelectorAll('span.word>span.letter')) {
      letter.textContent = '';
    }
  }

  onLanguageChange(event: Event) {
    const language = (event.target as HTMLSelectElement).value;
    this.selectedLanguage.set(language);
    this.languageHandler.setLanguage(language);
  }

  onWordLengthChange(event: Event) {
    this.selectedWordLength.set(Number((event.target as HTMLSelectElement).value));
    this.languageHandler.setLanguage(this.selectedLanguage());
  }

  onDifficultyChange(event: Event) {
    this.difficulty.set((event.target as HTMLSelectElement).value);
  }

  onGenerateWord() {
    this.loading.set(true);
    this.wordGenerator.getWord(this.selectedLanguage(), this.selectedWordLength()).subscribe((word) => {
      this.resetGame();
      this.word.set(word.toUpperCase());
      this.loading.set(false);
    });
  }

  onLetterInput(event: Event) {
    const target = event.target as HTMLElement;
    const text = target.textContent || '';

    // Keep only the first character
    if (text.length > 1) {
      const letter = text.charAt(0).toUpperCase();  
      target.textContent = letter;
      this.wordArray.set([...this.wordArray(), { element: target, letter }]);
    }
  }

  onLetterKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const text = target.textContent || '';
    
    // Allow backspace, delete, arrow keys, etc.
    if (event.key === 'Backspace' || event.key === 'Delete' || 
        event.key.startsWith('Arrow') || event.key === 'Tab' || event.key === 'Shift') {
      return;
    }
  
    // If there's already a character and user types another; or enter, or space, prevent it
    if ((text.length >= 1 && event.key.length === 1) || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      return;
    }

    this.wordArray.set([...this.wordArray(), { element: target, letter: event.key.toUpperCase() }]);
    setTimeout(() => {
      (target.nextElementSibling as HTMLElement)?.focus();
    }, 15);
  }

  onLetterPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  async onWordCheck(event: KeyboardEvent, idx: number) {
    if (event.key === 'Enter' && this.wordArray().length === this.word().length) {
      const wordExists = await this.wordChecker.checkWord(this.wordArray().map((letter) => letter.letter).join(''), this.selectedLanguage());
      if (!wordExists) {
        alert('Word does not exist');
        for (let element of this.wordArray()) {
          element.element.classList.remove('right-letter');
          element.element.classList.remove('wrong-position-letter');
          element.element.classList.remove('wrong-letter');
          element.element.textContent = '';
        }
        this.wordArray.set([]);
        return;
      }
      if (!this.verifyWord()) {
        this.currentTry.set(this.currentTry() + 1);
        this.wordArray.set([]);
        setTimeout(() => {
          ((((event.target as HTMLElement).parentElement as HTMLElement).nextElementSibling as HTMLElement).firstChild as HTMLElement)?.focus();
        }, 15);
      } else {
        this.win();
      }
    }
  }

  verifyWord() {
    let isCorrect = true;
    for (let i = 0; i < this.wordArray().length; i++) {
      if (!this.word().includes(this.wordArray()[i].letter)) {
        this.wordArray()[i].element.classList.add('wrong-letter');
        const keyboardLetter = document.querySelector(`[data-letter="${this.wordArray()[i].letter.toUpperCase()}"]`);
        if (keyboardLetter) {
          keyboardLetter.classList.add('wrong-letter');
        }
        isCorrect = false;
      } else if (this.wordArray()[i].letter !== this.word()[i]) {
        this.wordArray()[i].element.classList.add('wrong-position-letter');
        const keyboardLetter = document.querySelector(`[data-letter="${this.wordArray()[i].letter.toUpperCase()}"]`);
        if (keyboardLetter) {
          keyboardLetter.classList.add('wrong-position-letter');
        }
        isCorrect = false;
      } else {
        this.wordArray()[i].element.classList.add('right-letter');
        const keyboardLetter = document.querySelector(`[data-letter="${this.wordArray()[i].letter.toUpperCase()}"]`);
        if (keyboardLetter) {
          keyboardLetter.classList.add('right-letter');
        }
      }
    }
    return isCorrect;
  }

  win() {
    this.wordIsCorrect.set(true);
  }

  trackByFn(letterIndex: number, letter: string) {
    return `letterIndex-${letterIndex}-letter-${letter}`;
  }
}
