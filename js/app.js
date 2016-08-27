import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, Dimensions, View, AsyncStorage, AlertIOS, WebView } from 'react-native';
import { Container, Button, List, ListItem, InputGroup, Input, Icon, Content, Spinner as NBSpinner } from 'native-base';
import { MoPubBanner, MoPubInterstitial } from 'react-native-mopub';
import MapView from 'react-native-maps';
import Modal from 'react-native-modalbox';
import Sound from 'react-native-sound';
import TimerMixin from 'react-timer-mixin';
import Toast from 'react-native-root-toast';
import Spinner from 'react-native-spinkit';
import moment from 'moment';
import _ from 'underscore';

import styles from './styles';
import strings from './localization';
import { PokemonService, TrainerService, SystemService } from './services';
import { getParameter, pokeTest } from './utils';
import { pokemonImages, pokemonFilterImages } from './images';
import { pokemonSounds } from './sounds';

const { width, height }     = Dimensions.get('window');
const TIMER                 = 10;
const METERS_PER_DEGREE     = 111000;
const BANNERL_UNIT_ID       = 'b9fb697840c240ee90aa5cefb00e1c9c';
const INTERSTITIAL_UNIT_ID  = '2e28f9a166a444f4b028123ed0486696';

export class Pikapika extends Component {
    watchID = (null: ?number);
    googleAuthSource = 'https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&redirect_uri=http://127.0.0.1:9004&response_type=code&client_id=848232511240-73ri3t7plvk96pj4f85uj8otdat2alem.apps.googleusercontent.com';
    reloadNumber = 4;
    clicks = 0;
    region;
    pause;

    constructor(props) {
        super(props);

        this.state = {
            lastPosition: null,
            loading: false,
            pokemonList: [],
            username: null,
            password: null,
            provider: 'google',
            user: null,
            disableSearch: false,
            timeToSearch: '-1',
            waitIcon: 'ios-time-outline',
            ad: false
        };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.position = position;
                SystemService.config().then(function(data){
                    this.reloadNumber = Number(data.ads['reload_number']);
                });
            },
            (error) => {
                this.showError(strings.errors.position);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );

        this.watchID = navigator.geolocation.watchPosition((position) => {
            this.position = position;
        });
    }

    componentWillMount() {
        MoPubInterstitial.initialize(INTERSTITIAL_UNIT_ID);
    }

    checkLogin() {
        AsyncStorage.getItem('user')
        .then((user) => {
            if(user) {
                user = JSON.parse(user);

                this.verifyToken(user)
                .then((user) => {
                    this.setState({user});
                    this.getSharedPokemons();
                })
                .catch((error)=>{
                    this.logOut();
                    this.showInfo(strings.messages.onInit);
                });
            }
            else{
                this.logOut();
                this.showInfo(strings.messages.onInit);
            }
        })
        .done();
    }

    logInWithGoogle(code) {
        this.loading(true);

        TrainerService.logInWithGoogleOAuth2(code)
        .then((response) => {
            this.onLogIn(response);
            this.getPokemons();
        })
        .catch((error) => {
            this.onLogInFailure(error);
            this.showError(strings.errors.login);
        });

    }

    logOut() {
        this.loading(false);

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
        this.getSharedPokemons();

        if(user) {
            this.setState({user});

            this.refs.logIn.close();

            AsyncStorage.setItem('user', JSON.stringify(user));
        }
        else {
            this.showError(strings.errors.login);
            this.refs.logIn.open();
        }
    }

    onLogInFailure(error) {
        this.loading(false);
        this.refs.logIn.open();
    }

    getPokemons() {
        if(this.position) {
            this.verifyToken(this.state.user)
            .then(()=> {

                let disableSearch = true;
                this.setState({disableSearch});

                return PokemonService.find(this.position.coords, this.state.user.accessToken);
            })
            .then((data) => {

                if(data) {
                    this.mergePokemons(data);
                }
                else{
                    this.showError(strings.errors.service);
                }

                this.searchTimer();
            })
            .catch((error) => {
                // if(false && error && (error.status === 408 || error.status === 504)) {
                if(false) {
                    this.loading(true);

                    TrainerService.refreshTokenGoogle(this.state.user.refreshToken)
                    .then((response)=> {
                        this.loading(false);

                        this.onLogIn(response);
                        this.getPokemons();
                    })
                    .catch((error)=> {
                        this.loading(false);

                        this.showError(strings.errors.login);
                        this.logOut();
                    });
                }
                else if(error && error.status === 429) {
                    this.showError(strings.errors.tooManyRequests);
                }
                else {
                    //this.showError(strings.errors.tooManyRequests);
                    this.showError(strings.errors.service);
                }

                this.searchTimer();
            });
        }
        else {
            this.showError(strings.errors.position);
        }
    }

    getSharedPokemons(){
        if(this.pause){
            TimerMixin.clearTimeout(this.pause);
        }

        this.pause = TimerMixin.setTimeout(() => {
            this._getSharedPokemons();
        }, 1000);
    }

    _getSharedPokemons() {
        PokemonService.get(this.region, this.getRadius(this.region))
        .then((data) => {
            this.mergePokemons(data, true);
        });

        if(this.sharedTimer){
            TimerMixin.clearTimeout(this.sharedTimer);
        }

        this.sharedTimer = TimerMixin.setTimeout(() => {
            this.getSharedPokemons();
        }, 10000);
    }

    mergePokemons(data, isShared) {
        let _pokemonList;
        let pokemonList = [];

        _pokemonList = this.state.pokemonList;

        data.forEach((pokemon, key) => {
            if(!_.findWhere(_pokemonList, {id: pokemon.id})) {
                pokemon.isShared = isShared;
                _pokemonList.push(pokemon);
            }
        });

        _pokemonList.forEach((pokemon, key) => {
            pokemon.timeleft = new Date(pokemon.expireAt) - new Date();
            if(pokemon.timeleft <= 0){
                _pokemonList.splice(key, 1);
            }
        });

        this.setState({pokemonList});
        pokemonList = _pokemonList;

        this.setState({pokemonList});
    }

    cleanPokemons() {
        const pokemonList = [];
        this.setState({pokemonList});

        this.getSharedPokemons();
    }

    verifyToken(user) {
        return new Promise((resolve, reject) => {
            if(!this.expired(user)) {
                resolve(user);
            }
            else {
                if(user.refreshToken) {
                    this.loading(true);

                    TrainerService.refreshTokenGoogle(user.refreshToken, this.position)
                    .then((response) => {
                        this.loading(false);

                        this.onLogIn(response);

                        resolve(response);
                    })
                    .catch((error) => {
                        this.onLogInFailure();
                        this.logOut();
                        reject('Cannot update the token');
                    });
                }
                else{
                    this.logOut();
                }
            }
        });
    }

    expired(user) {
        if(user && user.expireAt) {
            return new Date().getTime() > user.expireAt;
        }
        return true;
    }

    searchTimer() {
        if (this.state.timeToSearch === '-1') {
            let timeToSearch = String(TIMER);
            this.setState({timeToSearch});

            this.searchTimer();
        }
        else if(this.state.timeToSearch === '0') {
            let timeToSearch = '-1';
            let disableSearch = false;
            this.setState({disableSearch, timeToSearch});
        }
        else {
            TimerMixin.setTimeout( () => {
                let timeToSearch = String(Number(this.state.timeToSearch) - 1);
                this.setState({timeToSearch});

                this.searchTimer();
            }, 1000);
        }
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

    showInfo(message, duration) {
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
        if(route.url.startsWith('http://127.0.0.1') && !getParameter('error', route.url)) {
            this.refs.googleAuth.close();

            this.logInWithGoogle(
                getParameter('code', route.url)
            );

            return false;
        }
        else if(route.url.startsWith('http://127.0.0.1') && getParameter('error', route.url)) {
            this.refs.googleAuth.close();
        }
        return true;
    }

    onGoogleViewError() {
        this.refs.googleAuth.close();
        return (
            <Text></Text>
        );
    }

    updateWaitIcon() {
        TimerMixin.setTimeout(() => {
            let waitIcon = 'ios-clock-outline';
            let poke = pokeTest[Math.floor(Math.random() * pokeTest.length)];

            this.setState({waitIcon});

            this.showInfo([
                strings.whosThatPokemon,
                '\n\n',
                poke.question
            ].join(''));

            TimerMixin.setTimeout(() => {
                this.showInfo(strings.formatString(
                    strings.its, poke.answer
                ));
            }, 5000)

        }, 13000);
    }

    center() {
        this.position.coords.longitudeDelta = 0.005;
        this.position.coords.latitudeDelta = 0.005;
        this.refs.map.animateToRegion(this.position.coords, 500)
    }

    onChangeRegion(region) {
        this.region = region;
        region.neLat = region.latitude + (region.latitudeDelta/2);
        region.neLng = region.longitude + (region.longitudeDelta/2);
        region.swLat = region.latitude - (region.latitudeDelta/2);
        region.swLng = region.longitude - (region.longitudeDelta/2);

        console.log(region);

        this.getSharedPokemons();
    }

    getRadius(region) {
        const xDistance = Math.round((region.latitudeDelta * METERS_PER_DEGREE)/2);
        const yDistance = Math.round((region.longitudeDelta * (METERS_PER_DEGREE * Math.cos(region.latitude * Math.PI / 180)))/2);

        return xDistance > yDistance ? xDistance : yDistance;
    }

    onClick() {
        this.clicks++;
        if(this.clicks >= reloadNumber){
             MoPubInterstitial.showWhenReady();
            this.clicks = 0;
        }
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
        MoPubInterstitial.removeAllListeners('onFailed');
    }

    render() {
        return (
            <View style={styles.page}>
            <MapView
            ref='map'
            showsUserLocation={true}
            followsUserLocation={true}
            style={styles.map}
            onRegionChangeComplete={(region) => this.onChangeRegion(region)}
            onPress={() => this.onClick()}
            onLongPress={() => this.getSharedPokemons()}
            >
            {this.state.pokemonList.map(pokemon => {
                return pokemon && pokemon.position ? (
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
                ) : '';
            })}
            </MapView>

            {
                this.state.user && (
                    <Button
                    style={styles.searchButton}
                    block
                    disabled={this.state.disableSearch}
                    onPress={ ()=>{ this.getPokemons() }}>
                    {this.state.timeToSearch >= 0 ? this.state.timeToSearch : (
                        <Icon
                        name={this.state.disableSearch ? this.state.waitIcon : 'ios-search'}
                        />
                    )}
                    </Button>
                )
            }

            <View style={styles.ad}>
            <MoPubBanner
            adUnitId={BANNERL_UNIT_ID}
            autoRefresh={true}
            onLoaded={() => this.setState({ad: true}) }
            />
            </View>
            <Modal style={styles.logIn} ref={"logIn"} swipeToClose={true} backdropPressToClose={true} position={'center'}>
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
            renderError={(data) => this.onGoogleViewError(data)}
            >
            </WebView>
            </Modal>

            {
                this.state.user ? (
                    <Button danger style={styles.logout} onPress={() => this.logOut() }>
                    <Icon name="ios-log-out" style={styles.logoutIcon} />
                    </Button>
                ) : false
                // (
                //     <Button danger style={styles.logout} onPress={() => this.logOut() }>
                //     <Icon name="ios-log-in" style={styles.logoutIcon} />
                //     </Button>
                // )
            }

            <Button transparent style={this.state.ad ? styles.centerAd : styles.center} onPress={() => this.center() }>
            <Icon name="ios-locate-outline" style={styles.actionIcon} />
            </Button>
            <Button transparent style={this.state.ad ? styles.cleanAd : styles.clean} onPress={() => this.cleanPokemons() }>
            <Icon name="ios-brush" style={styles.actionIcon} />
            </Button>

            <Spinner style={styles.spinner} isVisible={this.state.loading} type={'Pulse'} color={'#424242'} size={75}/>
            </View>
        );
    }
}
