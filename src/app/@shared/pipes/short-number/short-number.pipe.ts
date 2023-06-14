import { Pipe, PipeTransform } from '@angular/core';
import * as shortNumber from 'short-number';

@Pipe({
  name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    if (value) {
      return shortNumber(value);
    }

    return '0';
  }

}
