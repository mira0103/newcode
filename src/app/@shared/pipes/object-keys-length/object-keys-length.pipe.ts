import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectKeysLength'
})
export class ObjectKeysLengthPipe implements PipeTransform {

  transform(value: object, ...args: unknown[]): number {
    if (!value) {
      return 0;
    } else {
      const keyLength: number = Object.keys(value).length;
      if (keyLength > 0) {
        return keyLength;
      }
    }

    return 0;
  }
}
