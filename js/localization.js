import LocalizedStrings from 'react-native-localization';

export default new LocalizedStrings({
    en: {
        messages:{
            onInit: [
                'Please connect with your Pokemon Account. Your info its safe, we do not store anything.\n\n',
                'If you want, you can use a test account but you would not see the Pokemon that are visible to only you.'
            ].join(''),
            pokemonTrainer: 'Pokemon Trainer Club its unavailable now, please wait for the next version'
        },
        logIn: 'Login',
        logInSubTitle: 'With your Google or Pokemon Trainer Club account',
        email: 'user/email',
        password: 'password',
        timeleft: 'Timeleft: {0}m',
        seen: 'Seen at {0}',
        errors:{
            default: 'Error',
            login: 'Please verify your access',
            server: 'We have inconvenients with our servers, please try latter',
            unauth: 'Try login again',
            position: 'To use PikaPika you need to allow location services'
        }
    },
    es: {
        messages:{
            onInit: [
                'Por favor conectate con tu cuenta de Pokemon. Tu información está segura, nosotros no la guardamos.\n\n',
                'Si lo prefieres puedes usar una cuenta de prueba pero po podrás ver los Pokemon que solo puedes ver tú'
            ].join(''),
            pokemonTrainer: 'Pokemon Trainer Club no está disponible en este momento, por favor espera la próxima versión'
        },
        logIn: 'Iniciar sesión',
        logInSubTitle: 'Con tu cuenta de Google o de Pokemon Trainer Club',
        email: 'correo/usuario',
        password: 'contraseña',
        timeleft: 'Tiempo restante: {0}m',
        seen: 'Visto a las {0}',
        error: 'Error',
        errors:{
            default: 'Error',
            login: 'Por favor verifica tus accesos',
            server: 'Estamos teniendo inconvenientes con nuestros servidores, por favor intenta más tarde',
            unauth: 'Si sigues presentando estos problemas intenta iniciar tu sesión de nuevo',
            position: 'Para usar PikaPika tienes que activar los permisos de ubicación'
        }
    }
});
