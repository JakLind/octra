import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timespan2',
  pure: false
})
export class Timespan2Pipe implements PipeTransform {

  private timespan = 0;
  private FormatNumber = (num, length): string => {
    let result = '' + num.toFixed(0);
    while (result.length < length) {
      result = '0' + result;
    }
    return result;
  };

  private get Seconds(): number {
    return Math.floor(this.timespan / 1000) % 60;
  }

  private get Minutes(): number {
    return Math.floor(this.timespan / 1000 / 60);
  }

  private get Hours(): number {
    return Math.floor(this.timespan / 1000 / 60 / 60);
  }

  transform(value: any, args?: any): any {
    this.timespan = Number(value);
    if (this.timespan < 0) {
      this.timespan = 0;
    }

    let result = '';
    const minutes: string = this.FormatNumber(this.Minutes, 2);
    const seconds: string = this.FormatNumber(this.Seconds, 2);
    const hours: string = this.FormatNumber(this.Hours, 2);

    result += hours + ':' + minutes + ':' + seconds;

    return result;
  }

}
