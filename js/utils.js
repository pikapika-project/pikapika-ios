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
