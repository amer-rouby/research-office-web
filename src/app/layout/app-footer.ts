import { Component } from '@angular/core';
import { APP_VERSION } from '@core/app-version';
import { APP_NAME } from './brand';

@Component({
  selector: 'ro-app-footer',
  template: `
    <footer class="border-t px-6 py-4 text-center text-xs text-ink-subtle">
      {{ name }} · الإصدار <span dir="ltr">{{ version }}</span>
    </footer>
  `,
})
export class AppFooter {
  protected readonly name = APP_NAME;
  protected readonly version = APP_VERSION;
}
