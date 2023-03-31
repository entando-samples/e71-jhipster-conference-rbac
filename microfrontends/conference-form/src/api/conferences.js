import { getDefaultOptions, request } from 'api/helpers';

const resource = 'api/conferences';

export const apiConferenceGet = async (serviceUrl, id) => {
  const url = `${serviceUrl}/${resource}/${id}`;
  const options = {
    ...getDefaultOptions(),
    method: 'GET',
  };
  return request(url, options);
};

export const apiConferencePost = async (serviceUrl, conference) => {
  const url = `${serviceUrl}/${resource}`;
  const options = {
    ...getDefaultOptions(),
    method: 'POST',
    body: conference ? JSON.stringify(conference) : null,
  };
  return request(url, options);
};

export const apiConferencePut = async (serviceUrl, id, conference) => {
  const url = `${serviceUrl}/${resource}/${id}`;
  const options = {
    ...getDefaultOptions(),
    method: 'PUT',
    body: conference ? JSON.stringify(conference) : null,
  };
  return request(url, options);
};

export const apiConferenceDelete = async (serviceUrl, id) => {
  const url = `${serviceUrl}/${resource}/${id}`;
  const options = {
    ...getDefaultOptions(),
    method: 'DELETE',
  };
  return request(url, options);
};
