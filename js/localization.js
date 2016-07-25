import LocalizedStrings from 'react-native-localization';

export default new LocalizedStrings({
    en: {
        messages:{
            onInit: [
                'Please connect with your Pokemon Account. Your info its safe, we do not store anything.\n\n',
                'If you want, you can use a test account but you would not see the Pokemon that are visible to only you.'
            ].join('')
        },
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
        messages:{
            onInit: [
                'Por favor conectate con tu cuenta de Pokemon. Tu información está segura, nosotros no la guardamos.\n\n',
                'Si lo prefieres puedes usar una cuenta de prueba pero po podrás ver los Pokemon que solo puedes ver tú'
            ]
        },
        logIn: 'Iniciar sesión',
        logInSubTitle: 'Con tu cuenta de google o pokemon trainer',
        email: 'correo/usuario',
        password: 'contraseña',
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
