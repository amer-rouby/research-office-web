import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMicroscope } from '@lucide/angular';

export const APP_NAME = 'مكتب الخدمات البحثية';

@Component({
  selector: 'ro-brand',
  imports: [RouterLink, LucideMicroscope],
  template: `
    <a routerLink="/" class="flex items-center gap-2 font-semibold text-ink">
      <span class="grid size-9 place-items-center rounded-xl bg-primary text-on-primary">
        <svg lucideMicroscope size="20" aria-hidden="true"></svg>
      </span>
      <span>{{ name }}</span>
    </a>
  `,
})
export class Brand {
  protected readonly name = APP_NAME;
}
