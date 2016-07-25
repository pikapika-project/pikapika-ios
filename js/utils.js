export function manageResponse(responseType){
    return function(response) {
        if(response.ok){
            return response[responseType]();
        }
        else{
            return Promise.reject(response);
        }
    };
}
