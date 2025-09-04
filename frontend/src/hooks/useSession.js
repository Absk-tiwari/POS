import axios from "axios";

export const useSessions = async () => {

    return axios.get(`/pos/last-active-session/`,{ headers: {
        'Content-Type' : 'application/json',
        'pos-token': localStorage.getItem('pos-token')
    }})
    
}