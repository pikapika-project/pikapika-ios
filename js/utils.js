export function manageResponse(response) {
    if(response.ok){
        return response.json();
    }
    else{
        return Promise.reject(response);
    }
}
