import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Select } from 'primeng/select';

export interface SelectOption {
  value: any;
  label: string;
  [key: string]: any;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './custom-select.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: (string | SelectOption)[] = [];
  @Input() placeholder: string = 'Seleccionar...';
  @Input() disabled: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() triggerClass: string = '';

  @Output() valueChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<SelectOption>();

  readonly selectedValue = signal<any>(null);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get normalizedOptions(): SelectOption[] {
    if (!this.options) return [];
    return this.options.map((opt) => {
      if (typeof opt === 'object' && opt !== null && 'value' in opt) {
        return {
          value: opt.value,
          label: opt.label !== undefined ? opt.label : String(opt.value),
        };
      }
      return { value: opt, label: String(opt) };
    });
  }

  onSelectChange(val: any): void {
    this.selectedValue.set(val);
    this.onChange(val);
    this.onTouched();
    this.valueChange.emit(val);
    const opt = this.normalizedOptions.find((o) => o.value === val);
    if (opt) this.selectionChange.emit(opt);
  }

  writeValue(value: any): void {
    this.selectedValue.set(value);
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
}
