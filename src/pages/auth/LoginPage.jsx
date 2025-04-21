import FormField from "@components/FormField";
import TextInput from "@components/FormInputs/TextInput";
import { Alert, Button, CircularProgress } from "@mui/material";

import React from "react";
import { useForm } from "react-hook-form";

import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { openSnackbar } from "@redux/slices/snackbarSlice";
import { login as loginAction } from "@redux/slices/authSlice";
import { useLogin } from "@hooks/apiHook";

const LoginPage = () => {
  const { mutate, isLoading, error, data } = useLogin();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (formData) => {
    mutate(
      { username: formData.email, password: formData.password },
      {
        onSuccess: (data) => {
          console.log("Login successful", data);
          dispatch(openSnackbar({ message: data?.message }));
          localStorage.setItem("access_token", data?.data?.accessToken);
          dispatch(loginAction({ accessToken: data?.data?.accessToken }));
          navigate("/");
        },
        onError: (error) => {
          console.log("Login failed", error);
          const backendError = error?.response?.data;
          dispatch(
            openSnackbar({ message: backendError?.error, type: "error" }),
          );
        },
      },
    );
    console.log("data >>>", data);
  };

  return (
    <div>
      <p className="mb-5 text-center text-2xl font-bold">Login</p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          name={"email"}
          label={"Email"}
          control={control}
          Component={TextInput}
          error={errors["email"]}
        />
        <FormField
          name={"password"}
          label={"Password"}
          control={control}
          type="password"
          Component={TextInput}
          error={errors["password"]}
        />
        <Button variant="contained" type="submit">
          {isLoading && <CircularProgress size={"16px"} className="mr-1" />}
          Sign In
        </Button>
        {error && <Alert severity="error">{error?.response?.data.error}</Alert>}
      </form>
      <p className="mt-4">
        New on our platform?{" "}
        <Link className="font-bold" to={"/register"}>
          Create an account?
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
