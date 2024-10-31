import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtendedSearchMaskComponent } from './components/extended-search-mask/extended-search-mask.component';
import { SimpleSearchMaskComponent } from './components/simple-search-mask/simple-search-mask.component';
import { SearchResultTableComponent } from './components/search-result-table/search-result-table.component';
import { SearchComponent } from './pages/search/search.component';
import {
  AlertBarModule,
  ButtonModule,
  CheckboxModule,
  DateModule,
  DropdownModule,
  FilterModule,
  IconModule,
  MaskedModule,
  NumberModule, RowModule,
  SearchModule,
  SegmentedControlGroupModule,
  SkeletonModule,
  StatusLabelModule,
  TableModule,
  TextModule,
} from '@abraxas/base-components';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ExtendedSearchMaskComponent,
    SimpleSearchMaskComponent,
    SearchResultTableComponent,
    SearchComponent,
  ],
  imports: [
    CommonModule,
    TextModule,
    ReactiveFormsModule,
    TranslateModule,
    DateModule,
    ButtonModule,
    NumberModule,
    DropdownModule,
    MaskedModule,
    SegmentedControlGroupModule,
    CheckboxModule,
    AlertBarModule,
    TableModule,
    IconModule,
    StatusLabelModule,
    FilterModule,
    SearchModule,
    SkeletonModule,
    RowModule,
  ],
  exports: [SearchComponent],
})
export class SearchModuleGeneral {}
