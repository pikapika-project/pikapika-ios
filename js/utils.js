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
