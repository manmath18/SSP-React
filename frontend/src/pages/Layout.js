import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { clearUser } from "../reducers/userReducer";
import "./../css/layout.scss";

const Layout = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/login"); // Redirect to login after logout
  };

  const handleProtectedRoute = (route) => {
    if (!user) {
      navigate("/login"); // Redirect to login if user is not logged in
    } else {
      navigate(route); // Navigate to the route if user is logged in
    }
  };

  return (
    <div className="main-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="/">
            <img className="logo" src="./logo3.png" alt="Logo" />
          </Link>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav ms-auto align-items-center">
              {/* Common links for all users */}
              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  About
                </Link>
              </li>
              {!user ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Parking
                  </Link>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/parking">
                    Parking
                  </Link>
                </li>
              )}
              {!user ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Bookings
                  </Link>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/booking">
                    Bookings
                  </Link>
                </li>
              )}
              {/* Links visible only to owners */}
              {user?.type === "owner" && (
                <>
                  <li className="nav-item">
                    <button
                      className="btn btn-link nav-link"
                      onClick={() => handleProtectedRoute("/parkingForm")}
                    >
                      Create Parking
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-link nav-link"
                      onClick={() => handleProtectedRoute("/upload")}
                    >
                      Process Image
                    </button>
                  </li>
                </>
              )}

              {/* Admin-specific links */}
              {user?.type === "admin" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/users">
                      Users
                    </Link>
                  </li>
                </>
              )}

              {/* Profile and Logout/Login */}
              {user ? (
                <>
                  <li className="nav-item ms-2">
                    <Link className="nav-link" to="/profile">
                      <div className="bg-dark px-3 py-2 rounded-circle pointer">
                        {user?.name && user?.name[0]}
                      </div>
                    </Link>
                  </li>
                  <li className="nav-item ms-2">
                    <button
                      className="btn btn-outline-info"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item ms-2">
                  <Link className="btn btn-outline-info" to="/login">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default Layout;
