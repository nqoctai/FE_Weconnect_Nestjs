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
            Cancel
          </Button>
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

      // Trực tiếp gọi refetch để lấy dữ liệu mới nhất từ API
      console.log(
        "Refetching friend requests from API due to WebSocket notification",
      );
      refetch();

      // Cập nhật state local cho đến khi refetch hoàn thành
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
    websocketService
      .connect()
      .then(() => {
        console.log("WebSocket connection established, subscribing to topics");

        // Đăng ký nhận thông báo lời mời kết bạn mới
        websocketService.subscribeFriendRequests(
          user.id,
          handleNewFriendRequest,
        );

        // Đăng ký nhận thông báo debug (để theo dõi)
        websocketService._subscribeToTopic("/topic/debug", (msg) => {
          console.log("Debug notification received:", msg);

          // Nếu thông báo debug là lời mời kết bạn cho user hiện tại, xử lý nó
          if (
            msg?.type === "NEW_FRIEND_REQUEST" &&
            msg?.content?.receiver?.id === user.id
          ) {
            handleNewFriendRequest(msg);
          }
        });
      })
      .catch((error) => {
        console.error("Failed to set up WebSocket connection:", error);
      });

    // Cleanup khi component unmount
    return () => {
      if (user?.id) {
        console.log("Cleaning up WebSocket subscriptions");
        websocketService.unsubscribe(`/topic/friend-requests/${user.id}`);
        websocketService.unsubscribe("/topic/debug");
      }
    };
  }, [user, dispatch, refetch]);

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
