import { Directive, inject } from '@angular/core';
import { FormField } from './form-field';

/** Shared look for text inputs, textareas and selects; links itself to its ro-form-field. */
@Directive({
  selector: 'input[roInput], textarea[roInput], select[roInput]',
  host: {
    class:
      'w-full rounded-xl border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle ' +
      'transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus-ring/30 ' +
      'aria-invalid:border-danger disabled:bg-surface-sunken disabled:text-ink-muted',
    '[id]': 'field?.controlId',
    '[attr.aria-invalid]': 'field?.message() ? "true" : null',
    '[attr.aria-describedby]': 'field?.hasMessage() ? field?.messageId : null',
  },
})
export class Input {
  protected readonly field = inject(FormField, { optional: true });
}
