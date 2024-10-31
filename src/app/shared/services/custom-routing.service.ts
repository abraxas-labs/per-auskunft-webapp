import { Inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CustomRoutingService {
  constructor(@Inject(APP_BASE_HREF) private readonly baseHref: string) {}

  public openInNewTab(href: string) {
    if (!href.startsWith('/') && !this.baseHref.endsWith('/')) {
      href = '/' + href;
    }
    let url = `${(<any>location).origin}${this.baseHref}${href}`;
    window.open(url);
  }
}
