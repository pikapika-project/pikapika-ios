import { GoogleAuth, PokemonClubAuth } from './auth';
import { manageResponse } from './utils';

let google = new GoogleAuth();
let pokemonClub = new PokemonClubAuth();

let host = 'https://api.pikapika.io';

export let PokemonService = {
    find: function(coords, accessToken){
        return fetch(`${host}/pokemons/${coords.latitude}/${coords.longitude}/heartbeat?access_token=${accessToken}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(manageResponse('json'))
        .then((response) => response.data)
        .catch((error ) => {
            return Promise.reject(error);
        });
    }
};

export let TrainerService = {
    status: function() {
        return fetch(`${host}`)
        .then(manageResponse('json'))
        .catch((error) => console.log(error));
    },
    logIn: function(username, token, expireTime, location, provider, refreshToken){
        delete location.coords.speed;
        delete location.coords.accuracy;
        delete location.coords.heading;
        delete location.coords.altitudeAccuracy;

        return fetch(`${host}/trainers/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                provider: {
                    name: provider,
                    token: token,
                    expireTime: expireTime
                },
                location: location.coords
            })
        })
        .then(manageResponse('json'))
        .then((response) => {
            response.data.refreshToken = refreshToken;
            response.data.expireTime = expireTime;
            response.data.createdAt = new Date().getTime();
            response.data.expireAt = new Date().getTime() + (expireTime * 1000);

            return response.data;
        })
        .catch(error => console.log(error));
    },

    refreshTokenGoogle: function(token, location){
        return google.refresh(token)
        .then(
            (response) => this.logIn(
                'google', response['id_token'], response['expires_in'], location, 'google', response['refresh_token'] || token
            )
        ).catch(
            (error) => { console.log(error); }
        );
    },

    logInWithGoogleOAuth2: function(code, location){
        return google.oAuth2(code)
        .then(
            (response) => this.logIn('google', response['id_token'], response['expires_in'], location, 'google', response['refresh_token'])
        );
    },

    logInWithGoogle: function(mail, password, location){
        return google.login(mail, password)
        .then((response) => {
            return this.logIn(mail, response.Auth, response.Expiry, location, 'google');
        })
        .catch(error => console.log(error));
    },

    logInWithPokemonClub: function(username, password, location){
        return pokemonClub.service(username,password);
    }
};
