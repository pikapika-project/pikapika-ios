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
        justifyContent: 'flex-end',
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
    logIn: {
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 300,
    },
    radioContainer: {
        flex: 1,
        flexDirection:'row',
        alignItems:'center',
        marginTop: 10
    },
    radioText: {
        marginLeft: 10
    },
    logInTitle: {
        fontSize: 20
    },
    logInButton: {
        marginBottom: -25,
        borderRadius: 0
    },
    logout: {
        position: 'absolute',
        top: 20,
        right: 7,
        width: 35,
        height: 35,
        opacity: 0.5,
        borderRadius: 50
    },
    logoutIcon:{
        backgroundColor: 'rgba(0,0,0,0)'
    }
});
