import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideClipboardCheck,
  LucideDynamicIcon,
  LucideFileSearch,
  LucideFileText,
  LucideHandCoins,
  LucideLock,
  LucideMessageCircle,
  LucideRefreshCw,
  LucideSend,
  LucideTimer,
} from '@lucide/angular';
import { createLoader } from '@core/data/loader';
import { groupServices } from '@core/orders/service-groups';
import { PublicOrdersApi } from '@core/orders/public-orders.api';
import { OfficeStore } from '@core/site/office.store';
import { Input } from '@shared/forms/input';
import { Button } from '@shared/ui/button';
import { LoadError, Loading } from '@shared/ui/state-views';
import { ToolCards } from '../tools/tool-cards';

const PROMISES = [
  {
    icon: LucideTimer,
    title: 'عرض سعر خلال 24 ساعة',
    text: 'تعرف السعر والمدة قبل أن تدفع أي شيء.',
  },
  { icon: LucideHandCoins, title: 'دفع على مراحل', text: 'دفعة مقدمة والباقي عند التسليم.' },
  { icon: LucideRefreshCw, title: 'تعديلات مجانية', text: 'نعدّل حتى يصبح العمل كما تريد.' },
  { icon: LucideLock, title: 'سرية تامة', text: 'ملفاتك وبياناتك لا تُشارك مع أي جهة.' },
];

const STEPS = [
  { icon: LucideSend, title: 'أرسل طلبك', text: 'اختر الخدمة وأرفق ملفاتك في دقيقتين.' },
  { icon: LucideHandCoins, title: 'استلم عرض السعر', text: 'نراجع الطلب ونرسل السعر والمدة.' },
  {
    icon: LucideClipboardCheck,
    title: 'نعمل ونراجع',
    text: 'خبير متخصص ينفذ، ومراجع يضمن الجودة.',
  },
  {
    icon: LucideFileSearch,
    title: 'استلم وتابع',
    text: 'تابع كل مرحلة من رابطك الخاص وحمّل ملفاتك.',
  },
];

const FAQ = [
  {
    q: 'هل تكتبون الرسالة أو البحث بالنيابة عني؟',
    a: 'لا. نحرص على سلامتك الأكاديمية، فنقدم التحليل الإحصائي والتدقيق والتنسيق والترجمة والبحث عن المراجع والإرشاد، والكتابة تبقى لك.',
  },
  {
    q: 'كيف أدفع؟',
    a: 'بعد قبول عرض السعر: تحويل بنكي أو محفظة إلكترونية أو PayPal/Wise. غالبًا دفعة مقدمة والباقي عند التسليم.',
  },
  {
    q: 'كم يستغرق التنفيذ؟',
    a: 'يختلف حسب حجم العمل، وتعرف المدة بالضبط في عرض السعر قبل البدء.',
  },
  {
    q: 'ماذا لو احتجت تعديلًا بعد التسليم؟',
    a: 'اطلب التعديل من صفحة متابعة طلبك وسنعمل عليه، والتعديلات ضمن نطاق الطلب مجانية.',
  },
  {
    q: 'هل بياناتي آمنة؟',
    a: 'نعم. الملفات محفوظة على خوادم مؤمنة، ولا يراها إلا الفريق المسؤول عن طلبك.',
  },
];

@Component({
  selector: 'ro-landing-page',
  imports: [
    RouterLink,
    FormsModule,
    Button,
    Input,
    Loading,
    LoadError,
    ToolCards,
    LucideDynamicIcon,
    LucideArrowLeft,
    LucideMessageCircle,
  ],
  template: `
    <!-- hero -->
    <section class="relative overflow-hidden border-b bg-surface-raised">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,var(--brand-100),transparent_60%),radial-gradient(40rem_24rem_at_0%_110%,var(--accent-100),transparent_60%)] dark:opacity-30"
        aria-hidden="true"
      ></div>
      <div
        class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24"
      >
        <div>
          <p
            class="inline-flex items-center gap-2 rounded-full border bg-surface-raised px-3 py-1 text-sm text-ink-muted shadow-soft"
          >
            <span class="size-2 rounded-full bg-success" aria-hidden="true"></span>
            للباحثين والشركات في الخليج
          </p>
          <h1 class="mt-6 text-4xl leading-[1.25] font-bold tracking-tight text-ink sm:text-5xl">
            أبحاثك ودراساتك
            <span class="text-primary">بأيدي خبراء</span>
            وبسعر يناسبك
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            تحليل إحصائي، تدقيق وتنسيق، ترجمة، ودراسات جدوى للباحثين والشركات في الخليج. تابع كل
            مرحلة من رابط خاص بك حتى تستلم ملفاتك.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a roButton size="lg" routerLink="/request">اطلب خدمتك الآن</a>
            <a roButton size="lg" variant="secondary" routerLink="/tools">جرّب الأدوات المجانية</a>
          </div>
          <ul
            class="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-ink-muted sm:grid-cols-4 lg:grid-cols-2"
          >
            @for (p of promises; track p.title) {
              <li class="flex items-center gap-2">
                <svg
                  [lucideIcon]="p.icon"
                  size="16"
                  class="shrink-0 text-primary"
                  aria-hidden="true"
                ></svg>
                {{ p.title }}
              </li>
            }
          </ul>
        </div>

        <!-- product preview: what the client sees -->
        <div class="relative hidden lg:block" aria-hidden="true">
          <div
            class="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-100/60 blur-2xl dark:bg-brand-900/40"
          ></div>
          <div class="rounded-3xl border bg-surface-raised p-6 shadow-lift">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-ink-subtle">طلب رقم <bdi>RO-2026-0042</bdi></p>
                <p class="mt-1 font-semibold text-ink">التحليل الإحصائي</p>
              </div>
              <span
                class="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-primary dark:bg-brand-900"
                >قيد التنفيذ</span
              >
            </div>
            <div class="mt-6 flex items-center gap-2">
              @for (s of previewSteps; track s; let i = $index) {
                <span
                  class="h-1.5 flex-1 rounded-full"
                  [class]="i < 3 ? 'bg-primary' : 'bg-surface-sunken'"
                ></span>
              }
            </div>
            <div class="mt-2 flex justify-between text-[11px] text-ink-subtle">
              @for (s of previewSteps; track s) {
                <span>{{ s }}</span>
              }
            </div>
            <div class="mt-6 rounded-2xl bg-surface-sunken p-4">
              <p class="text-xs text-ink-subtle">عرض السعر</p>
              <p class="mt-1 text-2xl font-bold text-ink"><bdi>QAR 450</bdi></p>
              <div class="mt-3 h-1.5 rounded-full bg-surface-raised">
                <div class="h-full w-1/2 rounded-full bg-success"></div>
              </div>
              <p class="mt-2 text-xs text-ink-muted">تم دفع 50% مقدمًا</p>
            </div>
            <div class="mt-4 flex items-center gap-3 rounded-2xl border p-3">
              <span class="grid size-9 place-items-center rounded-xl bg-accent-100 text-accent-800">
                <svg [lucideIcon]="fileIcon" size="18"></svg>
              </span>
              <div class="flex-1">
                <p class="text-sm font-medium text-ink"><bdi>نتائج_التحليل.docx</bdi></p>
                <p class="text-xs text-ink-subtle">تسليم · فريق المكتب</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- services -->
    <section id="services" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <h2 class="text-3xl font-bold tracking-tight text-ink">خدماتنا</h2>
      <p class="mt-2 text-ink-muted">اختر الخدمة وسنرسل لك عرض السعر.</p>
      @if (services.loading() && !services.data()) {
        <div class="mt-8"><ro-loading /></div>
      } @else if (services.error()) {
        <div class="mt-8">
          <ro-load-error [message]="services.error()!" (retry)="services.reload()" />
        </div>
      } @else {
        @for (g of groups(); track g.category) {
          <h3 class="mt-10 flex items-center gap-2 text-lg font-semibold text-ink">
            <svg [lucideIcon]="g.icon" size="20" class="text-primary" aria-hidden="true"></svg>
            {{ g.title }}
          </h3>
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (s of g.services; track s.id) {
              <a
                routerLink="/request"
                [queryParams]="{ service: s.code }"
                class="group flex flex-col gap-2 rounded-2xl border bg-surface-raised p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lift"
              >
                <span class="font-semibold text-ink">{{ s.nameAr }}</span>
                <span class="flex-1 text-sm leading-relaxed text-ink-muted">{{
                  s.descriptionAr
                }}</span>
                <span class="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  اطلب عرض سعر
                  <svg
                    lucideArrowLeft
                    size="16"
                    class="transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  ></svg>
                </span>
              </a>
            }
          </div>
        }
      }
    </section>

    <!-- how it works -->
    <section class="bg-surface-sunken">
      <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 class="text-3xl font-bold tracking-tight text-ink">كيف نعمل؟</h2>
        <ol class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (s of steps; track s.title; let i = $index) {
            <li class="relative rounded-2xl bg-surface-raised p-6 shadow-soft">
              <span
                class="absolute top-4 end-4 text-4xl font-bold text-brand-100 dark:text-brand-800"
                aria-hidden="true"
                >{{ i + 1 }}</span
              >
              <span class="grid size-11 place-items-center rounded-xl bg-primary text-on-primary">
                <svg [lucideIcon]="s.icon" size="20" aria-hidden="true"></svg>
              </span>
              <p class="mt-4 font-semibold text-ink">{{ s.title }}</p>
              <p class="mt-1 text-sm text-ink-muted">{{ s.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- tools -->
    <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 class="text-3xl font-bold tracking-tight text-ink">أدوات مجانية</h2>
      <p class="mt-2 text-ink-muted">جرّبها الآن بدون تسجيل.</p>
      <ro-tool-cards class="mt-8" />
    </section>

    <!-- track -->
    <section id="track" class="scroll-mt-20 bg-surface-sunken">
      <div
        class="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6"
      >
        <h2 class="text-2xl font-bold text-ink">تتبع طلبك</h2>
        <p class="text-ink-muted">الصق رابط المتابعة الذي وصلك.</p>
        <form class="flex w-full max-w-xl gap-2" (ngSubmit)="track()">
          <input
            roInput
            name="link"
            [(ngModel)]="trackLink"
            dir="ltr"
            placeholder="https://.../t/..."
            aria-label="رابط المتابعة"
          />
          <button roButton type="submit">تتبع</button>
        </form>
        @if (trackError()) {
          <p class="text-sm text-danger" role="alert">{{ trackError() }}</p>
        }
      </div>
    </section>

    <!-- faq -->
    <section class="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h2 class="text-3xl font-bold tracking-tight text-ink">أسئلة شائعة</h2>
      <div class="mt-8 flex flex-col gap-3">
        @for (f of faq; track f.q) {
          <details class="group rounded-2xl border bg-surface-raised p-5 open:shadow-soft">
            <summary class="cursor-pointer list-none font-semibold text-ink marker:hidden">
              {{ f.q }}
            </summary>
            <p class="mt-3 leading-relaxed text-ink-muted">{{ f.a }}</p>
          </details>
        }
      </div>
    </section>

    <!-- final cta -->
    <section class="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div
        class="flex flex-col items-center gap-5 rounded-3xl bg-linear-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white shadow-lift"
      >
        <h2 class="text-3xl font-bold">جاهز تبدأ؟</h2>
        <p class="max-w-xl text-brand-100">أرسل طلبك الآن ونرد عليك بعرض السعر خلال 24 ساعة.</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a
            roButton
            size="lg"
            routerLink="/request"
            class="!bg-accent-400 !text-accent-900 hover:!bg-accent-300"
            >اطلب خدمتك</a
          >
          @if (whatsapp(); as link) {
            <a
              roButton
              size="lg"
              variant="secondary"
              [href]="link"
              target="_blank"
              rel="noopener"
              class="!border-white/30 !bg-white/10 !text-white"
            >
              <svg lucideMessageCircle size="18" aria-hidden="true"></svg> واتساب
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class LandingPage {
  private readonly api = inject(PublicOrdersApi);
  private readonly router = inject(Router);
  private readonly office = inject(OfficeStore);

  protected readonly promises = PROMISES;
  protected readonly previewSteps = ['الطلب', 'السعر', 'التنفيذ', 'المراجعة', 'التسليم'];
  protected readonly fileIcon = LucideFileText;
  protected readonly steps = STEPS;
  protected readonly faq = FAQ;
  protected readonly services = createLoader(() => this.api.services());
  protected readonly groups = computed(() => groupServices(this.services.data() ?? []));
  protected readonly whatsapp = computed(() =>
    this.office.whatsappLink('مرحبًا، أريد الاستفسار عن خدمة'),
  );
  protected readonly trackLink = signal('');
  protected readonly trackError = signal<string | null>(null);

  constructor() {
    this.services.reload();
    this.office.load();
  }

  /** Accepts a full tracking link or just the token. */
  protected track(): void {
    const value = this.trackLink().trim();
    const token = value.includes('/t/') ? value.split('/t/')[1].split(/[?#/]/)[0] : value;
    if (!/^[A-Za-z0-9_-]{16,}$/.test(token)) {
      this.trackError.set('الرابط غير صحيح. انسخ رابط المتابعة كما وصلك.');
      return;
    }
    this.trackError.set(null);
    void this.router.navigate(['/t', token]);
  }
}
