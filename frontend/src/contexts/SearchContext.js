import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useGetPosProductsQuery } from "../features/centerSlice";
import { useDispatch, useSelector } from "react-redux";
import echo from './../echo';
import axios from "axios";
import toast from "react-hot-toast";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {

    const dispatch = useDispatch();
    const [ searchQuery, setSearchQuery ] = useState("");
    const { theme, openingCash:stateCash, appKey } = useSelector(s => s.auth);
    const [ openingCash ] = useState(stateCash);
    const [ focused, setFocused ] = useState(false);
    const token = localStorage.getItem('pos-token');
    const { refetch } = useGetPosProductsQuery(token, { skip: !token });

    // Here we go when to sync products
    useEffect(() => {
        echo.channel("sync").listen(".SyncProducts", (e) => {
            if(appKey && appKey === e.client) {
                axios.get('/products/sync/'+ appKey).then(({data}) => {
                    if(data.status) dispatch({ type:"MAKE_A_SYNC" });
                })
            } else {
                toast("Maybe products are added!");
            }
        });
    }, []);

    const lastActive = openingCash.lastSession ?? 0;
    
    const [ sessions, setSession ] = useState([]);
    const [ activeSession, setActiveSession ] = useState( lastActive ? lastActive : sessions[sessions.length-1]);
    
    const [ displayImage, setImageDisplay ] = useState(JSON.parse(localStorage.getItem('img_disp')??'true'))

    const handleImageDisplay = useCallback(
        display => {
            localStorage.setItem('img_disp', display );
            refetch()
            setImageDisplay(display);
        },
      [refetch],
    )

    useEffect(()=> {
        if(theme==='retro') {
            handleImageDisplay(false)
        }
    },[ theme, handleImageDisplay ])

    const [ sale, setType ] = useState(JSON.parse(localStorage.getItem('_is_sale')??'true'));
    const [ quick, setQuick ] = useState(false);

    return (
        <SearchContext.Provider 
        value={{
            searchQuery, 
            setSearchQuery, 
            sessions,
            setSession,
            activeSession,
            setActiveSession,
            displayImage,
            handleImageDisplay,
            sale,
            setType,
            setFocused,
            focused,
            quick,
            setQuick
        }}>
        {children}
        </SearchContext.Provider>
    );
};

// Custom hook for using the context
export const useSearch = () => useContext(SearchContext);