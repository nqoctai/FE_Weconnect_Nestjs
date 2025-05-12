import Header from "@components/Header";
import Loading from "@components/Loading";
import SocketProvider from "@context/SocketProvider";
import { useGetProfile } from "@hooks/apiHook";
import { saveUserInfor } from "@redux/slices/authSlice";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  // const res = useGetAuthUserQuery();
  const { data, isSuccess, isLoading } = useGetProfile();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSuccess && data?.data) {
      console.log("User data loaded:", data?.data);
      const userData = data?.data;
      dispatch(saveUserInfor(userData));
    }
  }, [isSuccess, dispatch, data?.data]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SocketProvider>
      <div>
        <Header />
        <div className="bg-dark-200">
          <Outlet />
        </div>
      </div>
    </SocketProvider>
  );
};

export default ProtectedLayout;
