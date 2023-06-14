// cdvphotolibrary.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Pipe({ name: 'cdvphotolibrary' })
export class CDVPhotoLibraryPipe implements PipeTransform {

  constructor(private webView: WebView) { }

  transform(url: string) {
    return (url.startsWith('cdvphotolibrary://') || url.startsWith('file://')) ? this.webView.convertFileSrc(url) : url;
  }
}
