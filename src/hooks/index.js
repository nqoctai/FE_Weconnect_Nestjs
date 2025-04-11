import { logout as logOutAction } from "@redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import { useMediaQuery, useTheme } from "@mui/material";

export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const logOut = () => {
        dispatch(logOutAction());
        navigate("/login", {replace: true});

    }

    return {logOut}

}



export const useUserInfo = () => {
    return useSelector((state) => state.auth.user)
}

export const useDetectLayout = () => {
    const theme = useTheme();
    const isMediumLayout = useMediaQuery(theme.breakpoints.down("md"));

    return {isMediumLayout}
}