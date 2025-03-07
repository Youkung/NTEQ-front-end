import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "../Logo/Fulllogo.png";

function User_Dashboard_detail() {
  const [userName, setUserName] = useState("");
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.Name);
    }

    // Fetch dashboard data
    fetch('http://localhost:8080/api/device-summary')
      .then(response => response.json())
      .then(data => setSummaryData(data))
      .catch(error => console.error('Error fetching summary:', error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  return (
    <div className="d-flex vh-100 flex-column">
      {/* Header */}
      <div className="d-flex align-items-center px-4 py-2 bg-light border-bottom" style={{ height: "80px" }}>
        <img src={logo} alt="Logo" style={{ height: "50px", width: "auto" }} className="ms-5 me-2" />
        <div className="ms-auto d-flex align-items-center">
          <span className="me-3">{userName || "Loading..."}</span>
          <img
            src="https://static.vecteezy.com/system/resources/previews/009/749/751/non_2x/avatar-man-icon-cartoon-male-profile-mascot-illustration-head-face-business-user-logo-free-vector.jpg"
            alt="Profile"
            className="rounded-circle"
            style={{ height: "40px", width: "40px" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div className="border-end d-flex flex-column align-items-center bg-secondary-subtle" style={{ width: "200px" }}>
          <ul className="nav flex-column w-100 text-center">
            <Link to="/user/dashboard" className="nav-link text-dark py-3 sidebar-link">
              <i className="bi bi-tools me-2"></i>รายงาน
            </Link>
            {/* Add other navigation links */}
          </ul>
        </div>

        {/* Dashboard Content */}
        <div className="flex-grow-1 p-4" style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="mb-4">Equipment Summary</h2>
            
            {summaryData ? (
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Equipment</h5>
                      <h2>{summaryData.totalCount}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Active Equipment</h5>
                      <h2>{summaryData.activeCount}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card bg-danger text-white">
                    <div className="card-body">
                      <h5 className="card-title">Inactive Equipment</h5>
                      <h2>{summaryData.inactiveCount}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading summary data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default User_Dashboard_detail;