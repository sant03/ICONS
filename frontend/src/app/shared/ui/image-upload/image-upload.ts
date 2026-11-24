import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { LucideUpload, LucideX, LucideLoader } from '@lucide/angular';
import { StorageApi } from '../../../core/api/storage.api';

@Component({
  selector: 'app-image-upload',
  imports: [LucideUpload, LucideX, LucideLoader],
  templateUrl: './image-upload.html',
})
export class ImageUploadComponent {
  @Input() currentUrl: string | null = null;
  @Input() folder: string = 'products';
  @Input() shape: 'square' | 'rounded' = 'square';
  @Input() maxSizeMb: number = 5;

  @Output() uploaded = new EventEmitter<string>();
  @Output() removed = new EventEmitter<void>();

  protected readonly uploading = signal(false);
  protected readonly progress = signal(0);
  protected readonly error = signal<string | null>(null);
  protected readonly dragOver = signal(false);

  private readonly storageApi = inject(StorageApi);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave() {
    this.dragOver.set(false);
  }

  removeImage() {
    if (this.currentUrl) {
      const publicUrl = this.currentUrl;
      const keyStart = publicUrl.indexOf(this.folder);
      if (keyStart > -1) {
        const key = publicUrl.substring(publicUrl.indexOf('/', 8) + 1);
        const bucketAndKey = key.substring(key.indexOf('/') + 1);
        this.storageApi.delete(bucketAndKey).subscribe();
      }
    }
    this.currentUrl = null;
    this.removed.emit();
  }

  private uploadFile(file: File) {
    this.error.set(null);

    if (!file.type.startsWith('image/')) {
      this.error.set('Solo se permiten imágenes');
      return;
    }

    if (file.size > this.maxSizeMb * 1024 * 1024) {
      this.error.set(`El archivo excede ${this.maxSizeMb} MB`);
      return;
    }

    this.uploading.set(true);
    this.progress.set(0);

    this.storageApi.upload(file, this.folder).subscribe({
      next: (event) => {
        this.progress.set(event.progress);
        if (event.response) {
          this.currentUrl = event.response.url;
          this.uploaded.emit(event.response.url);
          this.uploading.set(false);
        }
      },
      error: () => {
        this.error.set('Error al subir el archivo');
        this.uploading.set(false);
      },
    });
  }
}
