import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import keycloakType from 'components/__types__/keycloak';
import withKeycloak from 'auth/withKeycloak';
import { AuthenticatedView, UnauthenticatedView } from 'auth/KeycloakViews';
import { apiConferencePost } from 'api/conferences';
import Notification from 'components/common/Notification';
import ConferenceForm from 'components/ConferenceForm';

class ConferenceAddFormContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      notificationMessage: null,
      notificationStatus: null,
    };

    this.closeNotification = this.closeNotification.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  closeNotification() {
    this.setState({
      notificationMessage: null
    });
  }

  async handleSubmit(conference) {
    const { t, onCreate, keycloak, config } = this.props;
    const serviceUrl =
      config &&
      config.systemParams &&
      config.systemParams.api &&
      config.systemParams.api['conference-api'].url;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      try {
        const createdConference = await apiConferencePost(serviceUrl, conference);
        onCreate(createdConference);
        this.setState({
          notificationMessage: t('common.dataSaved'),
          notificationStatus: Notification.SUCCESS,
        });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  handleError(err) {
    const { onError, t } = this.props;
    onError(err);
    this.setState({
      notificationMessage: t('error.dataLoading'),
      notificationStatus: Notification.ERROR,
    });
  }

  render() {
    const { keycloak, onCancelEditing, t } = this.props;
    const { notificationMessage, notificationStatus } = this.state;

    return (
      <>
        <UnauthenticatedView keycloak={keycloak}>
          {t('common.notAuthenticated')}
        </UnauthenticatedView>
        <AuthenticatedView keycloak={keycloak}>
          <ConferenceForm onSubmit={this.handleSubmit} onCancelEditing={onCancelEditing} />
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

ConferenceAddFormContainer.propTypes = {
  onError: PropTypes.func,
  onCancelEditing: PropTypes.func,
  onCreate: PropTypes.func,
  t: PropTypes.func.isRequired,
  keycloak: keycloakType.isRequired,
  config: PropTypes.object,
};

ConferenceAddFormContainer.defaultProps = {
  onError: () => {},
  onCancelEditing: () => {},
  onCreate: () => {},
  config: {},
};

export default withKeycloak(withTranslation()(ConferenceAddFormContainer));
