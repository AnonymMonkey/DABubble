import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userData = {
    id: 0,
    name: 'Frederik',
    lastName: 'Beck',
  };
  constructor() {}
}
