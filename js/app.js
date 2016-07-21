import React, { Component } from 'react';

import {
    AppRegistry,
    StyleSheet,
    Text,
    Dimensions,
    View
} from 'react-native';

import { Container, Button } from 'native-base';

import styles from './styles';
import { PokemonService } from './services';
import { pokemonImages } from './images';

import MapView from 'react-native-maps';


let { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 1948.524658203125;
const LONGITUDE = -101.230692739541;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

export class Pikapika extends Component {
    watchID = (null: ?number);

    constructor(props){
        super(props);

        this.state = {
            lastPosition: null,
            loading: false,
            pokemonList: []
        };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                var initialPosition = position;
                initialPosition.latitudeDelta = LATITUDE_DELTA;
                initialPosition.longitudeDelta = LONGITUDE_DELTA;

                //this.setState({initialPosition});
                this.position = position;
            },
            (error) => {
                alert(error.message);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );

        this.watchID = navigator.geolocation.watchPosition((position) => {
            this.position = position;
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    getPokemons() {
        PokemonService.find().then((pokemonList) => {
            console.log(pokemonList);
            this.setState({pokemonList});
        });
    }

    render() {
        return (
            <View style={styles.page}>
            <MapView.Animated
            showsUserLocation={true}
            followsUserLocation={true}
            style={styles.map}
            >
            {this.state.pokemonList.map(pokemon => (
            <MapView.Marker.Animated
            key={pokemon.timestamp+pokemon.id+pokemon.timeleft}
            title={pokemon.name}
            description={`Timeleft: ${pokemon.timeleft} seconds ${pokemon.id}`}
            image={pokemonImages[pokemon.id]}
            coordinate={{
                latitude: pokemon.lat,
                longitude: pokemon.lng
            }}
            />
            ))}
            </MapView.Animated>
            <Button block onPress={ ()=>{
                this.getPokemons();
            }}>
                Find
            </Button>
            </View>
        );
    }
}
