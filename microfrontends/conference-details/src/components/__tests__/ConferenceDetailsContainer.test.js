import React from 'react';
import { render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import 'components/__mocks__/i18n';
import { apiConferenceGet } from 'api/conference';
import conferenceApiGetResponseMock from 'components/__mocks__/conferenceMocks';
import ConferenceDetailsContainer from 'components/ConferenceDetailsContainer';

jest.mock('api/conference');

jest.mock('auth/withKeycloak', () => {
  const withKeycloak = Component => {
    return props => (
      <Component
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        keycloak={{
          initialized: true,
          authenticated: true,
        }}
      />
    );
  };

  return withKeycloak;
});

beforeEach(() => {
  apiConferenceGet.mockClear();
});

describe('ConferenceDetailsContainer component', () => {
  test('requests data when component is mounted', async () => {
    apiConferenceGet.mockImplementation(() => Promise.resolve(conferenceApiGetResponseMock));

    render(<ConferenceDetailsContainer id="1" />);

    await wait(() => {
      expect(apiConferenceGet).toHaveBeenCalledTimes(1);
    });
  });

  test('data is shown after mount API call', async () => {
    apiConferenceGet.mockImplementation(() => Promise.resolve(conferenceApiGetResponseMock));

    const { getByText } = render(<ConferenceDetailsContainer id="1" />);

    await wait(() => {
      expect(apiConferenceGet).toHaveBeenCalledTimes(1);
      expect(getByText('entities.conference.id')).toBeInTheDocument();
      expect(getByText('entities.conference.name')).toBeInTheDocument();
      expect(getByText('entities.conference.location')).toBeInTheDocument();
    });
  });

  test('error is shown after failed API call', async () => {
    const onErrorMock = jest.fn();
    apiConferenceGet.mockImplementation(() => Promise.reject());

    const { getByText } = render(<ConferenceDetailsContainer id="1" onError={onErrorMock} />);

    await wait(() => {
      expect(apiConferenceGet).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(getByText('error.dataLoading')).toBeInTheDocument();
    });
  });
});
