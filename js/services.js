import { GoogleAuth, PokemonClubAuth } from './auth';
import { manageResponse } from './utils';
import DeviceInfo from 'react-native-device-info';

let google = new GoogleAuth();
let pokemonClub = new PokemonClubAuth();

let host = 'https://api.pikapika.io';

export let SystemService = {
    config: function(){
        return fetch(`${host}/configuration`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(manageResponse('json'))
        .then((response) => response.data);
    }
};

export let PokemonService = {
    find: function(coords, accessToken){
        return fetch(`${host}/v2/pokemons/${coords.latitude}/${coords.longitude}/heartbeat?access_token=${accessToken}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        })
        .then(manageResponse('json'))
        .then((response) => response.data)
        .catch((error) => {
            return Promise.reject(error);
        });
    },
    get: function(coords, radious){
        return fetch(`${host}/pokemons/${coords.latitude}/${coords.longitude}?radius=${radious || 1000}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        })
        .then(manageResponse('json'))
        .then((response) => response.data)
        .catch((error) => {
            return Promise.reject(error);
        });
    },
};

export let TrainerService = {
    status: function() {
        return fetch(`${host}`)
        .then(manageResponse('json'))
        .catch((error) => console.log(error));
    },
    logIn: function(accessToken, refreshToken, expireTime, provider){
        return fetch(`${host}/trainers/login`, {
            method: 'POST',
            timeout: 15000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'device_unique_id': DeviceInfo.getUniqueID(),
                provider: provider
            })
        })
        .then(manageResponse('json'))
        .then((response) => {
            response.data.accessToken = accessToken;
            response.data.refreshToken = refreshToken;
            response.data.expireTime = expireTime;
            response.data.createdAt = new Date().getTime();
            response.data.expireAt = new Date().getTime() + (expireTime * 1000);

            return response.data;
        })
        .catch(error => console.log(error));
    },

    refreshTokenGoogle: function(refreshToken){
        return google.refresh(refreshToken)
        .then(
            (response) => {
                return {
                    accessToken: response['id_token'],
                    refreshToken: response['refresh_token'] || refreshToken,
                    expireTime: response['expires_in'],
                    createdAt: new Date().getTime(),
                    expireAt: new Date().getTime() + (response['expires_in'] * 1000)
                };
            }
        ).catch(
            (error) => { console.log(error); }
        );
    },

    logInWithGoogleOAuth2: function(code){
        return google.oAuth2(code)
        .then(
            (response) => this.logIn(
                response['id_token'], response['refresh_token'], response['expires_in'], 'google'
            )
        );
    },

    logInWithPokemonClub: function(username, password, location){
        return pokemonClub.service(username,password);
    }
};
