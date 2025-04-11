import { FormHelperText } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";

const FormField = ({ control, label, name, Component, type, error }) => {
  return (
    <div>
      <p className="mb-1 text-sm font-bold text-dark-100">{label}</p>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, name } }) => {
          return (
            <Component
              onChange={onChange}
              value={value}
              name={name}
              type={type}
              control={control}
              error={error?.message}
            />
          );
        }}
      />
      {error?.message && (
        <FormHelperText error={true}>{error?.message}</FormHelperText>
      )}
    </div>
  );
};

export default FormField;
