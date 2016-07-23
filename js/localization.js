import LocalizedStrings from 'react-native-localization';

export default new LocalizedStrings({
    en: {
        logIn: 'Login',
        logInSubTitle: 'With your google or pokemon trainer account',
        email: 'User/Email',
        password: 'Password',
        timeleft: 'Timeleft: {0}m',
        errors:{
            default: 'Error',
            login: 'Please verify your access',
            server: 'We have inconvenients with our servers, please try latter',
            unauth: 'Try login again'
        }
    },
    es: {
        logIn: 'Iniciar sesión',
        logInSubTitle: 'Con tu cuenta de google o pokemon trainer',
        email: 'Usuario/Correo',
        password: 'Contraseña',
        timeleft: 'Tiempo restante: {0}m',
        error: 'Error',
        errors:{
            default: 'Error',
            login: 'Por favor verifica tus accesos',
            server: 'Estamos teniendo inconvenientes con nuestros servidores, por favor intenta más tarde',
            unauth: 'Si sigues presentando estos problemas intenta iniciar tu sesión de nuevo'
        }
    }
});
