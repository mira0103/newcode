import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor() { }

  // Generate a random filename of length for the image to be uploaded
  generateFilename(): string {
    const length = 8;
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '.jpg';
  }

  // Function to convert dataURI to Blob needed by Firebase
  imgURItoBlob(dataURI): Blob {
    const binary = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mimeString });
  }

  uploadProfilePhoto(uid, imageData): Promise<string> {
    return new Promise((resolve, reject) => {
      const imgBlob = this.imgURItoBlob(imageData);
      if (!imgBlob) { return; }
      const imgMetadata = { contentType: imgBlob.type };

      firebase.storage().ref().child('images/' + uid + '/' + this.generateFilename()).put(imgBlob, imgMetadata).then(async (snapshot) => {
        // URL of the uploaded image!
        const { metadata } = snapshot;
        const url: any = await firebase.storage().ref(metadata.fullPath).getDownloadURL();
        resolve(url);
      }).catch((error) => {
        console.error('FirebaseStorageService -> constructor -> error', error);
        reject(error);
      });
    }) as Promise<string>;
  }
}
