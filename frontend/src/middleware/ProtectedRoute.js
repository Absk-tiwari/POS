import { usePermissions } from "../hooks/usePermissions"
import NotAllowed from "../components/errorHandling/NotAllowed"

export const ProtectedRoute = ({ permission, children }) => {

    const { hasPermission } = usePermissions()
    
    if(!hasPermission(permission))
    {
        return <NotAllowed />
    }

    return children;

}