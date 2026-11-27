import { Pipe, PipeTransform } from '@angular/core';

const OLD_S3_PATTERN = /^https?:\/\/localhost:9000\/icons\//;

@Pipe({ name: 'storageUrl', standalone: true, pure: true })
export class StorageUrlPipe implements PipeTransform {
  private readonly apiBase = `http://${window.location.hostname}:8080`;

  transform(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (OLD_S3_PATTERN.test(url)) {
      const key = url.replace(OLD_S3_PATTERN, '');
      return `${this.apiBase}/api/v1/storage/files/${key}`;
    }
    if (url.startsWith('/api/v1/storage/files/')) {
      return `${this.apiBase}${url}`;
    }
    return url;
  }
}
