import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { saveBlob } from './save-blob';

/** Downloads a protected file (the interceptor adds the token) and saves it under its name. */
@Injectable({ providedIn: 'root' })
export class FileDownload {
  private readonly http = inject(HttpClient);

  save(url: string, name: string) {
    return this.http.get(url, { responseType: 'blob' }).pipe(map((blob) => saveBlob(blob, name)));
  }
}
