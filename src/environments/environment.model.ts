import { AuthenticationConfig, AuthorizationConfig, UserConfig } from '@abraxas/base-components';

export interface Environment {
  production: boolean;
  authenticationConfig: AuthenticationConfig &
    Required<Pick<AuthenticationConfig, 'clientId' | 'issuer' | 'scope' | 'redirectUri' | 'authAllowedUrls'>>;
  authorizationConfig: AuthorizationConfig;
  userConfig: UserConfig;
  apiBaseUrl: string;
}
