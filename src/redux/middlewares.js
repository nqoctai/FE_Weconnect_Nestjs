import { logout } from "@redux/slices/authSlice";
import { persistor } from "@redux/store";
export const logOutMiddleware = () => {
    return (next) => {
        return (action) => {
            if (action.type === logout.type) {
                persistor.purge();
            }
            return next(action);
        }
    }
}