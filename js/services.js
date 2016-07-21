export let PokemonService = {
    find: function(position){
        return fetch('https://dl.dropboxusercontent.com/u/820149/pokemon_data.json')
        .then((response) => response.json())
        .catch((error) => console.log(error));
    }
};
