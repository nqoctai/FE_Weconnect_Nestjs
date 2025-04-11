import Header from "@components/Header";
import { CircularProgress } from "@mui/material";
import { saveUserInfor } from "@redux/slices/authSlice";
import { useGetAuthUserQuery } from "@services/rootApi";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  const res = useGetAuthUserQuery();
  const dispatch = useDispatch();
  console.log("res >>>", res);

  useEffect(() => {
    if (res.isSuccess) {
      console.log("res data >>>", res?.data?.data);
      dispatch(saveUserInfor(res?.data?.data));
    }
  }, [res.isSuccess, dispatch, res?.data?.data]);

  // if (res?.data?.status === 401) {
  //   return <Navigate to={`/login`} />;
  // }

  // if (res.isLoading) {
  //   return <p>Loading....</p>;
  // }

  // if (!res?.data?.data?.id) {
  //   return <Navigate to={`/login`} />;
  // }
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
