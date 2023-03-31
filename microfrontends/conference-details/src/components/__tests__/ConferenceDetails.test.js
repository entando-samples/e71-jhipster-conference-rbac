import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';

import 'components/__mocks__/i18n';
import ConferenceDetails from 'components/ConferenceDetails';
import conferenceMock from 'components/__mocks__/conferenceMocks';

describe('ConferenceDetails component', () => {
  test('renders data in details widget', () => {
    const { getByText } = render(<ConferenceDetails conference={conferenceMock} />);
    
      expect(getByText('entities.conference.id')).toBeInTheDocument();
  });
});
