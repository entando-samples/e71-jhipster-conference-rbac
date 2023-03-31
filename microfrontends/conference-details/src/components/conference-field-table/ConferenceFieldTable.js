import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import conferenceType from 'components/__types__/conference';

const ConferenceFieldTable = ({ t, conference }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>{t('common.name')}</TableCell>
        <TableCell>{t('common.value')}</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>
          <span>{t('entities.conference.id')}</span>
        </TableCell>
        <TableCell>
          <span>{conference.id}</span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <span>{t('entities.conference.name')}</span>
        </TableCell>
        <TableCell>
          <span>{conference.name}</span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <span>{t('entities.conference.location')}</span>
        </TableCell>
        <TableCell>
          <span>{conference.location}</span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

ConferenceFieldTable.propTypes = {
  conference: conferenceType,
  t: PropTypes.func.isRequired,
};

ConferenceFieldTable.defaultProps = {
  conference: [],
};

export default withTranslation()(ConferenceFieldTable);
