import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  progress: number;
  response?: UploadResponse;
}

@Injectable({ providedIn: 'root' })
export class StorageApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/storage`;

  upload(file: File, folder: string): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http.post<UploadResponse>(`${this.base}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(
      filter(event =>
        event.type === HttpEventType.UploadProgress ||
        event.type === HttpEventType.Response
      ),
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          return { progress: Math.round((event.loaded / (event.total ?? event.loaded)) * 100) };
        }
        return { progress: 100, response: (event as any).body as UploadResponse };
      })
    );
  }

  delete(key: string) {
    return this.http.delete<void>(this.base, { params: { key } });
  }
}
