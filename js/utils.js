export function manageResponse(responseType, firm){
    return function(response) {
        console.log(response, firm);
        if(response.ok){
            return response[responseType]();
        }
        else{
            return Promise.reject(response);
        }
    };
}
