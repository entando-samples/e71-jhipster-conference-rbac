export const getKeycloakToken = () => {
  if (
      window &&
      window.entando &&
      window.entando.keycloak &&
      window.entando.keycloak.authenticated
  ) {
      return window.entando.keycloak.token;
  }
  return '';
};

// Check if the authenticated user has the clientRole for any Keycloak clients
export const hasKeycloakClientRole = clientRole => {
    if (getKeycloakToken()) {
        const { resourceAccess } = window.entando.keycloak;
        if (resourceAccess) {
            for (const client in resourceAccess) {
                // eslint-disable-line no-unused-vars
                const roles = resourceAccess[client].roles;
                if (roles && roles.includes(clientRole)) {
                    return true;
                }
            }
        }
    }
    return false;
};

export const getDefaultOptions = () => ({
  headers: new Headers({
      Authorization: `Bearer ${getKeycloakToken()}`,
      'Content-Type': 'application/json',
  }),
});

export const getUrl = (url, filters = '', pagination = '') => {
  const hasQuery = !!(filters || pagination);
  const parameters = `${filters}${filters ? '&' : ''}${pagination}`;
  return `${url}${hasQuery ? `?${parameters}` : ''}`;
};

export const request = async (url, options) => {
  const response = await fetch(url, options);

  const headers = {
      ...(response.headers.has('X-Total-Count')
          ? {'X-Total-Count': parseInt(response.headers.get('X-Total-Count'), 10)}
          : {}),
  };

  if (response.status === 204) {
    return { conferences:'' };
  }

  return response.status >= 200 && response.status < 300
      ? {conferences: await response.json(), headers}
      : Promise.reject(new Error(response.statusText || response.status));
};
