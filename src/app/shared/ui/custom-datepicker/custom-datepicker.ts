import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [FormsModule, DatePicker],
  templateUrl: './custom-datepicker.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true,
    },
  ],
})
export class CustomDatePickerComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = 'YYYY-MM-DD';
  @Input() dateFormat: string = 'yy-mm-dd';
  @Input() disabled: boolean = false;
  @Input() inputClass: string = '';

  @Output() valueChange = new EventEmitter<string>();

  readonly internalDate = signal<Date | null>(null);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (!value) {
      this.internalDate.set(null);
      return;
    }
    if (value instanceof Date) {
      this.internalDate.set(value);
      return;
    }
    if (typeof value === 'string') {
      const parts = value.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        this.internalDate.set(new Date(year, month, day));
        return;
      }
      this.internalDate.set(new Date(value));
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDateSelect(date: Date | null): void {
    this.internalDate.set(date);
    let strVal = '';
    if (date instanceof Date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      strVal = `${year}-${month}-${day}`;
    }
    this.onChange(strVal);
    this.onTouched();
    this.valueChange.emit(strVal);
  }
}
