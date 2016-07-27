/* jshint ignore:start */

import querystring from 'querystring';
import CryptoJS from 'crypto-js';
import DeviceInfo from 'react-native-device-info';
import { manageResponse } from './../';

let AUTH_URL = 'https://android.clients.google.com/auth';
let ANDROID_ID = '9774d56d682e549c';
let CLIENT_ID = "848232511240-73ri3t7plvk96pj4f85uj8otdat2alem.apps.googleusercontent.com";
let OAUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/device/code";
let OAUTH_TOKEN_ENDPOINT = "https://www.googleapis.com/oauth2/v4/token";
let SECRET = "NCjF1TLi2CcY6t5mt0ZveuL7";

let oauthService = 'audience:server:client_id:848232511240-7so421jotr2609rmqakceuu1luuq0ptb.apps.googleusercontent.com';
let app = 'com.nianticlabs.pokemongo';
let clientSig = '321187995bc7cdc2b5fc91b11a96e2baa8602c62';


let oauthUtil = {};

oauthUtil.Base64 = {
    _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    stringify: CryptoJS.enc.Base64.stringify,
    parse: CryptoJS.enc.Base64.parse
};

oauthUtil.parseKeyValues = function (body) {
    var obj = {};
    body.split("\n").forEach(function (line) {
        var pos = line.indexOf("=");
        if (pos > 0) obj[line.substr(0, pos)] = line.substr(pos + 1);
    });
    return obj;
};

oauthUtil.salt = function (len) {
    return Array.apply(0, Array(len)).map(function () {
        return (function (charset) {
            return charset.charAt(Math.floor(Math.random() * charset.length));
        }('abcdefghijklmnopqrstuvwxyz0123456789'));
    }).join('');
};

export class GoogleAuth {
    oAuth(email, masterToken) {
        return fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 5.1.1; Andromax I56D2G Build/LMY47V',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: querystring.stringify({
                accountType: "HOSTED_OR_GOOGLE",
                Email: email,
                EncryptedPasswd: masterToken,
                has_permission: 1,
                service: oauthService,
                source: 'android',
                androidId: ANDROID_ID,
                app: app,
                client_sig: clientSig,
                device_country: DeviceInfo.getDeviceCountry(),
                operatorCountry: DeviceInfo.getDeviceCountry(),
                lang: DeviceInfo.getDeviceLocale(),
                sdk_version: "17"
            })
        })
        .then(manageResponse('text'))
        .then((response) => {

            return oauthUtil.parseKeyValues(response);
        })
    }

    oAuth2(code) {
        return fetch(OAUTH_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: querystring.stringify({
                code: code,
                client_id: CLIENT_ID,
                client_secret: SECRET,
                redirect_uri: 'http://127.0.0.1:9004',
                grant_type: 'authorization_code'
            })
        })
        .then(manageResponse('json'))
    }

    login(email, password){

        return fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 5.1.1; Andromax I56D2G Build/LMY47V',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: querystring.stringify({
                accountType: 'HOSTED_OR_GOOGLE',
                Email: email.trim(),
                has_permission: '1',
                add_account: '1',
                Passwd: password,
                service: 'ac2dm',
                source: 'android',
                androidId: ANDROID_ID,
                device_country: DeviceInfo.getDeviceCountry(),
                operatorCountry: DeviceInfo.getDeviceCountry(),
                lang: DeviceInfo.getDeviceLocale(),
                sdk_version: '17'
            })
        })
        .then(manageResponse('text'))
        .then((response) => {
            let data = oauthUtil.parseKeyValues(response);
            return this.oAuth(email, data.Token);
        });
    }
}
/* jshint ignore:end */
