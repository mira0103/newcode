import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TempStorageService {
  tempStorage: Map<string, any> = new Map();

  constructor() { }

  get(key: string) {
    if (!this.tempStorage.get(key)) {
      return null;
    }

    return this.tempStorage.get(key);
  }

  set(key: string, value: any) {
    return this.tempStorage.set(key, value);
  }

  update(key: string, value: any) {
    this.set(key, value);
  }

  remove(key: string) {
    this.tempStorage.delete(key);
  }

  removeAll() {
    this.tempStorage.clear();
  }
}
