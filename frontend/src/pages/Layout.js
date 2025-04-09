import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { clearUser } from "../reducers/userReducer";
import './../css/layout.scss';

const Layout = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(clearUser());
    };

    return (
        <div className="main-container">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link to="/"><img className="logo" src="./logo3.png" /></Link>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item">
                                <Link className="nav-link" to='/'>Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/about'>About</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/parking'>Parking</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to='/space'>Spaces</Link>
                            </li>
                            {user?.type !== "seeker" &&
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to='/parkingForm'>Create Parking</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to='/spaceForm'>Create Space</Link>
                                    </li>
                                </>
                            }
                            <li className="nav-item">
                                <Link className="nav-link" to='/booking'>Bookings</Link>
                            </li>
                            {user?.type === "admin" &&
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to='/users'>Users</Link>
                                    </li>
                                </>
                            }
                            <li className="nav-item">
                                <Link className="nav-link" to='/upload'>Process Image</Link> {/* New Button */}
                            </li>
                            {user ?
                                <>
                                    <li className="nav-item ms-2">
                                        <Link className="nav-link" to='/profile'><div className="bg-dark px-3 py-2 rounded-circle pointer">{user?.name && user?.name[0]}</div></Link>
                                    </li>
                                    <Link to="/">
                                    <li className="nav-item ms-2">
                                        <button className="btn btn-outline-info" onClick={handleLogout}>Logout</button>
                                    </li>
                                    </Link>
                                </>
                                :
                                <li className="nav-item ms-2">
                                    <Link className="btn btn-outline-info" to='/login'>Login</Link>
                                </li>
                            }
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
};

export default Layout;