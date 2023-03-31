import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import i18n from 'i18n/__mocks__/i18nMock';
import { conferenceMockEdit as conferenceMock } from 'components/__mocks__/conferenceMocks';
import ConferenceForm from 'components/ConferenceForm';
import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme();

describe('Conference Form', () => {
  it('shows form', () => {
    const { getByLabelText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ConferenceForm conference={conferenceMock} />
      </ThemeProvider>
    );

        expect(getByTestId('conference-id').value).toBe(conferenceMock.id.toString());
    expect(getByLabelText('entities.conference.name').value).toBe(
        conferenceMock.name
    );
    expect(getByLabelText('entities.conference.location').value).toBe(
        conferenceMock.location
    );
  });

  it('submits form', async () => {
    const handleSubmit = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <ConferenceForm conference={conferenceMock} onSubmit={handleSubmit} />
      </ThemeProvider>
    );

    const form = getByTestId('conference-form');
    fireEvent.submit(form);

    await wait(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
