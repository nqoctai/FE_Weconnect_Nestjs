import { Check, Close } from "@mui/icons-material";
import { Avatar, Button } from "@mui/material";
import { useGetPendingFriendRequestsQuery } from "@services/rootApi";
import React, { useEffect, useState, useCallback } from "react";
import websocketService from "@services/websocket/websocketService";
import { useDispatch, useSelector } from "react-redux";
import { rootApi } from "@services/rootApi";

const FriendRequestItem = ({ fullName, id, friendRequestId }) => {
  // Implement accept and reject functionality
  const dispatch = useDispatch();

  const handleAccept = () => {
    // Implement accept functionality here
    console.log("Accept friend request", friendRequestId);
  };

  const handleReject = () => {
    // Implement reject functionality here
    console.log("Reject friend request", friendRequestId);
  };

  return (
    <div className="flex gap-2">
      <Avatar className="!bg-primary-main">
        {fullName?.[0]?.toUpperCase()}
      </Avatar>
      <div>
        <p className="font-bold">{fullName}</p>
        <div className="mt-2 space-x-1">
          <Button variant="contained" size="small" onClick={handleAccept}>
            <Check className="mr-1" fontSize="small" /> Accept
          </Button>
          <Button variant="outlined" size="small" onClick={handleReject}>
            <Close className="mr-1" fontSize="small" /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const FriendRequests = () => {
  const { data, refetch, isLoading } = useGetPendingFriendRequestsQuery();
  const [friendRequests, setFriendRequests] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Cập nhật friendRequests state từ data API
  useEffect(() => {
    if (data?.data) {
      setFriendRequests(data.data);
      console.log("Friend requests loaded from API:", data.data);
    }
  }, [data]);

  // Tạo hàm xử lý thông báo WebSocket bằng useCallback để có thể sử dụng làm dependency
  const handleFriendRequest = useCallback(
    (message) => {
      console.log("Processing friend request notification:", message);

      // Kiểm tra message có tồn tại không trước khi truy cập thuộc tính
      if (!message) {
        console.log("Received empty message");
        return;
      }

      // Kiểm tra content có tồn tại không
      if (!message.content) {
        console.error("Message content is missing");
        return;
      }

      console.log(
        "New friend request received via WebSocket:",
        message.content,
      );

      // Cập nhật state cục bộ
      setFriendRequests((prev) => {
        // Kiểm tra xem lời mời đã tồn tại chưa
        const exists = prev.some((req) => req.id === message.content.id);
        if (!exists) {
          console.log("Adding new friend request to UI list");
          return [message.content, ...prev];
        }
        return prev;
      });

      // Cập nhật cache của RTK Query để các components khác cũng nhận được dữ liệu mới
      try {
        dispatch(
          rootApi.util.updateQueryData(
            "getPendingFriendRequests",
            undefined,
            (draft) => {
              if (!draft.data) {
                draft.data = [];
              }
              // Kiểm tra xem lời mời đã tồn tại trong danh sách chưa
              const exists = draft.data.some(
                (req) => req.id === message.content.id,
              );
              if (!exists) {
                draft.data.unshift(message.content);
              }
            },
          ),
        );
        console.log("RTK Query cache updated successfully");
      } catch (error) {
        console.error("Error updating RTK Query cache:", error);
      }
    },
    [dispatch],
  );

  // Kết nối WebSocket khi component mount
  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID available, can't connect to WebSocket");
      return;
    }

    console.log("Setting up WebSocket connection for user:", user.id);

    // Đăng ký handler trực tiếp cho sự kiện NEW_FRIEND_REQUEST
    websocketService.registerMessageHandler(
      "NEW_FRIEND_REQUEST",
      handleFriendRequest,
    );

    // Kết nối đến WebSocket server (hoặc sử dụng kết nối hiện có)
    websocketService.connect(user.id, null, (error) => {
      console.error("WebSocket connection error:", error);
    });

    // Vì thêm log để debug, nên cần phải test với một số thủ công
    console.log("Testing if WebSocket handlers are set up properly");

    // Cleanup khi component unmount
    return () => {
      console.log("Cleaning up WebSocket connection");
      // Chúng ta không disconnect ở đây để giữ kết nối cho các màn hình khác
    };
  }, [user, handleFriendRequest]);

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
          friendRequests
            .slice(0, 3)
            .map((item) => (
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
