import { logout as logOutAction } from "@redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import { useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetPostsQuery } from "@services/rootApi";
import { throttle } from "lodash";

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

export const useLazyLoadPost = () => {
    const [page, setPage] = useState(1);
    const size = 10;
    const [posts, setPosts] = useState([]);


    const [hasMore, setHasMore] = useState(true);
    
    const { data, isSuccess, isFetching } = useGetPostsQuery({
        page: page,
        size,
    });
    
    const previousDataRef = useRef();
    console.log(data?.data?.result, "data");

    useEffect(() => {
        if (
          isSuccess &&
          data?.data?.result &&
          previousDataRef.current !== data.data.result
        ) {
          if (!data.data.result.length) {
            setHasMore(false);
            return;
          }
          previousDataRef.current = data.data.result;
          console.log("data rs", data.data.result);
          setPosts((prevPosts) => {
            return [...prevPosts, ...data.data.result];
          });
        }
    }, [isSuccess, data]);
    const loadMore = useCallback(() => {
        setPage((page) => page + 1);
    }, []);

    useInfiniteScroll({hasMore, loadMore, isFetching,})

   

    return { isFetching, posts}

}


export const useInfiniteScroll = ({hasMore, loadMore, isFetching, threshold = 50, throttleMs = 500}) => {
    const handleScroll = useMemo(() => {
        return throttle(() => {
          if (!hasMore) return;
          const scrollTop = document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;
    
          if (clientHeight + scrollTop + threshold >= scrollHeight && !isFetching) {
            loadMore();
          }
        }, throttleMs);
      }, [hasMore, isFetching, loadMore]);
    
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
    
        return () => {
          window.removeEventListener("scroll", handleScroll);
          handleScroll.cancel();
        };
    }, [handleScroll]);
}