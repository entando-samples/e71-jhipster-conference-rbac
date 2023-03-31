import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import keycloakType from 'components/__types__/keycloak';
import withKeycloak from 'auth/withKeycloak';
import { AuthenticatedView, UnauthenticatedView } from 'auth/KeycloakViews';
import { apiConferenceGet, apiConferenceDelete, apiConferencePut } from 'api/conferences';
import Notification from 'components/common/Notification';
import ConferenceForm from 'components/ConferenceForm';

class ConferenceEditFormContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      notificationMessage: null,
      notificationStatus: null,
    };

    this.closeNotification = this.closeNotification.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { keycloak } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps) {
    const { keycloak, id } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    const changedAuth = prevProps.keycloak.authenticated !== authenticated;
    const changedId = id && id !== prevProps.id;

    if (authenticated && (changedId || changedAuth)) {
      this.fetchData();
    }
  }

  async fetchData() {
    const { keycloak, id, config } = this.props;
    const serviceUrl =
      config &&
      config.systemParams &&
      config.systemParams.api &&
      config.systemParams.api['conference-api'].url;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated && id) {
      try {
        const conference = await apiConferenceGet(serviceUrl, id);
        this.setState(() => ({
          conference,
        }));
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  closeNotification() {
    this.setState(() => ({
      notificationMessage: null
    }));
  }

  async handleSubmit(conference) {
    const { t, onUpdate, keycloak, config } = this.props;
    const serviceUrl =
      config &&
      config.systemParams &&
      config.systemParams.api &&
      config.systemParams.api['conference-api'].url;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      try {
        const updatedConference = await apiConferencePut(serviceUrl, conference.id, conference);
        onUpdate(updatedConference);

        this.setState({
          conference: updatedConference,
          notificationMessage: t('common.dataSaved'),
          notificationStatus: Notification.SUCCESS,
        });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  async handleDelete(conference) {
    const { t, onDelete, keycloak, config } = this.props;
    const serviceUrl =
      config &&
      config.systemParams &&
      config.systemParams.api &&
      config.systemParams.api['conference-api'].url;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      try {
        await apiConferenceDelete(serviceUrl, conference.id);
        onDelete(conference);
        this.setState({
          conference: null,
          notificationMessage: t('common.dataDeleted'),
          notificationStatus: Notification.SUCCESS,
        });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  handleError(err) {
    const { t, onError } = this.props;
    onError(err);
    this.setState(() => ({
      notificationMessage: t('error.dataLoading'),
      notificationStatus: Notification.ERROR,
    }));
  }

  render() {
    const { keycloak, onCancelEditing, t } = this.props;
    const { notificationMessage, notificationStatus, conference } = this.state;

    let form;
    if (typeof conference === 'undefined') {
     form = t('entities.conference.notFound');
    } else if (conference === null) {
      form = t('entities.conference.deleted');
    } else {
      form = (
        <ConferenceForm
          conference={conference}
          onSubmit={this.handleSubmit}
          onCancelEditing={onCancelEditing}
          onDelete={this.handleDelete}
        />
      );
    }
    return (
      <>
        <UnauthenticatedView keycloak={keycloak}>
          {t('common.notAuthenticated')}
        </UnauthenticatedView>
        <AuthenticatedView keycloak={keycloak}>
         {form}
        </AuthenticatedView>
        <Notification
          status={notificationStatus}
          message={notificationMessage}
          onClose={this.closeNotification}
        />
      </>
    );
  }
}

ConferenceEditFormContainer.propTypes = {
  id: PropTypes.string.isRequired,
  onCancelEditing: PropTypes.func,
  onError: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  t: PropTypes.func.isRequired,
  keycloak: keycloakType.isRequired,
  config: PropTypes.object,
};

ConferenceEditFormContainer.defaultProps = {
  onCancelEditing: () => {},
  onDelete: () => {},
  onUpdate: () => {},
  onError: () => {},
  config: {},
};

export default withKeycloak(withTranslation()(ConferenceEditFormContainer));
