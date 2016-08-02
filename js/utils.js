export function manageResponse(responseType, firm){
    return function(response) {
        if(response.ok){
            return response[responseType]();
        }
        else{
            return Promise.reject(response);
        }
    };
}

export function getParameter(name, url){
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results){
        return null;
    }
    if (!results[2]){
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export let pokeTest = [
    {
        question: '🌷 🌸 🌱 \n 🐸 🐊 🐉',
        answer: 'Venusaur',
    },
    {
        question: '🔥 🌋 🎇\n🐸 🐊 🐉',
        answer: 'Charizard'
    },
    {
        question: '🌊 💧 💦\n 🐢 🐢 🐢',
        answer: 'Blastoise'
    },
    {
        question: '🔪 🐝 🔪',
        answer: 'Beedrill'
    },
    {
        question: '🏭 👹 💨 🏭',
        answer: 'Koffing'
    },
    {
        question: '⚡️ 🐭 ⚡️',
        answer: 'Pikachu'
    },
    {
        question: '🎧 🍥 🎹',
        answer: 'Jigglypuff'
    },
    {
        question: '🍄 🐜 🍄',
        answer: 'Parras'
    },
    {
        question: '🐵 🐵 🐵 🐵 💩 🐵',
        answer: 'Ditto'
    },
    {
        question: '🔥 🐈 🔥',
        answer: 'Growlithe'
    },
    {
        question: '🔥 🐅 🔥',
        answer: 'Arcanine'
    },
    {
        question: '💪🏿 🌚',
        answer: 'Geodude'
    },
    {
        question: '🐷 🐚',
        answer: 'Slowbro'
    },
    {
        question: '  💀\n🔨 🐭',
        answer: 'Cubone'
    },
    {
        question: '🐷\n🍳',
        answer: 'Chansey'
    },
    {
        question: '👀\n⭕️\n👗',
        answer: 'Jynx'
    }
];
