import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, Dimensions, View, AsyncStorage } from 'react-native';
import { Container, Button, List, ListItem, InputGroup, Input, Icon, Content } from 'native-base';
import MapView from 'react-native-maps';
import Modal from 'react-native-modalbox';
import RadioButton from 'react-native-radio-button';

import styles from './styles';
import strings from './localization';
import { PokemonService, TrainerService } from './services';
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
            provider: 'google',
            user: null
        };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
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

        AsyncStorage.getItem('user')
        .then((user) => {
            if(user){
                user = JSON.parse(user);
                this.setState({user});
            }
            else{
                this.refs.logIn.open();
            }
        })
        .done();

    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    logIn(){
        if(this.state.username && this.state.password && this.position){
            TrainerService.logIn(
                this.state.username,
                this.state.password,
                this.position,
                this.state.provider
            )
            .then((user) => {
                if(user) {
                    this.setState({user});

                    this.refs.logIn.close();
                    AsyncStorage.setItem('user', JSON.stringify(user));
                }
                else {
                    alert('Error');
                }
            })
            .catch((error) => {
                alert(error);
            });
        }
    }

    getPokemons() {
        console.log(typeof this.state.user);
        console.log(this.state.user['access_token']);
        PokemonService
        .find(this.position.coords, this.state.user['access_token'])
        .then((pokemonList) => {
            alert('is in');
            if(pokemonList){
                console.log(pokemonList);
                this.setState({pokemonList});
            }
        })
        .catch((error) => {
            alert(error);
        });
    }

    logOut(){
        AsyncStorage.removeItem('user')
        .then(() => {
            let user = null;

            this.setState({user});
            this.refs.logIn.open();
        })
        .done();
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
                key={pokemon.SpawnPointId}
                title={pokemon.pokemon.PokemonName}
                description={`Timeleft: ${pokemon.TimeTillHiddenMs} seconds`}
                image={pokemonImages[pokemon.pokemon.PokemonId]}
                coordinate={{
                    latitude: pokemon.Latitude,
                    longitude: pokemon.Longitude
                }}
                />
            ))}
            </MapView.Animated>

            {
                this.state.user && (
                    <Button style={styles.squareButton} block onPress={ ()=>{ this.getPokemons() }}>
                    <Icon name="ios-search"/>
                    </Button>
                )
            }

            <Modal style={styles.logIn} ref={"logIn"} swipeToClose={false} backdropPressToClose={false} position={'center'}>
            <Text style={styles.logInTitle}>
            {strings.logIn}
            </Text>
            <Text style={styles.logInSubTitle}>
            {strings.logInSubTitle}
            </Text>
            <InputGroup>
            <Icon name="ios-person" />
            <Input placeholder={strings.email} onChangeText={(username) => this.setState({username})} />
            </InputGroup>
            <InputGroup>
            <Icon name="ios-unlock" />
            <Input placeholder={strings.password} secureTextEntry={true} onChangeText={(password) => this.setState({password})}/>
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

            <Button style={styles.logInButton} block warning onPress={() => { this.logIn() }}> Go! </Button>
            </Modal>

            {
                this.state.user && (
                    <Button danger style={styles.logout} onPress={() => this.logOut() }>
                    <Icon name="ios-close" style={styles.logoutIcon} />
                    </Button>
                )
            }
            </View>
        );
    }
}
