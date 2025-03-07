import { DEFAULT_SCOPE, STA_ISSUER } from '@abraxas/base-components';
import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  env: 'dev',
  authenticationConfig: {
    clientId: 'PER-AUS-STA',
    issuer: `${STA_ISSUER}`,
    scope: `${DEFAULT_SCOPE} urn:abraxas:iam:audience_client_id:PER-GW-API-STA urn:abraxas:iam:audience_client_id:PERMISSION-V1 urn:abraxas:iam:audience_client_id:IDENTITY-V1`,
    responseType: 'code',
    redirectUri: window.location.origin + window.location.pathname,
    authAllowedUrls: [
      'https://sta.sec.abraxas-apis.ch/permission',
      'https://sta.sec.abraxas-apis.ch/identity',
      'http://localhost:4400'
    ],
    customQueryParams: {
      response_mode: 'fragment',
    },

  },
  authorizationConfig: {
    permissionEndpoint: 'https://sta.sec.abraxas-apis.ch/permission',
    includeDelegations: true
  },
  userConfig: {
    identityEndpoint: 'https://sta.sec.abraxas-apis.ch/identity',
  },
  apiBaseUrl: 'http://localhost:8082',
  showLabel: true,
  envColor: 'green'
};
