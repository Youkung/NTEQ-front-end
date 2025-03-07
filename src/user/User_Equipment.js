import React, { useState, useEffect } from "react";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Pagination from "react-bootstrap/Pagination";
import "./EquipmentTable.css";

function Equipment() {
  const [userName, setUserName] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Fetch equipment data
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/equipement');
        const result = await response.json();
        if (result.data) {
          setEquipment(result.data);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Filter and paginate data
  const filteredData = equipment.filter(item =>
    item.Equipe_Name?.toLowerCase().includes(search.toLowerCase()) ||
    item.Equipe_Type?.toLowerCase().includes(search.toLowerCase()) ||
    item.Brand?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    // ดึงข้อมูลจาก localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData); // แปลงข้อมูลจาก JSON เป็นออบเจ็กต์
      setUserName(`${user.Name}`); // กำหนดชื่อผู้ใช้
    }
  }, []);

  // ฟังก์ชัน logout
  const handleLogout = () => {
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // เปลี่ยนหน้าไปยังหน้าล็อกอิน
    window.location.href = "/"; // เปลี่ยนหน้าโดยตรง
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="d-flex vh-100 flex-column">
      {/* Header */}
      <div
        className="d-flex align-items-center px-4 py-2 bg-light border-bottom"
        style={{ height: "80px" }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ height: "50px", width: "auto" }}
          className="ms-5 me-2"
        />
        <div className="ms-auto d-flex align-items-center">
          <span className="me-3">{userName || "Loading..."}</span> {/* แสดงชื่อผู้ใช้ */}
          <img
            src="https://static.vecteezy.com/system/resources/previews/009/749/751/non_2x/avatar-man-icon-cartoon-male-profile-mascot-illustration-head-face-business-user-logo-free-vector.jpg"
            alt="Profile"
            className="rounded-circle"
            style={{ height: "40px", width: "40px" }}
          />
        </div>
      </div>

      {/* Main Area */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div
          className="border-end d-flex flex-column align-items-center bg-secondary-subtle"
          style={{
            width: "200px",
          }}
        >
          <ul className="nav flex-column w-100 text-center">
            <Link
              to="/user/dashboard"
              className="nav-link text-dark py-3 sidebar-link font-cute"
            >
              <i className="bi bi-tools me-2"></i>รายงาน
            </Link>
            <li className="nav-item">
              <Link
                to="/user/Equipment"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>อุปกรณ์
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/user/Note"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>บันทึก
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/user/Room"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>สถานที่
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/user/accounts"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>บัญชีผู้ใช้
              </Link>
            </li>
            <li className="nav-item">
              <a
                href="#"
                onClick={handleLogout}
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>ออกจากระบบ
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}
        >
          <div className="p-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="container">
                <h1 className="fw-bold text-dark">อุปกรณ์</h1>
                <div className="row mb-2  ">
                  {/* Dropdown สำหรับเลือกประเภทการค้นหา */}
                  <div className="col-md-3 d-flex mt-2 mb-2">
                    <select className="form-select flex-grow-1">
                      <option value="all">ค้นหาทั้งหมด</option>
                      <option value="name">ค้นหาตามชื่อ</option>
                      <option value="type">ค้นหาตามประเภท</option>
                      <option value="brand">ค้นหาตามแบรนด์</option>
                    </select>
                  </div>

                  {/* ช่องค้นหา */}
                  <div className="col-md-7 position-relative d-flex">
                    <input
                      type="text"
                      className="form-control flex-grow-1 mt-2 mb-2"
                      placeholder="ค้นหาอุปกรณ์..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  {/* ปุ่มค้นหา */}
                  <div className="col-md-auto d-flex mt-2 mb-2" style={{ flexGrow: 1.3 }}>
                    <button className="btn btn-success w-100 m-0">ค้นหา</button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 g-4">
                    {paginatedData.map((item) => (
                      <div key={item.Equipe_ID} className="col">
                        <Link to={`/user/equipment/${item.Equipe_ID}`} className="text-decoration-none">
                          <div className="card h-100 shadow-sm p-3 d-flex flex-row align-items-center">
                            <img
                              src={item.Equipe_Photo || 'https://via.placeholder.com/100'}
                              alt={item.Equipe_Name}
                              className="img-fluid rounded me-3"
                              style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            />
                            <div className="card-body">
                              <h5 className="card-title">{item.Equipe_Name}</h5>
                              <p className="card-text">ประเภท: {item.Equipe_Type}</p>
                              <p className="card-text">ยี่ห้อ: {item.Brand}</p>
                              <p className="card-text">จำนวน: {item.ItemCount || 0}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && (
                  <div className="pagination-container mt-4 d-flex justify-content-center">
                    <button
                      className="btn btn-secondary me-1"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      ก่อนหน้า
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`btn ${page === i + 1 ? "btn-primary" : "btn-light"}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="btn btn-secondary"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      ถัดไป
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Equipment;
