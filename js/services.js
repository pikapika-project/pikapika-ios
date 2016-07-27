import { GoogleAuth, PokemonClubAuth } from './auth';
import { manageResponse } from './utils';

let google = new GoogleAuth();
let pokemonClub = new PokemonClubAuth();

let host = 'https://api.pikapika.io';

export let PokemonService = {
    find: function(coords, accessToken){
        accessToken = 'ya29.Ci8tA2Ij2P77Rh9LG8qcbGSesB959bQz02VixZVdms7x5TqHBg44sp1pay_Pvp9A5w';
        return fetch(`${host}/pokemons/${coords.latitude}/${coords.longitude}/heartbeat?access_token=${accessToken}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(manageResponse('json'))
        .then((response) => response.data);
    }
};

export let TrainerService = {
    status: function() {
        return fetch(`${host}`)
        .then(manageResponse('json'))
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
                    token: 'ya29.Ci8tA2Ij2P77Rh9LG8qcbGSesB959bQz02VixZVdms7x5TqHBg44sp1pay_Pvp9A5w',
                    expireTime: expireTime
                },
                location: location.coords
            })
        })
        .then(manageResponse('json'))
        .then((response) => response.data)
        .catch(error => console.log(error));
    },

    logInWithGoogle: function(mail, password, location){
        return google.login(mail, password)
        .then((response) => {
            console.log(response);
            return this.logIn(mail, response.Auth, response.Expiry, location, 'google');
        })
        .catch(error => console.log(error));
    },

    logInWithPokemonClub: function(username, password, location){
        return pokemonClub.service(username,password);
    }
};
