const headers = () => {
 
    const token = localStorage.getItem('pos-token');
    if(token){
        return {
            'Content-Type' : 'application/json',
            'pos-token': token
        }
    }else{
        return {
            'Content-Type' : 'application/json'
        }
    }
}

module.exports = headers