import axios from 'axios';
import { Storage } from 'react-jhipster';

const AUTH_TOKEN_KEY = 'jhi-authenticationToken';

const TIMEOUT = 1 * 60 * 1000;
axios.defaults.timeout = TIMEOUT;
axios.defaults.baseURL = SERVER_API_URL;

/** Promote legacy session-only tokens so other tabs can reuse the same login. */
export const syncAuthTokenStorage = () => {
  const sessionToken = Storage.session.get(AUTH_TOKEN_KEY);
  if (sessionToken && !Storage.local.get(AUTH_TOKEN_KEY)) {
    Storage.local.set(AUTH_TOKEN_KEY, sessionToken);
    Storage.session.remove(AUTH_TOKEN_KEY);
  }
};

const setupAxiosInterceptors = onUnauthenticated => {
  syncAuthTokenStorage();
  const onRequestSuccess = config => {
    const token = Storage.local.get(AUTH_TOKEN_KEY) || Storage.session.get(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };
  const onResponseSuccess = response => response;
  const onResponseError = err => {
    const status = err.status || (err.response ? err.response.status : 0);
    if (status === 403 || status === 401) {
      onUnauthenticated();
    }
    return Promise.reject(err);
  };
  axios.interceptors.request.use(onRequestSuccess);
  axios.interceptors.response.use(onResponseSuccess, onResponseError);
};

export default setupAxiosInterceptors;
