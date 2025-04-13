import { CircularProgress, Button as MUIButton } from "@mui/material";
import React from "react";

const Button = ({
  isLoading,
  onClick,
  variant = "outline",
  icon,
  children,
  size,
}) => {
  return (
    <MUIButton
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <CircularProgress className="mr-1 animate-spin" size="16px" />
      ) : (
        icon
      )}{" "}
      {children}
    </MUIButton>
  );
};

export default Button;
