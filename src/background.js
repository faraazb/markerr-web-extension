
chrome.contextMenus.create({
    id: "markerr-cm-1",
    title: "Annotate with Simple Markerr"
});

chrome.contextMenus.onClicked.addListener(
    async (_info, tab) => {
        // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "INIT" });
    }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { action, payload } = message;
    if (action in handlers) {
        handlers[action](payload).then((v) => sendResponse(v));
    }
    return true;
});

const handlers = {
    "LOGIN": login
}

// If you make changes here, you have to reload the extension (in settings) for them to take effect

// Any function in this file can be referenced elsewhere by using chrome.extension.getBackgroundPage().myFunction()
// For example, you can reference the login function as chrome.extension.getBackgroundPage().login()

var config = {
    "userInfoUrl": "https://www.googleapis.com/plus/v1/people/me",
    "userInfoNameField": "displayName",
    "implicitGrantUrl": "https://accounts.google.com/o/oauth2/auth",
    "logoutUrl": "https://accounts.google.com/logout",
    "tokenInfoUrl": "https://www.googleapis.com/oauth2/v3/tokeninfo",
    "clientId": "some-client-id",
    "scopes": "https://www.googleapis.com/auth/userinfo.profile",
    "logoutWarningSeconds": 60,
    "autoReLogin": true
};
var token = null;
var logger = console;

function init(cfg, log) {
    config = cfg;
    logger = log;
}

function getLastToken() {
    return token;
}

function login() {
    return new Promise((resolve, reject) => {
        var authUrl = config.implicitGrantUrl
            + '?response_type=token&client_id=' + config.clientId
            + '&scope=' + config.scopes
            + '&redirect_uri=' + chrome.identity.getRedirectURL("oauth2");

        logger.debug('launchWebAuthFlow:', authUrl);

        chrome.identity.launchWebAuthFlow({ 'url': authUrl, 'interactive': true }, function (redirectUrl) {
            if (redirectUrl) {
                logger.debug('launchWebAuthFlow login successful: ', redirectUrl);
                var parsed = parse(redirectUrl.substr(chrome.identity.getRedirectURL("oauth2").length + 1));
                token = parsed.access_token;
                logger.debug('Background login complete');
                resolve(token);
            } else {
                logger.debug("launchWebAuthFlow login failed. Is your redirect URL (" + chrome.identity.getRedirectURL("oauth2") + ") configured with your OAuth2 provider?");
                reject(undefined);
            }
        });
    })
}

function logout(config, callback) {
    var logoutUrl = config.logoutUrl;

    chrome.identity.launchWebAuthFlow({ 'url': logoutUrl, 'interactive': false }, function (redirectUrl) {
        logger.debug('launchWebAuthFlow logout complete');
        return callback(redirectUrl)
    });
}

function parse(str) {
    if (typeof str !== 'string') {
        return {};
    }
    str = str.trim().replace(/^(\?|#|&)/, '');
    if (!str) {
        return {};
    }
    return str.split('&').reduce(function (ret, param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join('=') : undefined;
        key = decodeURIComponent(key);
        val = val === undefined ? null : decodeURIComponent(val);
        if (!ret.hasOwnProperty(key)) {
            ret[key] = val;
        }
        else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        }
        else {
            ret[key] = [ret[key], val];
        }
        return ret;
    }, {});
}
