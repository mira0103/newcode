import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  get(key: string) {
    const json = localStorage.getItem(key);

    if (json) {
      return JSON.parse(json);
    }

    return null;
  }

  set(key: string, obj: object) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  update(key: string, value: any) {
    this.set(key, value);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  removeAll() {
    localStorage.clear();
  }
}
