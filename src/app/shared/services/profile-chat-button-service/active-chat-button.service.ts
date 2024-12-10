import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActiveChatButtonService {
  public _activeButtonId: string | null = null;

  /**
   * Sets the ID of the active chat button.
   * @param buttonId The ID of the active chat button.
   */
  setActiveButton(buttonId: string) {
    this._activeButtonId = buttonId;
  }

  /**
   * Returns the ID of the active chat button.
   * @returns The ID of the active chat button.
   */
  get activeButtonId(): string | null {
    return this._activeButtonId;
  }
}
