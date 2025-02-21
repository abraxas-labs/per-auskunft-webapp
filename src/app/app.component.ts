import { Component, HostListener } from '@angular/core';
import { ActiveAndOtherTenants, Organisation, OrganisationService } from './core/services/organisation.service';
import { catchError, filter, from, map, merge, Observable, of, switchMap, tap } from 'rxjs';
import { AuthenticationService, AuthorizationService, Tenant } from '@abraxas/base-components';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private static currentWindowWidth: number = window.innerWidth;
  public activeTenant: Tenant = {} as Tenant;
  public userTenants: Tenant[] = [];
  private authenticated: boolean = false;
  private authenticationDone: boolean = false;
  public showLabel= environment.showLabel;
  public env = environment.env;
  public envColor = environment.envColor;
  private static defaultEnvColor = 'green';
  public isSmallScreen = false;
  public isMediumScreen = false;
  public isBigScreen = true;
  public viewOrganisations: Organisation[] = [];
  public activeViewOrganisationId: Observable<string | undefined>;

  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly authenticationService: AuthenticationService,
    private readonly organisationService: OrganisationService,
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
        this.viewOrganisations = it.sort((a, b) => a.organisationName.localeCompare(b.organisationName))
      });
    this.activeViewOrganisationId = organisationService.activeViewOrganisation()
      .pipe(map(it => it?.organisationCode))
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

  changeAccount() {
    this.authenticationService.logout();
  }

  getEnvColor():string{
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
    this.organisationService.setActiveViewOrganisationId($event);
  }
}
