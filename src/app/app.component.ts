import { Component, HostListener } from '@angular/core';
import { ActiveAndOtherTenants } from './core/services/custom-tenant.service';
import { catchError, filter, from, map, merge, of, Subscription, switchMap } from 'rxjs';
import { AuthenticationService, AuthorizationService, Tenant } from '@abraxas/base-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public activeTenant: Tenant = {} as Tenant;
  public userTenants: Tenant[] = [];
  private subscription: Subscription;
  private authenticated: boolean = false;
  private authenticationDone: boolean = false;

  public isSmallScreen = false;
  public isMediumScreen = false;
  public isBigScreen = true;
  private static currentWindowWidth: number = window.innerWidth;

  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.subscription = merge(
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

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {

    AppComponent.currentWindowWidth = width;
    this.isSmallScreen = AppComponent.isSmallScreen;
    this.isMediumScreen = AppComponent.isMediumScreen;
    this.isBigScreen = AppComponent.isBigScreen;

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


}
