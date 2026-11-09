import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '@core/api/api-url';
import type { ExpertTask, ExpertTaskDetail, FileView } from '@core/api/api-types';
import { FileDownload } from '@core/files/file-download.service';
import { filesForm } from '@core/files/save-blob';

/** The signed-in expert's own tasks. */
@Injectable({ providedIn: 'root' })
export class ExpertTasksApi {
  private readonly http = inject(HttpClient);
  private readonly downloads = inject(FileDownload);
  private readonly base = `${inject(API_URL)}/expert/tasks`;

  list() {
    return this.http.get<ExpertTask[]>(this.base);
  }

  detail(id: string) {
    return this.http.get<ExpertTaskDetail>(`${this.base}/${id}`);
  }

  start(id: string) {
    return this.http.post<ExpertTaskDetail>(`${this.base}/${id}/start`, null);
  }

  submit(id: string, note: string | null) {
    return this.http.post<ExpertTaskDetail>(`${this.base}/${id}/submit`, { note });
  }

  note(id: string, note: string) {
    return this.http.post<ExpertTaskDetail>(`${this.base}/${id}/notes`, { note });
  }

  upload(id: string, files: readonly File[]) {
    return this.http.post<ExpertTaskDetail>(`${this.base}/${id}/files`, filesForm(files));
  }

  download(id: string, file: FileView) {
    return this.downloads.save(`${this.base}/${id}/files/${file.id}`, file.name);
  }
}
