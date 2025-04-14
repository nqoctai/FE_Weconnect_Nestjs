import { logout as logOutAction } from "@redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import { useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { rootApi, useGetPostsQuery } from "@services/rootApi";
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
    const dispatch = useDispatch();
    
    // Lấy refreshToken từ Redux store
    const refreshToken = useSelector((state) => state.posts.refreshToken);
    
    // Sử dụng refreshToken như một phần của query key để đảm bảo refetch
    const { data, isSuccess, isFetching } = useGetPostsQuery({
        page: page,
        size,
        refreshToken
    });
    
    // Reset toàn bộ danh sách khi unmount hoặc khi refreshToken thay đổi
    useEffect(() => {
        if (refreshToken > 0) {
            setPosts([]);
            setPage(1);
            setHasMore(true);
        }
        
        return () => {
            setPosts([]);
        };
    }, [refreshToken]);
    
    // Effect xử lý khi data thay đổi
    useEffect(() => {
        if (isSuccess && data?.data?.result) {
            if (page === 1) {
                // Nếu load trang 1, reset danh sách và chỉ hiển thị kết quả mới
                setPosts([...data.data.result]);
                
                // Kiểm tra nếu không còn dữ liệu
                if (!data.data.result.length) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            } else {
                // Nếu load trang tiếp theo, thêm vào danh sách hiện tại
                setPosts(prevPosts => {
                    // Kiểm tra trùng lặp
                    const existingIds = new Set(prevPosts.map(post => post.id));
                    const newPosts = data.data.result.filter(post => !existingIds.has(post.id));
                    
                    return [...prevPosts, ...newPosts];
                });
                
                // Kiểm tra nếu không còn dữ liệu để load thêm
                if (!data.data.result.length) {
                    setHasMore(false);
                }
            }
        }
    }, [isSuccess, data, page]);

    // Function để load thêm posts
    const loadMore = useCallback(() => {
        if (!isFetching && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [isFetching, hasMore]);

    // Function để refresh lại từ đầu
    const refreshPosts = useCallback(() => {
        // Dispatch action để tăng refreshToken trong redux store
        dispatch({ type: 'posts/refreshRequested' });
    }, [dispatch]);

    useInfiniteScroll({hasMore, loadMore, isFetching})

    return { isFetching, posts, refreshPosts }
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


export const useCacheRedux = (friendRequestId) => {
  const dispatch = useDispatch();
  const cacheRedux = () => {
    try {
      dispatch(
        rootApi.util.updateQueryData(
          "getPendingFriendRequests",
          undefined,
          (draft) => {
            if (!draft.data) {
              draft.data = [];
            }
            // Xóa lời mời đã chấp nhận khỏi danh sách
            const index = draft.data.findIndex(
              (req) => req.id === friendRequestId,
            );
            if (index !== -1) {
              draft.data.splice(index, 1);
            }
          },
        ),
      );
      console.log("RTK Query cache updated after accepting friend request");
    } catch (error) {
      console.error("Failed to update RTK Query cache:", error);
    }
  }

  return {cacheRedux}
   
}