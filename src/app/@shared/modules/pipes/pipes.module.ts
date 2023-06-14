import { NgModule } from '@angular/core';

import { CDVPhotoLibraryPipe } from '../../pipes/cdvphotolibrary.pipe';
import { ObjectKeysLengthPipe } from '../../pipes/object-keys-length/object-keys-length.pipe';
import { ShortNumberPipe } from '../../pipes/short-number/short-number.pipe';

@NgModule({
    declarations: [
        CDVPhotoLibraryPipe,
        ShortNumberPipe,
        ObjectKeysLengthPipe,
    ],
    providers: [
        CDVPhotoLibraryPipe,
        ShortNumberPipe,
        ObjectKeysLengthPipe,
    ],
    exports: [
        CDVPhotoLibraryPipe,
        ShortNumberPipe,
        ObjectKeysLengthPipe,
    ]
})
export class PipesModule { }
