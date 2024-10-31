import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PersonDetailComponent} from './pages/person-detail/person-detail.component';
import {GuardianshipTableComponent} from './components/guardianship/guardianship-table.component';

import {
  AlertBarModule,
  ButtonModule, ContextHeaderBarModule,
  DateModule,
  DialogModule,
  ExpansionPanelModule,
  FooterBarModule,
  IconModule,
  LabelModule,
  RadioButtonModule,
  SkeletonModule,
  StatusLabelModule,
  SubNavigationBarModule,
  TableModule,
  TextModule, TooltipModule,
} from '@abraxas/base-components';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../shared/shared.module';
import {HouseholdTableComponent} from './components/household-table/household-table.component';
import {ResidencesTableComponent} from './components/residences/residences-table.component';
import {FamilyTableComponent} from './components/family-table/family-table.component';
import { MatToolbarModule } from '@angular/material/toolbar';


@NgModule({
    declarations: [
        PersonDetailComponent,
        GuardianshipTableComponent,
        HouseholdTableComponent,
        ResidencesTableComponent,
        FamilyTableComponent,
    ],
  imports: [
    CommonModule,
    TableModule,
    IconModule,
    ButtonModule,
    SubNavigationBarModule,
    SkeletonModule,
    TranslateModule,
    ExpansionPanelModule,
    SharedModule,
    StatusLabelModule,
    FooterBarModule,
    TextModule,
    DialogModule,
    RadioButtonModule,
    DateModule,
    AlertBarModule,
    MatToolbarModule,
    LabelModule,
    ContextHeaderBarModule,
    TooltipModule,
  ],
    exports: [PersonDetailComponent],
})
export class PersonDetailModule {
}
