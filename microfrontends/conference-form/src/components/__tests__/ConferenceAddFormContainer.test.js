import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { apiConferencePost } from 'api/conferences';
import ConferenceAddFormContainer from 'components/ConferenceAddFormContainer';
import 'i18n/__mocks__/i18nMock';
import { conferenceMockAdd as conferenceMock } from 'components/__mocks__/conferenceMocks';

const configMock = {
  systemParams: {
    api: {
      'conference-api': {
        url: '',
      },
    },
  },
};

jest.mock('api/conferences');
jest.mock('@material-ui/pickers', () => {
  // eslint-disable-next-line react/prop-types
  const MockPicker = ({ id, value, name, label, onChange }) => {
    const handleChange = event => onChange(event.currentTarget.value);
    return (
      <span>
        <label htmlFor={id}>{label}</label>
        <input id={id} name={name} value={value || ''} onChange={handleChange} />
      </span>
    );
  };
  return {
    ...jest.requireActual('@material-ui/pickers'),
    DateTimePicker: MockPicker,
    DatePicker: MockPicker,
  };
});

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

describe('ConferenceAddFormContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const errorMessageKey = 'error.dataLoading';
  const successMessageKey = 'common.dataSaved';

  const onErrorMock = jest.fn();
  const onCreateMock = jest.fn();

  it('saves data', async () => {
    apiConferencePost.mockImplementation(data => Promise.resolve(data));

    const { findByTestId, findByLabelText, queryByText, rerender } = render(
      <ConferenceAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />
    );

    const nameField = await findByLabelText('entities.conference.name');
    fireEvent.change(nameField, { target: { value: conferenceMock.name } });
    const locationField = await findByLabelText('entities.conference.location');
    fireEvent.change(locationField, { target: { value: conferenceMock.location } });
    rerender(<ConferenceAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />);

    const saveButton = await findByTestId('submit-btn');

    fireEvent.click(saveButton);

    await wait(() => {
      expect(apiConferencePost).toHaveBeenCalledTimes(1);
      expect(apiConferencePost).toHaveBeenCalledWith('', conferenceMock);

      expect(queryByText(successMessageKey)).toBeInTheDocument();

      expect(onErrorMock).toHaveBeenCalledTimes(0);
      expect(queryByText(errorMessageKey)).not.toBeInTheDocument();
    });
  }, 7000);

  it('shows an error if data is not successfully saved', async () => {
    apiConferencePost.mockImplementation(() => Promise.reject());

    const { findByTestId, findByLabelText, queryByText, rerender } = render(
      <ConferenceAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />
    );

    const nameField = await findByLabelText('entities.conference.name');
    fireEvent.change(nameField, { target: { value: conferenceMock.name } });
    const locationField = await findByLabelText('entities.conference.location');
    fireEvent.change(locationField, { target: { value: conferenceMock.location } });
    rerender(<ConferenceAddFormContainer onError={onErrorMock} onUpdate={onCreateMock} config={configMock} />);

    const saveButton = await findByTestId('submit-btn');

    fireEvent.click(saveButton);

    await wait(() => {
      expect(apiConferencePost).toHaveBeenCalledTimes(1);
      expect(apiConferencePost).toHaveBeenCalledWith('', conferenceMock);

      expect(queryByText(successMessageKey)).not.toBeInTheDocument();

      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(queryByText(errorMessageKey)).toBeInTheDocument();
    });
  }, 7000);
});
