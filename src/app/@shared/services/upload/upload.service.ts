import { Injectable } from '@angular/core';
import { Base64 } from '@ionic-native/base64/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private filePath: FilePath,
    private base64: Base64,
  ) { }

  async uploadImage(uid: string, base64Image: string) {
    try {
      const metadata = { contentType: 'image/jpg' };
      const storagePath = 'images/' + uid + '/' + this.generateVideoName();
      const snapshot = await firebase.storage().ref().child(storagePath).putString(base64Image, 'base64', metadata);
      return await firebase.storage().ref(snapshot.metadata.fullPath).getDownloadURL();
    } catch (error) {
      console.error('UploadService -> uploadImage -> error', error);
      throw new Error(error);
    }
  }

  async uploadVideo(uid: string, videoUrl: string) {
    try {
      const video = await this.filePath.resolveNativePath(videoUrl);
      const base64Video = await this.base64.encodeFile(video);
      const videoBlob = this.imgURItoBlob(base64Video);
      const metadata = { contentType: 'video/ogg' };
      const storagePath = 'videos/posts/' + uid + '/' + this.generateVideoName();
      const snapshot = await firebase.storage().ref().child(storagePath).put(videoBlob, metadata);
      return await firebase.storage().ref(snapshot.metadata.fullPath).getDownloadURL();
    } catch (error) {
      console.error('UploadService -> uploadVideo -> error', error);
      throw new Error(error);
    }
  }

  imgURItoBlob(dataURI) {
    const binary = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mimeString });
  }

  generateVideoName() {
    const length = 8;
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '.ogg';
  }
}
