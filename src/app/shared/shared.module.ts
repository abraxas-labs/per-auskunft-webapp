import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaskedPipe } from './pipes/masked.pipe';

@NgModule({
    imports: [CommonModule, MaskedPipe],
    providers: [MaskedPipe],
    exports: [MaskedPipe],
})
export class SharedModule {}
