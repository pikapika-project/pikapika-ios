import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, Dimensions, View, AsyncStorage, AlertIOS } from 'react-native';
import { Container, Button, List, ListItem, InputGroup, Input, Icon, Content } from 'native-base';
import MapView from 'react-native-maps';
import Modal from 'react-native-modalbox';
import RadioButton from 'react-native-radio-button';
import Sound from 'react-native-sound';
import TimerMixin from 'react-timer-mixin';
import Toast from 'react-native-root-toast';
import Spinner from 'react-native-spinkit';
import moment from 'moment';

import styles from './styles';
import strings from './localization';
import { PokemonService, TrainerService } from './services';
import { pokemonImages } from './images';
import { pokemonSounds } from './sounds';

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
            user: null,
            disableSearch: false
        };
    }

    componentDidMount() {

        this.showInfo(strings.messages.onInit);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.position = position;
            },
            (error) => {
                this.showError(error.message);
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

        AsyncStorage.getItem('sesion')
        .then((sesion) => {
            const _sesion = JSON.parse(sesion);

            const username = _sesion.username;
            const password = _sesion.password;
            const provider = _sesion.provider;

            this.setState({username});
            this.setState({password});
            this.setState({provider});
        })
        .done();
    }

    logIn(){
        if(this.state.username && this.state.password && this.position){
            this.loading(true);
            TrainerService.logIn(
                this.state.username,
                this.state.password,
                this.position,
                this.state.provider
            )
            .then((user) => {
                this.loading(false);

                if(user) {
                    this.setState({user});

                    this.refs.logIn.close();

                    AsyncStorage.setItem('user', JSON.stringify(user));

                    AsyncStorage.setItem('sesion', JSON.stringify({
                        username: this.state.username,
                        password: this.state.password,
                        provider: this.state.provider
                    }));


                    this.getPokemons();
                }
                else {
                    this.showError(strings.errors.login);
                    this.refs.logIn.open();
                }
            })
            .catch((error) => {
                this.loading(false);

                this.showError(strings.errors.server);

                this.refs.logIn.open();
            });
        }
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

    getPokemons() {
        this.loading(true);

        let disableSearch = true;
        this.setState({disableSearch});

        this.searchTimer();

        PokemonService
        .find(this.position.coords, this.state.user['access_token'])
        .then((pokemonList) => {
            this.loading(false);

            if(pokemonList){
                this.setState({pokemonList});
            }
            else{
                //this.showError(strings.errors.unauth);
                this.logIn();
            }
        })
        .catch((error) => {
            this.loading(false);

            this.showError(strings.errors.server);
        });
    }

    searchTimer() {
        TimerMixin.setTimeout( () => {
            let disableSearch = false;
            this.setState({disableSearch});
        }, 15000);
    }

    loading(loading) {
        this.setState({loading});
    }

    showError(message) {
        let toast = Toast.show(message, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTON,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });
    }

    showInfo(message){
        let toast = Toast.show(message, {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
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
                <MapView.Marker
                key={pokemon.id}
                identifier={pokemon.id}
                title={pokemon.name}
                description={
                    strings.formatString(
                        strings.timeleft,
                        moment('2000-01-01 00:00:00').add(
                            moment.duration(pokemon.timeleft)
                        ).format('mm:ss')
                    )
                }
                image={pokemonImages[pokemon.number]}
                coordinate={{
                    latitude: pokemon.position.lat,
                    longitude: pokemon.position.lng
                }}
                onPress={ () => {
                    pokemonSounds[pokemon.number].setVolume(0.01);
                    pokemonSounds[pokemon.number].play();
                } }
                />
            ))}
            </MapView.Animated>

            {
                this.state.user && (
                    <Button
                    style={styles.searchButton}
                    block
                    disabled={this.state.disableSearch}
                    onPress={ ()=>{ this.getPokemons() }}>
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
            <Icon name="ios-person-outline"/>
            <Input
            keyboardType='email-address'
            autoCapitalize='none'
            returnKeyType='default'
            placeholder={strings.email}
            autoFocus={true}
            defaultValue={this.state.username}
            onChangeText={(username) => this.setState({username})} />
            </InputGroup>
            <InputGroup>
            <Icon name="ios-unlock-outline" style={styles.loginIcon} />
            <Input
            placeholder={strings.password}
            secureTextEntry={true}
            defaultValue={this.state.password}
            onChangeText={(password) => this.setState({password})}/>
            </InputGroup>

            <View>
            <View style={styles.radioContainer}>
            <RadioButton
            innerColor='#dd4b39'
            outerColor='#dd4b39'
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
            innerColor='#424242'
            outerColor='#424242'
            animation={'bounceIn'}
            isSelected={ this.state.provider === 'ptc'}
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

            <Button
            style={styles.logInButton}
            block
            onPress={() => { this.logIn() }}> Go! </Button>
            </Modal>

            {
                this.state.user && (
                    <Button danger style={styles.logout} onPress={() => this.logOut() }>
                    <Icon name="ios-close" style={styles.logoutIcon} />
                    </Button>
                )
            }

            <Spinner style={styles.spinner} isVisible={this.state.loading} type={'Pulse'} color={'#424242'} size={75}/>
            </View>
        );
    }
}
