import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMessageCircle } from '@lucide/angular';
import { OfficeStore } from '@core/site/office.store';
import { Button } from '@shared/ui/button';

/**
 * Turns a tool result into a lead: opens the request form pre-filled with the result,
 * or WhatsApp with the same text.
 */
@Component({
  selector: 'ro-tool-cta',
  imports: [RouterLink, Button, LucideMessageCircle],
  template: `
    <div class="flex flex-col gap-3 rounded-2xl bg-brand-50 p-5 dark:bg-brand-900">
      <p class="font-semibold text-ink">{{ title() }}</p>
      <p class="text-sm text-ink-muted">{{ text() }}</p>
      <div class="flex flex-wrap gap-2">
        <a roButton routerLink="/request" [queryParams]="{ service: service(), details: summary() }"
          >اطلب الخدمة الآن</a
        >
        @if (whatsapp(); as link) {
          <a roButton variant="secondary" [href]="link" target="_blank" rel="noopener">
            <svg lucideMessageCircle size="16" aria-hidden="true"></svg> اسألنا على واتساب
          </a>
        }
      </div>
    </div>
  `,
})
export class ToolCta {
  /** Catalog code of the service to preselect, e.g. STAT_ANALYSIS. */
  readonly service = input.required<string>();
  /** Plain-text result copied into the request details / WhatsApp message. */
  readonly summary = input.required<string>();
  readonly title = input('تحتاج من يكمل معك؟');
  readonly text = input('خبراؤنا ينفذونها لك باحتراف، مع عرض سعر خلال 24 ساعة.');

  private readonly office = inject(OfficeStore);
  protected readonly whatsapp = computed(() => this.office.whatsappLink(this.summary()));
}
