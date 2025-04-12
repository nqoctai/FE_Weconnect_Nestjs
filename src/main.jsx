import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";

import RootLayout from "./pages/RootLayout.jsx";

import ModalProvider from "@context/ModalProvider";
import { ThemeProvider } from "@mui/material";
import theme from "./configs/muiConfig";
import RegisterPage from "@pages/auth/RegisterPage";
import AuthLayout from "@pages/auth/AuthLayout";
import LoginPage from "@pages/auth/LoginPage";
import { Provider } from "react-redux";
import { persistor, store } from "@redux/store";
import ProtectedLayout from "@pages/ProtectedLayout";
import MessagesPage from "@pages/MessagesPage";
import { PersistGate } from "redux-persist/integration/react";
import Dialog from "@components/Dialog";
import Loading from "@components/Loading";
import SearchUsersPage from "@pages/SearchUsersPage";

// const MovieDetail = lazy(() => import("@pages/MovieDetail"));

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/messages",
            element: <MessagesPage />,
          },
          {
            path: "/search/users",
            element: <SearchUsersPage />,
          },
        ],
      },

      {
        element: <AuthLayout />,
        children: [
          {
            path: "/register",
            element: <RegisterPage />,
          },
          {
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          {/* <ModalProvider> */}
          <RouterProvider router={router} />
          <Dialog />
          {/* </ModalProvider> */}
        </ThemeProvider>
      </PersistGate>
    </Provider>
    {/* <App /> */}
  </StrictMode>,
);
