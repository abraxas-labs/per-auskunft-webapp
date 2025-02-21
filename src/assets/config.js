(function (window) {
  window['config'] = window['config'] || {};
  window['config'].CLIENT_ID = '${CLIENT_ID}';
  window['config'].ISSUER = '${ISSUER}';
  window['config'].ADDITIONAL_SCOPES = '${ADDITIONAL_SCOPES}';
  window['config'].SECURE_CONNECT_BASE_URL = '${SECURE_CONNECT_BASE_URL}';
  window['config'].API_BASE_URL = '${API_BASE_URL}';
  window['config'].ENV = '${ENV}';
  window['config'].SHOW_LABEL = '${SHOW_LABEL}';
  window['config'].ENV_COLOR = '${ENV_COLOR}';
})(this);
