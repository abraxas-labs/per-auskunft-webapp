import { Component, HostListener } from '@angular/core';
import { ActiveAndOtherTenants, Organisation, OrganisationService } from './core/services/organisation.service';
import { catchError, filter, from, map, merge, Observable, of, switchMap } from 'rxjs';
import {
  AlertBarModule,
  AppHeaderBarIamModule,
  AuthenticationService,
  AuthorizationService,
  ButtonModule,
  DropdownModule,
  IconButtonModule,
  Tenant,
} from '@abraxas/base-components';
import { environment } from '../environments/environment';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FilesService } from './shared/services/files.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    AppHeaderBarIamModule,
    DropdownModule,
    AsyncPipe,
    AlertBarModule,
    RouterOutlet,
    TranslateModule,
    ButtonModule,
    NgIf,
    IconButtonModule,
  ],
})
export class AppComponent {
  private static currentWindowWidth: number = window.innerWidth;
  public activeTenant: Tenant = {} as Tenant;
  public userTenants: Tenant[] = [];
  private authenticated: boolean = false;
  private authenticationDone: boolean = false;
  public showLabel = environment.showLabel;
  public env = environment.env;
  public envColor = environment.envColor;
  private static defaultEnvColor = 'green';
  public isSmallScreen = false;
  public isMediumScreen = false;
  public isBigScreen = true;
  public viewOrganisations: Organisation[] = [];
  public activeViewOrganisationId: Observable<string | undefined>;
  public static LOCAL_STORAGE_KEY = 'activeViewOrganisationId';

  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly authenticationService: AuthenticationService,
    private readonly organisationService: OrganisationService,
    private readonly filesService: FilesService,
  ) {
    merge(
      this.authenticationService.authenticationChanged.pipe(filter((authenticated) => authenticated)),
      this.authorizationService.activeTenantChanged,
    )
      .pipe(
        switchMap(() => from(this.authorizationService.getTenantsForApplication())),
        switchMap((tenants) =>
          from(this.authorizationService.getActiveTenant()).pipe(
            map((activeTenant) => {
              this.checkAuthentication(activeTenant);
              return { userTenants: tenants, activeTenant } as ActiveAndOtherTenants;
            }),
          ),
        ),
        catchError((err) => {
          this.authenticated = false;
          this.authenticationDone = true;
          return of({} as ActiveAndOtherTenants);
        }),
      )
      .subscribe((it) => {
        this.activeTenant = it.activeTenant;
        this.userTenants = it.userTenants;
      });


    organisationService
      .viewOrganisations()
      .subscribe(it => {
        this.viewOrganisations = it.sort((a, b) => a.organisationName.localeCompare(b.organisationName));
      });
    this.activeViewOrganisationId = organisationService.activeViewOrganisation()
      .pipe(map(it => it?.organisationCode));
  }

  public static get isSmallScreen(): boolean {
    return this.currentWindowWidth < 768;
  }

  public static get isMediumScreen(): boolean {
    return !this.isSmallScreen && this.currentWindowWidth < 1200;
  }

  public static get isBigScreen(): boolean {
    return this.currentWindowWidth > 1200;
  }

  async checkAuthentication(tenant: Tenant): Promise<void> {
    try {
      const roles = await this.authorizationService.getRoles(tenant);
      this.authenticated = roles.includes('User');
    } catch (err) {
      this.authenticated = false;
    } finally {
      this.authenticationDone = true;
    }
  }

  getAuth(): boolean {
    return this.authenticated;
  }

  getAuthDone(): boolean {
    return this.authenticationDone;
  }

  reloadPage() {
    localStorage.removeItem(AppComponent.LOCAL_STORAGE_KEY);
    this.windowLocationReload();
  }

  windowLocationReload(){
    window.location.reload();
  }

  logoClicked($event: MouseEvent) {
    // Wir wollen die Suchseite neu geladen haben
    let targetObjects = ['title', 'label', 'logo', 'link'];
    if (window.location.href.indexOf("person")< 0){
      targetObjects.forEach((element) => {
        if (($event.target as Element).classList.contains(element)) {
          this.windowLocationReload();
        }
      })
    }
  }

  changeAccount() {
    this.authenticationService.logout();
  }

  getEnvColor(): string {
    return this.envColor ? this.envColor : AppComponent.defaultEnvColor;
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {

    AppComponent.currentWindowWidth = width;
    this.isSmallScreen = AppComponent.isSmallScreen;
    this.isMediumScreen = AppComponent.isMediumScreen;
    this.isBigScreen = AppComponent.isBigScreen;

  }

  activeViewOrganisationIdChanged($event: any) {

    if ($event) {
      localStorage.setItem(AppComponent.LOCAL_STORAGE_KEY, $event);
    }

    let activeViewOrgId;
    this.activeViewOrganisationId.subscribe(res => activeViewOrgId = res);
    if ($event != activeViewOrgId && activeViewOrgId ){
      this.windowLocationReload();
    }

    this.organisationService.setActiveViewOrganisationId($event);
  }

  openPdf() {
    this.filesService.loadManual().subscribe(
      response => {
        const byteCharacters = atob(response);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      },
    );
  }

}
