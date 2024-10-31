import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaskedPipe } from './pipes/masked.pipe';

@NgModule({
  declarations: [MaskedPipe],
  imports: [CommonModule],
  providers: [MaskedPipe],
  exports: [MaskedPipe],
})
export class SharedModule {}
