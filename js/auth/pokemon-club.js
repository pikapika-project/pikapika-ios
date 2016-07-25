/* jshint ignore:start */
import querystring from 'querystring';
import { manageResponse } from './../';

let login_url = 'https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize';
let login_oauth = 'https://sso.pokemon.com/sso/oauth2.0/accessToken';


export class PokemonClubAuth{

    service(user, pass){
        return fetch(login_url, {
            method: 'GET',
            headers:{
                'User-Agent': 'niantic'
            }
        })
        .then(manageResponse('json', 'PokemonClubService'))
        //.then(response => this.logIn(user, pass, response))
        .catch((error) => {
            error.text().then((data) => {
                console.log(match('CAS is Unavailable'));
            })
        });
    }

    logIn(user, pass, data){
        console.log(querystring.stringify({
            lt: data.lt,
            execution: data.execution,
            _eventId: 'submit',
            username: user,
            password: pass
        }));
        return fetch(login_url, {
            method: 'POST',
            headers: {
                'User-Agent': 'niantic',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: querystring.stringify({
                lt: data.lt,
                execution: data.execution,
                _eventId: 'submit',
                username: user,
                password: pass
            })
        })
        .then(manageResponse('json', 'PokemonLogIn'));
    }

    oAuth()
}
/* jshint ignore:end */
