import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';

/** One column of a {@link DataTable}. Plain text via `value`, or a custom cell via `<ng-template roCell="key">`. */
export interface Column<T> {
  readonly key: string;
  readonly header: string;
  readonly value?: (row: T) => string;
  /** Extra classes for the cells of this column (e.g. `hidden md:table-cell`). */
  readonly class?: string;
}

@Directive({ selector: 'ng-template[roCell]' })
export class CellDef<T = unknown> {
  readonly name = input.required<string>({ alias: 'roCell' });
  readonly template = inject<TemplateRef<{ $implicit: T }>>(TemplateRef);
}

/**
 * The table every list screen uses: configure `columns`, give `rows`, react to `rowClick`.
 *
 *   <ro-data-table [columns]="columns" [rows]="page.items" (rowClick)="open($event)">
 *     <ng-template roCell="status" let-row><ro-status-badge [status]="row.status" /></ng-template>
 *   </ro-data-table>
 */
@Component({
  selector: 'ro-data-table',
  imports: [NgTemplateOutlet],
  host: { class: 'block overflow-x-auto' },
  template: `
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b text-start text-xs text-ink-subtle">
          @for (c of columns(); track c.key) {
            <th
              scope="col"
              class="px-4 py-3 text-start font-medium whitespace-nowrap"
              [class]="c.class ?? ''"
            >
              {{ c.header }}
            </th>
          }
        </tr>
      </thead>
      <tbody class="divide-y">
        @for (row of rows(); track trackBy()(row)) {
          <tr
            class="transition-colors"
            [class]="
              clickable()
                ? 'cursor-pointer hover:bg-surface-sunken focus-within:bg-surface-sunken'
                : ''
            "
            [attr.tabindex]="clickable() ? 0 : null"
            (click)="rowClick.emit(row)"
            (keydown.enter)="rowClick.emit(row)"
          >
            @for (c of columns(); track c.key) {
              <td class="px-4 py-3 align-middle text-ink" [class]="c.class ?? ''">
                @if (cells()[c.key]; as tpl) {
                  <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row }" />
                } @else {
                  {{ c.value ? c.value(row) : '' }}
                }
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class DataTable<T> {
  readonly columns = input.required<readonly Column<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly trackBy = input<(row: T) => unknown>((row: T) => (row as { id?: unknown }).id ?? row);
  readonly clickable = input(true);
  readonly rowClick = output<T>();

  private readonly cellDefs = contentChildren(CellDef);
  protected readonly cells = computed(
    () =>
      Object.fromEntries(this.cellDefs().map((d) => [d.name(), d.template])) as Record<
        string,
        TemplateRef<{ $implicit: T }> | undefined
      >,
  );
}
