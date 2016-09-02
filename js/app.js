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
import FCM from 'react-native-fcm';
import Analytics from 'react-native-firebase-analytics';
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
    clickNumber = 4;
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
                    this.clickNumber = Number(data.ads['click_number'] || 4);
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

        FCM.requestPermissions();

        FCM.getFCMToken().then(token => {
            this.token = token;
        });

        this.notificationUnsubscribe = FCM.on('notification', (notif) => {
            if(notif.aps.alert.title){
                this.showInfo(`${notif.aps.alert.title}\n\n${notif.aps.alert.body}`);
            }
            else {
                this.showInfo(`${notif.aps.alert.body || notif.aps.alert}`);
            }
        });

        Analytics.setEnabled(true);
    }

    componentWillMount() {
        MoPubInterstitial.initialize(INTERSTITIAL_UNIT_ID);
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
        if(this.state.pokemonList && this.state.pokemonList.length > 0) {
            const pokemonList = [];
            this.setState({pokemonList});
            this.getSharedPokemons();
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

    center() {
        if (this.position) {
            this.position.coords.longitudeDelta = 0.005;
            this.position.coords.latitudeDelta = 0.005;
            this.refs.map.animateToRegion(this.position.coords, 500)
        }
    }

    onChangeRegion(region) {
        this.region = region;
        region.neLat = region.latitude + (region.latitudeDelta/2);
        region.neLng = region.longitude + (region.longitudeDelta/2);
        region.swLat = region.latitude - (region.latitudeDelta/2);
        region.swLng = region.longitude - (region.longitudeDelta/2);

        this.getSharedPokemons();
    }

    getRadius(region) {
        const xDistance = Math.round((region.latitudeDelta * METERS_PER_DEGREE)/2);
        const yDistance = Math.round((region.longitudeDelta * (METERS_PER_DEGREE * Math.cos(region.latitude * Math.PI / 180)))/2);

        return xDistance > yDistance ? xDistance : yDistance;
    }

    onClick() {
        this.clicks++;
        if(this.clicks >= clickNumber){
             MoPubInterstitial.showWhenReady();
            this.clicks = 0;
        }
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
        MoPubInterstitial.removeAllListeners('onFailed');
        this.refreshUnsubscribe();
        this.notificationUnsubscribe();
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

            <View style={styles.ad}>
            <MoPubBanner
            adUnitId={BANNERL_UNIT_ID}
            autoRefresh={true}
            onLoaded={() => this.setState({ad: true}) }
            />
            </View>

            <Button transparent style={this.state.ad ? styles.centerAd : styles.center} onPress={() => this.center() }>
            <Icon name="ios-locate-outline" style={styles.actionIcon} />
            </Button>
            <Button transparent style={this.state.ad ? styles.cleanAd : styles.clean} onPress={() => this.cleanPokemons() }>
            <Icon name="ios-brush" style={styles.actionIcon} />
            </Button>

            </View>
        );
    }
}
