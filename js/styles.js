import React, {
    StyleSheet
} from 'react-native';

export default StyleSheet.create({
    page: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#404A46',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 50
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    googleModal: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        bottom: 0
    },
    logIn: {
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 300,
    },
    radioText: {
        marginLeft: 10
    },
    logInTitle: {
        marginTop: 8,
        fontSize: 20
    },
    logInSubTitle: {
        fontSize: 10,
        marginTop: -5
    },
    googleLogInButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 0,
        backgroundColor: 'white',
        borderColor: '#d34836',
        borderWidth: 1
    },
    googleLogInButtonText: {
        color: '#d34836'
    },
    ptcLogInButton: {
        borderRadius: 0,
        backgroundColor: '#313131'
    },
    loginInput: {
        color: 'gray'
    },
    loginIcons: {
        color: 'blue'
    },
    logout: {
        opacity: 0.7,
        position: 'absolute',
        top: 20,
        left: 7,
        width: 35,
        height: 35,
        borderRadius: 50
    },
    centerAd: {
        position: 'absolute',
        bottom: 55,
        right: 5,
        width: 35,
        height: 35,
        borderRadius: 50
    },
    center: {
        position: 'absolute',
        bottom: 8,
        right: 5,
        width: 35,
        height: 35,
        borderRadius: 50
    },
    cleanAd: {
        position: 'absolute',
        bottom: 96,
        right: 5,
        width: 35,
        height: 35,
        borderRadius: 50
    },
    clean: {
        position: 'absolute',
        bottom: 49,
        right: 5,
        width: 35,
        height: 35,
        borderRadius: 50
    },
    logoutIcon: {
        backgroundColor: 'rgba(0,0,0,0)'
    },
    actionIcon: {
        backgroundColor: 'rgba(0,0,0,0)'
    },
    searchButton: {
        borderRadius: 0,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
    ad: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
    }
});
