import Header from "@components/Header";
import Loading from "@components/Loading";
import { saveUserInfor } from "@redux/slices/authSlice";
import { useGetAuthUserQuery } from "@services/rootApi";
import websocketService from "@services/websocket/websocketService";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  const res = useGetAuthUserQuery();
  const dispatch = useDispatch();
  const wsConnected = useRef(false);

  console.log("Protected layout rendering, auth response:", res);

  useEffect(() => {
    if (res.isSuccess && res?.data?.data) {
      console.log("User data loaded:", res?.data?.data);
      const userData = res?.data?.data;
      dispatch(saveUserInfor(userData));

      // Kết nối WebSocket chỉ một lần khi có dữ liệu người dùng
      if (userData?.id && !wsConnected.current) {
        console.log("Initializing WebSocket connection for user:", userData.id);

        websocketService.connect(
          userData.id,
          (message) => {
            console.log(
              "[ProtectedLayout] WebSocket message received:",
              message,
            );
            // Xử lý thông báo toàn cục ở đây nếu cần
          },
          (error) => {
            console.error("[ProtectedLayout] WebSocket error:", error);
          },
        );

        wsConnected.current = true;
      }
    }

    // Ngắt kết nối WebSocket khi component bị hủy (user logout)
    return () => {
      if (wsConnected.current) {
        console.log("Disconnecting WebSocket on layout unmount");
        websocketService.disconnect();
        wsConnected.current = false;
      }
    };
  }, [res.isSuccess, dispatch, res?.data?.data]);

  if (res.isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Header />
      <div className="bg-dark-200">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
