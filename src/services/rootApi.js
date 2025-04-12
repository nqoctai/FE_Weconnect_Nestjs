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
    if(result?.error?.status === 401 && result?.error?.data?.message === "Token has expired or is invalid") {
        const refreshResult = await baseQuery({url: '/auth/refresh', credentials: "include"}, api, extraOptions)
        const newAccessToken = refreshResult?.data?.data?.accessToken;
        if(newAccessToken){
            api.dispatch(login({accessToken: newAccessToken}));
            result = await baseQuery(args, api, extraOptions)
        }else {
            api.dispatch(logout())
            window.location.href = '/login'
        }
       console.log("res refresh", refreshResult)

    }

    return result;
}

export const rootApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['POSTS', 'USERS'],
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
                providesTags: [{type: 'POSTS', id: 'LIST'}]
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
      useGetPendingFriendRequestsQuery
    } = rootApi;
      

