const headers = () => {
 
    const token = localStorage.getItem('pos-token');
    if(token){
        return {
            'Content-Type' : 'application/json',
            'pos-token': token,
            "Authorization": localStorage._pos_app_key
        }
    }else{
        return {
            'Content-Type' : 'application/json',
            "Authorization": localStorage._pos_app_key
        }
    }
}

module.exports = headers