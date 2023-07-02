import React from 'react'
import './App.css'
import Home from './pages/Home';
import {
    RouterProvider,
    createHashRouter,
    Outlet,
} from "react-router-dom";

import { ErrorBoundary } from 'react-error-boundary';
import Preloader from './components/Preloader';
import ErrorPage from './pages/ErrorPage';
import Auth from './pages/Auth';



const Layout = () => {
    return (
        <React.Suspense fallback={<Preloader />}>
            <ErrorBoundary fallback={<ErrorPage />}>
                <Outlet />
            </ErrorBoundary>
        </React.Suspense>
    )
}

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "auth",
                element: <Auth />,
            }
        ]
    }])

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App