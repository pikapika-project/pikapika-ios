import React, { Component } from 'react';

import {
    AppRegistry,
    StyleSheet,
    Text,
    Dimensions,
    View
} from 'react-native';

import styles from './styles';

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
            initialRegion: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            initialPosition: null,
            lastPosition: null,
            markers: [],
            route: [],
            polygons: [],
            loading: false
        };
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                var initialPosition = position;
                initialPosition.latitudeDelta = LATITUDE_DELTA;
                initialPosition.longitudeDelta = LONGITUDE_DELTA;

                this.setState({initialPosition});
            },
            (error) => { alert(error.message) },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );

        this.watchID = navigator.geolocation.watchPosition((position) => {
            var lastPosition = position;
            var markers = this.state.markers;
            var route = this.state.route;

            position.coords.latlng = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            markers.push(position.coords);

            //route.push(position.coords);

            this.setState({lastPosition});
            this.setState({markers});
            //this.setState({route});
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }

    render() {
        return (
            <View style={styles.page}>
            <MapView.Animated
            initialRegion={this.state.initialRegion}
            style={styles.map}
            >
            </MapView.Animated>
            </View>
        );
    }
}
