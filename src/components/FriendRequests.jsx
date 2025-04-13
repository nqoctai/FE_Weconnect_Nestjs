import { Check, Close } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
} from "@services/rootApi";
import React, { useEffect, useState } from "react";
import websocketService from "@services/websocket/websocketService";
import { useDispatch, useSelector } from "react-redux";
import { rootApi } from "@services/rootApi";
import Button from "@components/Button";
import { useCacheRedux } from "@hooks/index";

const FriendRequestItem = ({ fullName, id, friendRequestId }) => {
  const [acceptFriendRequets, { isLoading: isAccepting, data: acceptData }] =
    useAcceptFriendRequestMutation();
  const [cancelFriendRequets, { isLoading: isCanceling, data: cancelData }] =
    useCancelFriendRequestMutation();

  const handleAccept = () => {
    console.log("Accept friend request", friendRequestId);
    // Thêm logic chấp nhận lời mời kết bạn ở đây
    acceptFriendRequets({ friendRequestId });
    // Tag invalidation sẽ tự động xử lý việc cập nhật cache
  };

  const handleReject = () => {
    console.log("Reject friend request", friendRequestId);
    // Thêm logic từ chối lời mời kết bạn ở đây
    cancelFriendRequets({ friendRequestId });
    // Tag invalidation sẽ tự động xử lý việc cập nhật cache
  };

  return (
    <div className="flex gap-2">
      <Avatar className="!bg-primary-main">
        {fullName?.[0]?.toUpperCase()}
      </Avatar>
      <div>
        <p className="font-bold">{fullName}</p>
        <div className="mt-2 space-x-1">
          <Button
            variant="contained"
            size="small"
            onClick={handleAccept}
            icon={<Check className="mr-1" fontSize="small" />}
            isLoading={isAccepting}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleReject}
            icon={<Close className="mr-1" fontSize="small" />}
            isLoading={isCanceling}
          >
            Cancle
          </Button>
          {/* <Button variant="contained" size="small" onClick={handleAccept}>
            <Check className="mr-1" fontSize="small" /> Accept
          </Button>
          <Button variant="outlined" size="small" onClick={handleReject}>
            <Close className="mr-1" fontSize="small" /> Cancel
          </Button> */}
        </div>
      </div>
    </div>
  );
};

const FriendRequests = () => {
  const dispatch = useDispatch();
  // Sử dụng RTK Query để lấy dữ liệu lời mời kết bạn
  const { data, refetch, isLoading } = useGetPendingFriendRequestsQuery();
  const [friendRequests, setFriendRequests] = useState([]);
  const { user } = useSelector((state) => state.auth);

  // Cập nhật state từ dữ liệu API
  useEffect(() => {
    if (data?.data) {
      setFriendRequests(data.data);
      console.log("Friend requests loaded from API:", data.data.length);
    }
  }, [data]);

  // Hàm xử lý khi nhận được thông báo lời mời kết bạn mới
  const handleNewFriendRequest = (message) => {
    console.log("Received WebSocket message:", message);

    if (!message) {
      console.warn("Received empty WebSocket message");
      return;
    }

    // Kiểm tra loại thông báo
    if (message.type === "NEW_FRIEND_REQUEST") {
      const newFriendRequest = message.content;
      console.log("New friend request received:", newFriendRequest);

      if (!newFriendRequest?.id) {
        console.warn("Invalid friend request data received");
        return;
      }

      // Cập nhật state local
      setFriendRequests((prevRequests) => {
        // Kiểm tra xem lời mời đã tồn tại chưa
        const exists = prevRequests.some(
          (req) => req.id === newFriendRequest.id,
        );
        if (!exists) {
          console.log("Adding new friend request to UI");
          return [newFriendRequest, ...prevRequests];
        }
        return prevRequests;
      });

      // Cập nhật cache RTK Query
      try {
        dispatch(
          rootApi.util.updateQueryData(
            "getPendingFriendRequests",
            undefined,
            (draft) => {
              if (!draft.data) {
                draft.data = [];
              }

              const exists = draft.data.some(
                (req) => req.id === newFriendRequest.id,
              );
              if (!exists) {
                draft.data.unshift(newFriendRequest);
              }
            },
          ),
        );
        console.log("RTK Query cache updated");
      } catch (error) {
        console.error("Failed to update RTK Query cache:", error);
      }

      // Tùy chọn: Tải lại dữ liệu từ API
      // refetch();
    }
  };

  // Thiết lập WebSocket khi component mount
  useEffect(() => {
    // Đảm bảo có user ID
    if (!user?.id) {
      console.log("No user ID available, can't connect to WebSocket");
      return;
    }

    console.log("Setting up WebSocket connection for user:", user.id);

    // Kết nối đến WebSocket server
    websocketService.connect();

    // Đăng ký nhận thông báo debug (để theo dõi)
    const debugTopic = "/topic/debug";
    websocketService._subscribeToTopic(debugTopic, (msg) => {
      console.log("Debug notification:", msg);
      // Nếu thông báo debug là lời mời kết bạn cho user hiện tại, xử lý nó
      if (
        msg?.type === "NEW_FRIEND_REQUEST" &&
        msg?.content?.receiver?.id === user.id
      ) {
        handleNewFriendRequest(msg);
      }
    });

    // Lắng nghe thông báo lời mời kết bạn mới
    websocketService.subscribeFriendRequests(user.id, handleNewFriendRequest);

    // Cleanup khi component unmount
    return () => {
      if (user?.id) {
        websocketService.unsubscribe(`/topic/friend-requests/${user.id}`);
        websocketService.unsubscribe(debugTopic);
      }
    };
  }, [user, dispatch]);

  if (isLoading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div className="card">
      <p className="mb-4 font-bold">
        Friends Requests ({friendRequests.length})
      </p>
      <div className="space-y-4">
        {friendRequests && friendRequests.length > 0 ? (
          friendRequests.map((item) => (
            <FriendRequestItem
              key={item.id}
              fullName={item.sender.name}
              id={item.sender.id}
              friendRequestId={item.id}
            />
          ))
        ) : (
          <p>No friend requests</p>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
