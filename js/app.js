import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, Dimensions, View, AsyncStorage, AlertIOS, WebView } from 'react-native';
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
import { getParameter } from './utils';
import { pokemonImages } from './images';
import { pokemonSounds } from './sounds';

let { width, height } = Dimensions.get('window');

export class Pikapika extends Component {
    watchID = (null: ?number);
    googleAuthSource = 'https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&redirect_uri=http://127.0.0.1:9004&response_type=code&client_id=848232511240-73ri3t7plvk96pj4f85uj8otdat2alem.apps.googleusercontent.com';

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
                this.showInfo(strings.messages.onInit);
            }
        })
        .done();
    }

    logInWithGoogle(code){
        if(this.position){
            this.loading(true);

            TrainerService.logInWithGoogleOAuth2(code, this.position)
            .then((response) => this.onLogIn(response))
            .catch((error) => this.onLogInFailure(error));
        }
        else {
            this.showError(strings.errors.position);
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

    onLogIn(user) {
        this.loading(false);

        if(user) {
            this.setState({user});

            this.refs.logIn.close();

            AsyncStorage.setItem('user', JSON.stringify(user));

            this.getPokemons();
        }
        else {
            this.showError(strings.errors.login);
            this.refs.logIn.open();
        }
    }

    onLogInFailure(error){
        this.loading(false);

        this.showError(strings.errors.server);

        this.refs.logIn.open();
    }

    getPokemons() {
        this.loading(true);

        let disableSearch = true;
        this.setState({disableSearch});

        this.searchTimer();

        PokemonService
        .find(this.position.coords, this.state.user['access_token'])
        .then((data) => {
            this.loading(false);

            if(data){
                let pokemonList = [];
                this.setState({pokemonList});

                pokemonList = data;
                this.setState({pokemonList});
            }
            else{
                this.logIn();
            }
        })
        .catch((error) => {
            this.loading(false);
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

    showInfo(message, duration){
        let toast = Toast.show(message, {
            duration: duration || Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });
    }

    watchGoogleAuth(route) {
        if(route.url.startsWith('http://127.0.0.1') && !getParameter('error', route.url)){
            this.refs.googleAuth.close();

            this.logInWithGoogle(
                getParameter('code', route.url)
            );

            return false;
        }
        else if(route.url.startsWith('http://127.0.0.1') && getParameter('error', route.url)){
            this.refs.googleAuth.close();
        }
        return true;
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
                            moment.duration(Math.abs(pokemon.timeleft))
                        ).format('mm:ss')
                    )
                }
                image={pokemonImages[pokemon.number]}
                coordinate={{
                    latitude: pokemon.position.lat,
                    longitude: pokemon.position.lng
                }}
                onSelect={ () => {
                    pokemonSounds[pokemon.number].setVolume(0.7);
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
            editable={false}
            keyboardType='email-address'
            autoCapitalize='none'
            returnKeyType='default'
            placeholder={strings.email}
            defaultValue={this.state.username}
            onChangeText={(username) => this.setState({username})} />
            </InputGroup>
            <InputGroup>
            <Icon name="ios-unlock-outline" style={styles.loginIcon} />
            <Input
            editable={false}
            placeholder={strings.password}
            secureTextEntry={true}
            defaultValue={this.state.password}
            onChangeText={(password) => this.setState({password})}/>
            </InputGroup>

            <Button
            style={styles.ptcLogInButton}
            block
            onPress={() => { this.showError(strings.messages.pokemonTrainer); }}> Pokemon Trainer Club
            </Button>

            <Button
            style={styles.googleLogInButton}
            textStyle={{color: '#d34836'}}
            block
            danger
            onPress={() => { this.refs.googleAuth.open(); }}>
            <Icon style={{color: '#d34836'}} name="logo-google"/> Sign In
            </Button>

            </Modal>

            <Modal style={styles.googleModal} ref={"googleAuth"} swipeToClose={true} backdropPressToClose={true} position={'center'}>
            <WebView
            ref={'googleAuthWebView'}
            source={{uri: this.googleAuthSource}}
            onShouldStartLoadWithRequest={(route) => this.watchGoogleAuth(route)}
            renderError={() => { return (<Text></Text>); }}
            >

            </WebView>
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
