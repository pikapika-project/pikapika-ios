import { manageResponse } from './utils';
import DeviceInfo from 'react-native-device-info';

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
    get: function(coords, radious = 1000){
        radious = radious > 50000 ? 50000 : radious;

        return fetch(
            `${host}/pokemons/${coords.latitude}/${coords.longitude}?neLat=${coords.neLat}&neLng=${coords.neLng}&swLat=${coords.swLat}&swLng=${coords.swLng}&radius=${radious}`,            {
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
