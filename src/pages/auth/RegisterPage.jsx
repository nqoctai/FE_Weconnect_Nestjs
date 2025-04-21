import FormField from "@components/FormField";
import TextInput from "@components/FormInputs/TextInput";
import { Alert, Button } from "@mui/material";
import { openSnackbar } from "@redux/slices/snackbarSlice";

import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRegister } from "@hooks/apiHook";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const register = useRegister();

  const formSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
    phone: yup.string().required("Phone number is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (formData) => {
    console.log({ formData });
    await register.mutateAsync(formData, {
      onSuccess: (data) => {
        console.log("Register success", data);
        dispatch(openSnackbar({ message: data?.message }));
        navigate("/login");
      },
      onError: (error) => {
        console.error("Register error", error);
        const backendError = error?.response?.data;
        dispatch(openSnackbar({ message: backendError?.error }));
      },
    });
  };

  return (
    <div>
      <p className="mb-5 text-center text-2xl font-bold">Register</p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          name={"name"}
          label={"Full Name"}
          control={control}
          Component={TextInput}
          error={errors["name"]}
        />
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
        <FormField
          name={"phone"}
          label={"Phone"}
          control={control}
          Component={TextInput}
          error={errors["phone"]}
        />
        <Button variant="contained" type="submit">
          Sign Up
        </Button>
        {register.error && (
          <Alert severity="error">
            {register.error?.response?.data?.error}
          </Alert>
        )}
      </form>
      <p className="mt-4">
        Already have an account? <Link to={"/login"}>Sign in instead</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
