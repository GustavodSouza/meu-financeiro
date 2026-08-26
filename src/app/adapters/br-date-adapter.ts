import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class BrDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value !== 'string' || !value.trim()) {
      return typeof value === 'number' ? super.parse(value) : null;
    }

    const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return super.parse(value);
    }

    const [, day, month, year] = match.map(Number);
    if (month < 1 || month > 12 || day < 1) {
      return this.invalid();
    }

    try {
      return this.createDate(year, month - 1, day);
    } catch {
      return this.invalid();
    }
  }

  override format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('BrDateAdapter: Cannot format invalid date.');
    }

    const day = String(this.getDate(date)).padStart(2, '0');
    const month = String(this.getMonth(date) + 1).padStart(2, '0');
    const year = this.getYear(date);
    return `${day}/${month}/${year}`;
  }
}
