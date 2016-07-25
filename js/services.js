import { GoogleAuth } from './auth';

let google = new GoogleAuth();

const host = 'https://api.pikapika.io';

export let PokemonService = {
    find: function(coords, accessToken){
        return fetch(`${host}/pokemons/${coords.latitude}/${coords.longitude}/heartbeat?access_token=${accessToken}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            timeout: 20000
        })
        .then(manageResponse)
        .then((response) => response.data);
    }
};

export let TrainerService = {
    status: function() {
        return fetch(`${host}`)
        .then(manageResponse)
        .catch((error) => console.log(error));
    },
    logIn: function(username, token, expireTime, location, provider){
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
            }),
            timeout: 20000
        })
        .then((response) => {
            return response.json();
        })
        .then(manageResponse)
        .catch(error => console.log(error));
    },

    logInWithGoogle: function(mail, password, location){
        return google.login(mail, password)
        .then((response) => {
            return this.logIn(mail, response.Auth, response.Expiry, location, 'google');
        })
        .catch(error => console.log(error));
    }
};

function manageResponse(response) {
    if(response.ok){
        return response.json();
    }
    else{
        return Promise.reject(response);
    }
}
