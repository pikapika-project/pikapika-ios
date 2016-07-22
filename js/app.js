import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, Dimensions, View } from 'react-native';
import { Container, Button, List, ListItem, InputGroup, Input, Icon, Content } from 'native-base';
import MapView from 'react-native-maps';
import Modal from 'react-native-modalbox';
import RadioButton from 'react-native-radio-button';

import styles from './styles';
import { PokemonService, AuthService } from './services';
import { pokemonImages } from './images';

let { width, height } = Dimensions.get('window');

export class Pikapika extends Component {
    watchID = (null: ?number);

    constructor(props){
        super(props);

        this.state = {
            lastPosition: null,
            loading: false,
            pokemonList: [],
            username: null,
            password: null,
            provider: 'google'
        };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.position = position;
                console.log(position);
            },
            (error) => {
                alert(error.message);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );

        this.watchID = navigator.geolocation.watchPosition((position) => {
            this.position = position;
        });

        this.refs.login.open();
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    login(){
        if(this.state.username && this.state.password && this.position){
            AuthService.login(
                this.state.username,
                this.state.password,
                this.position,
                this.state.provider
            )
            .then( (response) => {
                if(response){
                    let pokemonList = response.data;
                    this.setState({ pokemonList });
                    this.refs.login.close();
                }
            });
        }
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
                description={`Timeleft: ${pokemon.timeleft} seconds`}
                image={pokemonImages[pokemon.id]}
                coordinate={{
                    latitude: pokemon.lat,
                    longitude: pokemon.lng
                }}
                />
            ))}
            </MapView.Animated>

            <Button block onPress={ ()=>{ this.getPokemons() }}>
            <Icon name="ios-search"/>
            </Button>

            <Modal style={styles.login} ref={"login"} swipeToClose={false} backdropPressToClose={false} position={'center'}>
            <Text>
            SignUp
            </Text>
            <InputGroup>
            <Icon name="ios-person" />
            <Input placeholder="EMAIL" onChangeText={(username) => this.setState({username})} />
            </InputGroup>
            <InputGroup>
            <Icon name="ios-unlock" />
            <Input placeholder="PASSWORD" secureTextEntry={true} onChangeText={(password) => this.setState({password})}/>
            </InputGroup>

            <View>
            <View style={styles.radioContainer}>
            <RadioButton
            animation={'bounceIn'}
            isSelected={this.state.provider === 'google'}
            onPress={() => {
                let provider = 'google';
                this.setState({provider});
            }}
            />
            <Text style={styles.radioText}>
            Google
            </Text>
            </View>
            <View style={styles.radioContainer}>
            <RadioButton
            animation={'bounceIn'}
            isSelected={this.state.provider === 'ptc'}
            onPress={() => {
                let provider = 'ptc';
                this.setState({provider});
            }}
            />
            <Text style={styles.radioText}>
            Pokemon Trainer
            </Text>
            </View>
            </View>

            <Button block warning onPress={() => { this.login() }}> Go! </Button>
            </Modal>
            </View>
        );
    }
}
