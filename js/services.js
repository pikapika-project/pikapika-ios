const host = 'http://10.0.1.14:3000';

export let PokemonService = {
    find: function(position){
        return fetch('https://dl.dropboxusercontent.com/u/820149/pokemon_data.json')
        .then((response) => response.json())
        .catch((error) => console.log(error));
    }
};

export let AuthService = {
    status: function() {
        return fetch(`${host}`)
        .then((response) => response.json())
        .catch((error) => console.log(error));
    },
    login: function(username, password, location){
        delete location.coords.speed;
        delete location.coords.accuracy;
        delete location.coords.heading;
        delete location.coords.altitudeAccuracy;

        return fetch(`${host}/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                provider: 'google',
                location: {
                    type: 'coords',
                    name: '0',
                    coords: location.coords
                }
            })
        })
        .then((response) => { response.text(); })
        .catch((error) => console.log(error));
    }
};
