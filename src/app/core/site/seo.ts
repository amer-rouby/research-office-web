import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const SITE_NAME = 'مكتب الخدمات البحثية';
const DEFAULT_DESCRIPTION =
  'تحليل إحصائي، تدقيق وتنسيق، ترجمة، ودراسات جدوى لطلاب الدراسات العليا والشركات في الخليج. عرض سعر خلال 24 ساعة.';

/**
 * Page title = route `title` + site name; meta description = deepest route `data.description`.
 * One place, so every page gets search-friendly tags without per-page code.
 */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(state: RouterStateSnapshot): void {
    const page = this.buildTitle(state);
    const full = page ? `${page} | ${SITE_NAME}` : SITE_NAME;
    this.title.setTitle(full);
    const description = deepest(state.root).data['description'] ?? DEFAULT_DESCRIPTION;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}

function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepest(route.firstChild) : route;
}
