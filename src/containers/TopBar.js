import isError from 'lodash/isError';
import isString from 'lodash/isString';
import {connect} from 'react-redux';
import Bugsnag from '../util/Bugsnag';
import TopBar from '../components/TopBar';
import {
  getCurrentProjectKey,
  getCurrentUser,
  getCurrentValidationState,
  getEnabledLibraries,
  getOpenTopBarMenu,
  getAllProjectKeys,
  isExperimental,
  isGistExportInProgress,
  isSnapshotInProgress,
  isTextSizeLarge,
  isUserAuthenticated,
  isUserTyping,
} from '../selectors';
import {
  changeCurrentProject,
  closeTopBarMenu,
  createProject,
  createSnapshot,
  exportGist,
  exportRepo,
  notificationTriggered,
  toggleEditorTextSize,
  toggleLibrary,
  toggleTopBarMenu,
} from '../actions';
import {
  signIn,
  signOut,
} from '../clients/firebase';

function mapStateToProps(state) {
  return {
    currentProjectKey: getCurrentProjectKey(state),
    currentUser: getCurrentUser(state),
    enabledLibraries: getEnabledLibraries(state),
    isExperimental: isExperimental(state),
    isGistExportInProgress: isGistExportInProgress(state),
    isSnapshotInProgress: isSnapshotInProgress(state),
    isTextSizeLarge: isTextSizeLarge(state),
    isUserAuthenticated: isUserAuthenticated(state),
    isUserTyping: isUserTyping(state),
    openMenu: getOpenTopBarMenu(state),
    projectKeys: getAllProjectKeys(state),
    validationState: getCurrentValidationState(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeCurrentProject(projectKey) {
      dispatch(changeCurrentProject(projectKey));
    },

    onClickMenu(menuKey) {
      dispatch(toggleTopBarMenu(menuKey));
    },

    onCloseMenu(menuKey) {
      dispatch(closeTopBarMenu(menuKey));
    },

    onCreateNewProject() {
      dispatch(createProject());
    },

    onCreateSnapshot() {
      dispatch(createSnapshot());
    },

    onExportGist() {
      dispatch(exportGist());
    },

    onExportRepo() {
      dispatch(exportRepo());
    },

    onToggleLibrary(projectKey, libraryKey) {
      dispatch(toggleLibrary(projectKey, libraryKey));
    },

    onLogOut() {
      signOut();
    },

    onStartLogIn() {
      signIn().catch((e) => {
        switch (e.code) {
          case 'auth/popup-closed-by-user':
            dispatch(notificationTriggered('user-cancelled-auth'));
            break;
          case 'auth/network-request-failed':
            dispatch(notificationTriggered('auth-network-error'));
            break;
          case 'auth/cancelled-popup-request':
            break;
          case 'auth/web-storage-unsupported':
          case 'auth/operation-not-supported-in-this-environment':
            dispatch(
              notificationTriggered('auth-third-party-cookies-disabled'),
            );
            break;
          case 'auth/internal-error':
            dispatch(notificationTriggered('auth-error'));
            break;
          default:
            dispatch(notificationTriggered('auth-error'));
            if (isError(e)) {
              Bugsnag.notifyException(e, e.code);
            } else if (isString(e)) {
              Bugsnag.notifyException(new Error(e));
            }
            break;
        }
      });
    },

    onToggleTextSize() {
      dispatch(toggleEditorTextSize());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TopBar);
