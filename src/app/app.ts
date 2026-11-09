import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'ro-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  // Created here so the stored/OS theme is applied before any shell renders.
  private readonly theme = inject(ThemeService);
}
