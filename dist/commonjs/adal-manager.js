'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdalManager = undefined;

var _dec, _class;

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaDependencyInjection2 = _interopRequireDefault(_aureliaDependencyInjection);

var _aureliaPal = require('aurelia-pal');

var _aureliaPal2 = _interopRequireDefault(_aureliaPal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdalManager = exports.AdalManager = (_dec = (0, _aureliaDependencyInjection2.default)(_aureliaPal2.default), _dec(_class = function () {
  function AdalManager(platform) {
    _classCallCheck(this, AdalManager);

    this.user = {
      isAuthenticated: false,
      userName: '',
      loginError: '',
      profile: null
    };

    this.platform = platform;
  }

  AdalManager.prototype.initialize = function initialize(authContext) {
    this.adal = authContext;
    this.updateUserFromCache();
  };

  AdalManager.prototype.updateUserFromCache = function updateUserFromCache() {
    var resource = this.adal.config.loginResource;
    var token = this.adal.getCachedToken(resource);
    var user = this.adal.getCachedUser() || {};

    this.user.isAuthenticated = token !== null && token.length > 0;
    this.user.userName = user.userName || '';
    this.user.profile = user.profile || null;
    this.user.loginError = this.adal.getLoginError();
  };

  AdalManager.prototype.hashHandler = function hashHandler(hash, redirectHandler, isNotCallbackHandler, nextHandler) {
    if (this.adal.isCallback(hash)) {
      var requestInfo = this.adal.getRequestInfo(hash);

      this.adal.saveTokenFromHash(requestInfo);

      if (requestInfo.requestType !== this.adal.REQUEST_TYPE.LOGIN) {
        this.adal.callback = this.platform.global.parent.AuthenticationContext().callback;
        if (requestInfo.requestType === this.adal.REQUEST_TYPE.RENEW_TOKEN) {
          this.adal.callback = this.platform.global.parent.callBackMappedToRenewStates[requestInfo.stateResponse];
        }
      }

      if (requestInfo.stateMatch) {
        if (typeof this.adal.callback === 'function') {
          if (requestInfo.requestType === this.adal.REQUEST_TYPE.RENEW_TOKEN) {
            if (requestInfo.parameters['access_token']) {
              this.adal.callback(this.adal._getItem(this.adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION), requestInfo.parameters['access_token']);
              return nextHandler();
            } else if (requestInfo.parameters['id_token']) {
              this.adal.callback(this.adal._getItem(this.adal.CONSTANTS.STORAGE.ERROR_DESCRIPTION), requestInfo.parameters['id_token']);
              return nextHandler();
            }
          }
        } else {
          this.updateUserFromCache();

          if (this.user.userName) {
            var loginStartPage = this.adal._getItem(this.adal.CONSTANTS.STORAGE.START_PAGE);
            if (loginStartPage) {
              return redirectHandler(loginStartPage);
            }
          } else {}
        }
      }
    } else {
        return isNotCallbackHandler();
      }
  };

  AdalManager.prototype.loginHandler = function loginHandler(path, redirectHandler, handler) {
    this.adal.info('Login event for:' + path);

    if (this.adal.config && this.adal.config.localLoginUrl) {
      return redirectHandler(this.adal.config.localLoginUrl);
    } else {
      this.adal._saveItem(this.adal.CONSTANTS.STORAGE.START_PAGE, path);
      this.adal.info('Start login at:' + this.platform.location.href);
      this.adal.login();
      return handler();
    }
  };

  AdalManager.prototype.loadTokenForRequest = function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(requestUrl, onExistingTokenFound, onNewTokenAcquired) {
      var resource, tokenStored, isEndpoint, token;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              resource = this.adal.getResourceForEndpoint(requestUrl);

              if (!(resource == null)) {
                _context.next = 3;
                break;
              }

              return _context.abrupt('return');

            case 3:
              tokenStored = this.adal.getCachedToken(resource);
              isEndpoint = false;

              if (!tokenStored) {
                _context.next = 10;
                break;
              }

              this.adal.info('Token is avaliable for this url ' + requestUrl);

              onExistingTokenFound(tokenStored);_context.next = 22;
              break;

            case 10:
              if (this.adal.config) {
                isEndpoint = this.adal.config.endpoints.some(function (url) {
                  return requestUrl.indexOf(url) > -1;
                });
              }

              if (!this.adal.loginInProgress()) {
                _context.next = 16;
                break;
              }

              this.adal.info('login already started.');

              throw new Error('login already started');

            case 16:
              if (!(this.adal.config && isEndpoint)) {
                _context.next = 22;
                break;
              }

              _context.next = 19;
              return this.adal.acquireToken(resource);

            case 19:
              token = _context.sent;


              this.adal.verbose('Token is avaliable');
              onNewTokenAcquired(token);
            case 22:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function loadTokenForRequest(_x, _x2, _x3) {
      return ref.apply(this, arguments);
    }

    return loadTokenForRequest;
  }();

  AdalManager.prototype.handleRequestFailed = function handleRequestFailed(requestUrl, requestNotAuthorized) {
    this.adal.info('Getting error in the response');

    if (requestNotAuthorized) {
      var resource = this.adal.getResourceForEndpoint(requestUrl);
      this.adal.clearCacheForResource(resource);
    }
  };

  return AdalManager;
}()) || _class);