import { ValidationErrors } from '@angular/forms';

/** Arabic message for the first validation error of a control. One place for every form. */
export function controlErrorMessage(errors: ValidationErrors | null): string | null {
  if (!errors) {
    return null;
  }
  if (errors['required']) return 'هذا الحقل مطلوب';
  if (errors['email']) return 'أدخل بريدًا إلكترونيًا صحيحًا';
  if (errors['minlength']) return `الحد الأدنى ${errors['minlength'].requiredLength} أحرف`;
  if (errors['maxlength']) return `الحد الأقصى ${errors['maxlength'].requiredLength} حرفًا`;
  if (errors['pattern']) return 'الصيغة غير صحيحة';
  if (errors['server']) return String(errors['server']);
  return 'القيمة غير صحيحة';
}
