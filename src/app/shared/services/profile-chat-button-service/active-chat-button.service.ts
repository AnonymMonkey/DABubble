import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActiveChatButtonService {
  public _activeButtonId: string | null = null;

  setActiveButton(buttonId: string) {
    this._activeButtonId = buttonId;
  }

  get activeButtonId(): string | null {
    return this._activeButtonId;
  }
}
