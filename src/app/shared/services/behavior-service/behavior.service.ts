import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BehaviorService {
  sideNavOpened = new BehaviorSubject<boolean>(true);
  sideNavOpened$ = this.sideNavOpened.asObservable();

  /**
   * Sets the value of the sideNavOpened BehaviorSubject.
   */
  setValue(value: boolean) {
    this.sideNavOpened.next(value);
  }
}
