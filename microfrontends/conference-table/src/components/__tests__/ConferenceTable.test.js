import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import i18n from 'components/__mocks__/i18n';
import conferenceMocks from 'components/__mocks__/conferenceMocks';
import ConferenceTable from 'components/ConferenceTable';

describe('ConferenceTable', () => {
  it('shows conferences', () => {
    const { getByText } = render(<ConferenceTable items={conferenceMocks} />);

    expect(getByText(
          conferenceMocks[0].id.toString()
    )).toBeInTheDocument();
    expect(getByText(
          conferenceMocks[1].id.toString()
    )).toBeInTheDocument();

    expect(getByText(
        conferenceMocks[0].name
    )).toBeInTheDocument();
    expect(getByText(
        conferenceMocks[1].name
    )).toBeInTheDocument();

    expect(getByText(
        conferenceMocks[0].location
    )).toBeInTheDocument();
    expect(getByText(
        conferenceMocks[1].location
    )).toBeInTheDocument();

  });

  it('shows no conferences message', () => {
    const { queryByText } = render(<ConferenceTable items={[]} />);

    expect(queryByText(
          conferenceMocks[0].id.toString()
    )).not.toBeInTheDocument();
    expect(queryByText(
          conferenceMocks[1].id.toString()
    )).not.toBeInTheDocument();

    expect(queryByText(
        conferenceMocks[0].name
    )).not.toBeInTheDocument();
    expect(queryByText(
        conferenceMocks[1].name
    )).not.toBeInTheDocument();

    expect(queryByText(
        conferenceMocks[0].location
    )).not.toBeInTheDocument();
    expect(queryByText(
        conferenceMocks[1].location
    )).not.toBeInTheDocument();


    expect(queryByText('entities.conference.noItems')).toBeInTheDocument();
  });

  it('calls onSelect when the user clicks a table row', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(
      <ConferenceTable items={conferenceMocks} onSelect={onSelectMock} />
    );

    fireEvent.click(getByText(
          conferenceMocks[0].id.toString()
    ));
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });
});
