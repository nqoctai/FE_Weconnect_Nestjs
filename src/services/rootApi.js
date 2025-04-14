import { login, logout } from '@redux/slices/authSlice';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


const baseQuery = fetchBaseQuery({baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, {getState}) => {
    console.log({store: getState()})
    const token = getState().auth.accessToken;
    if(token) {
        headers.set('Authorization', `Bearer ${token}`)
    }
    return headers;
}, credentials: 'include'})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    if(result?.error?.status === 401) {
        if(result?.error?.data?.message === "Token has expired or is invalid"){
            const refreshResult = await baseQuery({url: '/auth/refresh', credentials: "include"}, api, extraOptions)
            const newAccessToken = refreshResult?.data?.data?.accessToken;
            if(newAccessToken){
                api.dispatch(login({accessToken: newAccessToken}));
                result = await baseQuery(args, api, extraOptions)
            }else {
                api.dispatch(logout())
                window.location.href = '/login'
            }
        }else {
            api.dispatch(logout())
            window.location.href = '/login'
        }

    }

    return result;
}

export const rootApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['POSTS', 'USERS', "PENDING_FRIEND_REQUEST"],
    endpoints: (builder) => {
        return {
            register: builder.mutation({
                query: ({name, email, password, phone}) => ({
                    url: '/auth/register',
                    method: 'POST',
                    body: {name, email, password, phone}
                }),
            }),
            login: builder.mutation({
                query: ({email, password}) => ({
                    url: '/auth/login',
                    method: 'POST',
                    body: {username: email, password}
                }),
            }),
            getAuthUser: builder.query({
                query: () => {
                   return `/auth/profile`;
                },
            }),
            uploadImage: builder.mutation({
                query: (formData) => {
                    return {
                        url: '/files',
                        method: 'POST',
                        body: formData
                    }
                }
            }),
            createPost: builder.mutation({
                query: ({content, image}) => {
                    return {
                        url: '/posts',
                        method: 'POST',
                        body: {content, image}
                    };
                },
                invalidatesTags: ['POSTS'],
            }
            ),
            refreshToken: builder.query({
                query: () => ({
                    url: `/auth/refresh`,
                    credentials: 'include',
                }),
            }),
            getPosts: builder.query({
                query: ({page, size} = {}) => ({
                    url: `/posts?sort=createdAt,desc`,
                    params: {page, size}
                }),
                providesTags: [ {type: 'POSTS', id: 'LIST' }],
            }),
            searchUsers: builder.query({
                query: ({page, size, filter}) => {
                    const encodedQuery = encodeURIComponent(filter.trim())
                    return {
                        url: `/users?filter=name~'${encodedQuery}'`,
                        params: {page, size}
                    }
                },
                providesTags:(result) => result ? [...result.data.result.map(({id}) => ({type: 'USERS', id:id})), {type: "USERS", id: 'LIST'}] : [{type:'USERS', id: 'LIST'}],
            }),
            sendFriendRequest: builder.mutation({
                query: ({userId}) => ({
                    url: `/friends/request`,
                    method: 'POST',
                    body: {
                        receiverId: userId
                    }
                }),
                invalidatesTags: [{type: 'USERS', id: 'LIST'}],
            }),
            getPendingFriendRequests: builder.query({
                query: () => ({
                    url: `/friends/requests`,
                }),
                providesTags:(result) => result ? [...result.data.map(({id}) => ({type: 'PENDING_FRIEND_REQUEST', id:id})), {type: "PENDING_FRIEND_REQUEST", id: 'LIST'}] : [{type:'PENDING_FRIEND_REQUEST', id: 'LIST'}],
            }),
            acceptFriendRequest: builder.mutation({
                query: ({friendRequestId}) => ({
                    url: `/friends/accept/${friendRequestId}`,
                    method: 'PUT',
                }),
                // Thêm optimistic updates để xóa request khỏi danh sách ngay lập tức
                onQueryStarted: async ({friendRequestId}, {dispatch, queryFulfilled}) => {
                    // Cập nhật cache ngay lập tức cho pending friend requests
                    const patchResult = dispatch(
                        rootApi.util.updateQueryData('getPendingFriendRequests', undefined, draft => {
                            // Kiểm tra cả hai cấu trúc dữ liệu có thể có
                            if (draft?.data) {
                                const index = draft.data.findIndex(req => req.id === friendRequestId);
                                if (index !== -1) {
                                    draft.data.splice(index, 1);
                                }
                            } else if (Array.isArray(draft)) {
                                const index = draft.findIndex(req => req.id === friendRequestId);
                                if (index !== -1) {
                                    draft.splice(index, 1);
                                }
                            }
                        })
                    );
                    
                    try {
                        // Đợi API hoàn tất
                        await queryFulfilled;
                        // Force refetch cả hai endpoint
                        dispatch(rootApi.endpoints.getPendingFriendRequests.initiate(undefined, {forceRefetch: true}));
                        // Force refetch searchUsers
                        dispatch(rootApi.util.invalidateTags([{type: 'USERS', id: 'LIST'}]));
                    } catch {
                        // Nếu API thất bại, hoàn tác thay đổi
                        patchResult.undo();
                    }
                },
                // Invalidate cả hai loại tag
                invalidatesTags: ['PENDING_FRIEND_REQUEST', {type: 'USERS', id: 'LIST'}],
            }),
            cancelFriendRequest: builder.mutation({
                query: ({friendRequestId}) => ({
                    url: `/friends/reject/${friendRequestId}`,
                    method: 'PUT',
                }),
                // Thêm optimistic updates để xóa request khỏi danh sách ngay lập tức
                onQueryStarted: async ({friendRequestId}, {dispatch, queryFulfilled}) => {
                    // Cập nhật cache ngay lập tức
                    const patchResult = dispatch(
                        rootApi.util.updateQueryData('getPendingFriendRequests', undefined, draft => {
                            // Kiểm tra cả hai cấu trúc dữ liệu có thể có
                            if (draft?.data) {
                                const index = draft.data.findIndex(req => req.id === friendRequestId);
                                if (index !== -1) {
                                    draft.data.splice(index, 1);
                                }
                            } else if (Array.isArray(draft)) {
                                const index = draft.findIndex(req => req.id === friendRequestId);
                                if (index !== -1) {
                                    draft.splice(index, 1);
                                }
                            }
                        })
                    );
                    
                    try {
                        // Đợi API hoàn tất
                        await queryFulfilled;
                        // Force refetch pending friend requests
                        dispatch(rootApi.endpoints.getPendingFriendRequests.initiate(undefined, {forceRefetch: true}));
                        // Force refetch search users với mọi tham số đã cache
                        dispatch(rootApi.util.invalidateTags([{type: 'USERS', id: 'LIST'}]));
                    } catch {
                        // Nếu API thất bại, hoàn tác thay đổi
                        patchResult.undo();
                    }
                },
                // Invalidate cả hai loại tag
                invalidatesTags: ['PENDING_FRIEND_REQUEST', {type: 'USERS', id: 'LIST'}],
            }),
            getNotifications: builder.query({
                query: () => ({
                    url: `/notifications`,
                }),
                providesTags: (result) => {
                    // Check if result exists and has data property
                    if (!result || !result.data) return [{ type: 'NOTIFICATIONS', id: 'LIST' }];
                    
                    // Check if data is an array
                    const dataArray = Array.isArray(result.data) 
                        ? result.data 
                        : (result.data.result || result.data.items || []);
                        
                    return [
                        ...dataArray.map(item => ({ type: 'NOTIFICATIONS', id: item.id || 'unknown' })),
                        { type: 'NOTIFICATIONS', id: 'LIST' }
                    ];
                }
            }),
            likePosts: builder.mutation({
                query: (postId) => ({
                    url: `/posts/${+postId}/like`,
                    method: 'POST',
                }),
                
                invalidatesTags: ['POSTS', {type: 'USERS', id: 'LIST'}],
            }),
            unLikePosts: builder.mutation({
                query: (postId) => ({
                    url: `/posts/${+postId}/unlike`,
                    method: 'DELETE',
                }),
                
                invalidatesTags: ['POSTS', {type: 'USERS', id: 'LIST'}],
            }),

        }
    }

})

export const {useRegisterMutation,
     useLoginMutation, 
     useGetAuthUserQuery, 
     useCreatePostMutation, 
     useUploadImageMutation, 
     useRefreshTokenQuery, useGetPostsQuery, 
     useSearchUsersQuery,
      useSendFriendRequestMutation,
      useGetPendingFriendRequestsQuery,
      useAcceptFriendRequestMutation,
      useCancelFriendRequestMutation,
      useGetNotificationsQuery,
      useLikePostsMutation,
      useUnLikePostsMutation,
    } = rootApi;


