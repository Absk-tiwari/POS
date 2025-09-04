import { useSelector } from "react-redux"

export const usePermissions = () => {
    const { permissions, isAdmin } = useSelector(state=>state.auth)
    
    const hasPermission = ( perm, type=false ) => {
        if(isAdmin)
        {
            return true;
        }
        if(type) {
            return permissions[perm]!==undefined && permissions[perm][type];
        }
        return permissions[perm]!==undefined;
    } 

    return { hasPermission }
}