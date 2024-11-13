import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-method-selector',
  standalone: true,
  imports: [],
  templateUrl: './upload-method-selector.component.html',
  styleUrl: './upload-method-selector.component.scss'
})
export class UploadMethodSelectorComponent {
  openFileDialog(fileType: string) {
    let acceptType = '';
    if (fileType === 'document') {
      acceptType = 'application/pdf,application/msword,...'; // Geben Sie hier unterstützte Dokumentformate an
    } else if (fileType === 'image') {
      acceptType = 'image/*'; // Für Bilddateien
    }
  
    // Erstellen Sie ein unsichtbares Eingabefeld für den Datei-Upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = acceptType;
  
    // Zeigen Sie das Dateiauswahldialog an
    fileInput.click();
  
    // Verarbeiten Sie die Datei nach der Auswahl
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (file && file.size <= 500 * 1024) {
        this.uploadFile(file);
      } else {
        console.error('Datei überschreitet das Größenlimit von 500 KB.');
      }
    };
  }
  
  uploadFile(file: File) {
    // Implementieren Sie den Uploadprozess
    console.log('Datei wird hochgeladen:', file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.add('dragging');
  }
  
  onDragLeave(event: DragEvent) {
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragging');
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    const dropArea = event.currentTarget as HTMLElement;
    dropArea.classList.remove('dragging');
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.uploadFile(file); // Hier kannst du die gleiche Upload-Logik verwenden
    }
  }
  

}
