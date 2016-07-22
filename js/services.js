const host = 'http://10.0.1.13:3000';

export let PokemonService = {
    find: function(coords, accessToken){
        console.log(`${host}/pokemons/${coords.latitude}/${coords.longitude}/heartbeat?access_token=${accessToken}`);
        return fetch(`${host}/pokemons/${coords.latitude}/${coords.longitude}/heartbeat?access_token=${accessToken}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then((response) => response.json())
        .then((response) => response.data)
        .catch((error) => console.log(error));
    }
};

export let TrainerService = {
    status: function() {
        return fetch(`${host}`)
        .then((response) => response.json())
        .catch((error) => console.log(error));
    },
    logIn: function(username, password, location, provider){
        delete location.coords.speed;
        delete location.coords.accuracy;
        delete location.coords.heading;
        delete location.coords.altitudeAccuracy;

        return fetch(`${host}/trainers/logIn`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                provider: provider,
                location: {
                    type: 'coords',
                    name: '0',
                    coords: location.coords
                }
            })
        })
        .then((response) => response.json())
        .then((response) => response.data)
        .catch((error) => console.log(error));
    }
};
