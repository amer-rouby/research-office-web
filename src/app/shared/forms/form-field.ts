import { Component, booleanAttribute, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { controlErrorMessage } from './control-error';

let nextId = 0;

/**
 * Label + control + hint/error, with accessible wiring.
 * Pass `[control]` to show its validation message automatically once touched.
 *
 *   <ro-form-field label="البريد" [control]="form.controls.email">
 *     <input roInput formControlName="email" />
 *   </ro-form-field>
 */
@Component({
  selector: 'ro-form-field',
  host: { class: 'flex flex-col gap-1.5' },
  template: `
    <label [attr.for]="controlId" class="text-sm font-medium text-ink">
      {{ label() }}
      @if (required()) {
        <span class="text-danger" aria-hidden="true">*</span>
      }
    </label>
    <ng-content />
    @if (message(); as text) {
      <p [id]="messageId" class="text-xs text-danger" role="alert">{{ text }}</p>
    } @else if (hint()) {
      <p [id]="messageId" class="text-xs text-ink-subtle">{{ hint() }}</p>
    }
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string | null>(null);
  readonly control = input<AbstractControl | null>(null);
  readonly required = input(false, { transform: booleanAttribute });

  readonly controlId = `ro-field-${++nextId}`;
  readonly messageId = `${this.controlId}-msg`;

  /** Bumped on every control event, so zoneless change detection sees touched/status changes. */
  private readonly controlTick = signal(0);

  readonly message = computed(() => {
    this.controlTick();
    const explicit = this.error();
    if (explicit) return explicit;
    const c = this.control();
    return c && c.invalid && c.touched ? controlErrorMessage(c.errors) : null;
  });

  readonly hasMessage = computed(() => !!this.message() || !!this.hint());

  constructor() {
    effect((onCleanup) => {
      const c = this.control();
      if (!c) return;
      const sub = c.events.subscribe(() => this.controlTick.update((n) => n + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
