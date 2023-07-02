import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/authContext'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { CircularProgress } from '@mui/material';

const Home = () => {
    const [loading, setLoading] = useState(false);
    const { currentUser, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!currentUser) {
            navigate("/auth");
        }
    }, [currentUser, navigate]);

    const handlePortfolio = () => {
        window.open('https://velvety-mochi-49252e.netlify.app/', '_blank');
    };

    const handleLogout = async () => {
        try {
            setLoading(true)
            await logout()
            navigate("/auth")
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='d-flex gap-1 flex-column align-items-center justify-content-center text-white vh-100'>
            {currentUser && (
                <>
                    <h2>Wellcome {currentUser.fname} {currentUser.lname}!</h2>
                    <div className='d-flex gap-2'>
                        <button className="btn btn-outline-primary icon-link icon-link-hover text-white custom-outline" style={{ "--bs-link-hover-color-rgb": "25, 135, 84" }} onClick={handlePortfolio}>
                            Portfolio
                            <svg className="bi" aria-hidden="true">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                            </svg>
                        </button>
                        {loading ?
                            <button className="btn btn-primary px-5 px-3"><CircularProgress sx={{ color: "#a8bffc" }} size={20} /></button> :
                            <button className='btn btn-outline-primary icon-link icon-link-hover text-white custom-outline' onClick={handleLogout}>
                                Logout
                                <svg className="bi" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                                    <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                                </svg>
                            </button>
                        }
                    </div>
                </>
            )}
        </div>
    )
}

export default Home