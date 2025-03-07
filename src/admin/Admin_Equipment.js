import React, { useState, useEffect } from "react";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap"; // Importing Modal from react-bootstrap
import axios from "axios"; // เพิ่มการนำเข้า Axios
import "./EquipmentTable.css";

function Equipment() {
  const [showModal, setShowModal] = useState(false); // State for Modal visibility
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    image: "",
    productName: "",
    equipmentType: "",
    brand: "",
    model: "",
  });
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const imageStyle = {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all"); // all, name, type, brand
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
  const [showPopupedit, setShowPopupedit] = useState(false);
  // Add this state at the top with other state declarations

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // คำนวณข้อมูลที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [editData, setEditData] = useState({
    Equipe_ID: "",
    Equipe_Photo: "",
    Equipe_Name: "",
    Equipe_Type: "",
    Model_Number: "",
    Brand: "",
  });
  // เพิ่มฟังก์ชัน handleUpdateEquipment
  // เพิ่มฟังก์ชันสำหรับอัพเดท
  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `https://nteq-back-end.vercel.app/api/equipment/${editData.Equipe_ID}`,
        {
          Equipe_Photo: editData.Equipe_Photo,
          Equipe_Name: editData.Equipe_Name,
          Equipe_Type: editData.Equipe_Type,
          Model_Number: editData.Model_Number,
          Brand: editData.Brand,
          Equipe_CreatDate: new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
        }
      );

      if (response.status === 200) {
        setShowPopupedit(false);
        FetchData();
      }
    } catch (error) {
      console.error("Error updating equipment:", error);
    }
  };

  // Add this function to handle edit button click
  const handleEditClick = (item) => {
    console.log("Edit item data:", item); // For debugging
    setEditData({
      Equipe_ID: item.Equipe_ID,
      Equipe_Photo: item.Equipe_Photo || "", // Set default empty string if no photo
      Equipe_Name: item.Equipe_Name,
      Equipe_Type: item.Equipe_Type,
      Model_Number: item.Model_Number,
      Brand: item.Brand,
    });
    setShowPopupedit(true);
  };

  const handleDelete = async (equipmentId) => {
    // แสดงกล่องข้อความยืนยันการลบ
    const isConfirmed = window.confirm("คุณแน่ใจหรือไม่ที่จะลบอุปกรณ์นี้?");

    // ดำเนินการลบเมื่อผู้ใช้กด OK
    if (isConfirmed) {
      try {
        await axios.delete(
          `https://nteq-back-end.vercel.app/api/equipment/${equipmentId}`
        );
        // รีเฟรชข้อมูลหลังลบสำเร็จ
        FetchData();
      } catch (error) {
        console.error("Error deleting equipment:", error);
        alert("เกิดข้อผิดพลาดในการลบอุปกรณ์");
      }
    }
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressedImage = await compressImage(reader.result);
        setEditData({
          ...editData,
          Equipe_Photo: compressedImage,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form changes
  const compressImage = async (base64String) => {
    const img = new Image();
    img.src = base64String;
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;
        const maxHeight = 800;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.floor((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.floor((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL("image/jpeg", 0.5); // ปรับคุณภาพเป็น 0.5 (50%)
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleInputChange = async (e) => {
    const { name, type } = e.target;

    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressedImage = await compressImage(reader.result);
          setFormData((prev) => ({
            ...prev,
            image: compressedImage,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      // จัดการกับ text input
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.value,
      }));
    }
  };

  // แก้ไขฟังก์ชัน handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem("userData"));

    // สร้างข้อมูลให้ครบตามที่ backend ต้องการ
    const equipmentData = {
      User_ID: userData.User_ID,
      Equipe_Photo: formData.image,
      Equipe_Name: formData.productName,
      Equipe_Type: formData.equipmentType,
      Model_Number: formData.model || "DEFAULT", // เพิ่ม default value
      Brand: formData.brand,
      Equipe_CreatDate: new Date().toISOString().slice(0, 10),
    };

    // ตรวจสอบข้อมูลก่อนส่ง
    const requiredFields = [
      "User_ID",
      "Equipe_Photo",
      "Equipe_Name",
      "Equipe_Type",
      "Model_Number",
      "Brand",
    ];
    const missingFields = requiredFields.filter(
      (field) => !equipmentData[field]
    );

    if (missingFields.length > 0) {
      alert(`กรุณากรอก: ${missingFields.join(", ")}`);
      return;
    }

    try {
      await axios.post("https://nteq-back-end.vercel.app/api/equipment", equipmentData);
      setShowModal(false);
      FetchData();
      // รีเซ็ตฟอร์ม
      setFormData({
        image: "",
        productName: "",
        equipmentType: "",
        brand: "",
        model: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์");
    }
  };

  const FetchData = async () => {
    try {
      const response = await axios.get("https://nteq-back-end.vercel.app/api/equipement");
      console.log("API Response:", response.data);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = () => {
    const searchLower = searchTerm.toLowerCase().trim();

    if (!searchLower) {
      FetchData(); // If search is empty, fetch all data
      return;
    }

    const filteredData = data.filter(item => {
      switch (searchCategory) {
        case "name":
          return item.Equipe_Name?.toLowerCase().includes(searchLower);
        case "type":
          return item.Equipe_Type?.toLowerCase().includes(searchLower);
        case "brand":
          return item.Brand?.toLowerCase().includes(searchLower);
        default: // "all"
          return (
            item.Equipe_Name?.toLowerCase().includes(searchLower) ||
            item.Equipe_Type?.toLowerCase().includes(searchLower) ||
            item.Brand?.toLowerCase().includes(searchLower)
          );
      }
    });

    setData(filteredData);
  };

  // Add new state for suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Add new function to get suggestions
  const getSuggestions = (value) => {
    const searchLower = value.toLowerCase().trim();
    if (!searchLower) {
      setSuggestions([]);
      return;
    }

    const suggestedItems = data.filter(item => {
      switch (searchCategory) {
        case "name":
          return item.Equipe_Name?.toLowerCase().includes(searchLower);
        case "type":
          return item.Equipe_Type?.toLowerCase().includes(searchLower);
        case "brand":
          return item.Brand?.toLowerCase().includes(searchLower);
        default:
          return (
            item.Equipe_Name?.toLowerCase().includes(searchLower) ||
            item.Equipe_Type?.toLowerCase().includes(searchLower) ||
            item.Brand?.toLowerCase().includes(searchLower)
          );
      }
    }).slice(0, 5); // Limit to 5 suggestions

    setSuggestions(suggestedItems);
  };

  useEffect(() => {
    FetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      FetchData();
    }
  }, [searchTerm]);

  const handleAddItem = (e) => {
    e.preventDefault();
    console.log("Edit Item!");
    setShowPopupedit(false);
  };

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

  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestions([]);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
          <span className="me-3">{userName || "Loading..."}</span>{" "}
          {/* แสดงชื่อผู้ใช้ */}
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
              to="/admin/dashboard"
              className="nav-link text-dark py-3 sidebar-link font-cute"
            >
              <i className="bi bi-tools me-2"></i>รายงาน
            </Link>
            <li className="nav-item">
              <Link
                to="/admin/Equipment"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>อุปกรณ์
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/Note"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>บันทึก
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/Room"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>สถานที่
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/accounts"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>บัญชีผู้ใช้
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin/UserManagement"
                className="nav-link text-dark py-3 sidebar-link font-cute"
              >
                <i className="bi bi-tools me-2"></i>การจัดการผู้ใช้
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
              <h1>อุปกรณ์</h1>
              {/* Search Fields */}
              <div className="search-container row mb-3 p-0 align-items-center g-2">
                {/* หมวดหมู่ค้นหา */}
                <div className="col-md-3 d-flex">
                  <select
                    className="form-select flex-grow-1"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="all">ค้นหาทั้งหมด</option>
                    <option value="name">ค้นหาตามชื่อ</option>
                    <option value="type">ค้นหาตามประเภท</option>
                    <option value="brand">ค้นหาตามแบรนด์</option>
                  </select>
                </div>

                {/* ช่องค้นหา */}
                <div className="col-md-6 position-relative d-flex">
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    placeholder="พิมพ์คำค้นหา..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      getSuggestions(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                        setSuggestions([]);
                      }
                    }}
                  />
                  {suggestions.length > 0 && (
                    <div className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm" style={{ zIndex: 1000 }}>
                      {suggestions.map((item, index) => (
                        <div
                          key={`suggestion_${index}`}
                          className="p-2 hover-bg-light cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSearchTerm(searchCategory === "name" ? item.Equipe_Name :
                              searchCategory === "type" ? item.Equipe_Type :
                                searchCategory === "brand" ? item.Brand :
                                  item.Equipe_Name);
                            setSuggestions([]);
                            handleSearch();
                          }}
                        >
                          {searchCategory === "name" ? item.Equipe_Name :
                            searchCategory === "type" ? item.Equipe_Type :
                              searchCategory === "brand" ? item.Brand :
                                `${item.Equipe_Name} - ${item.Equipe_Type} - ${item.Brand}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ปุ่มค้นหา */}
                <div className="col-md-auto d-flex" style={{ flexGrow: 1.3 }}>
                  <button
                    className="btn btn-primary w-100 m-0"
                    onClick={handleSearch}
                  >
                    ค้นหา
                  </button>
                </div>

                {/* ปุ่มเพิ่ม */}
                <div className="col-md-2 d-flex">
                  <button
                    className="btn btn-success w-100 m-0"
                    onClick={handleShowModal}
                  >
                    สร้างอุปกรณ์
                  </button>
                </div>
              </div>


              {/* Table */}
              <table className="table table-bordered text-center">
                <thead className="bg-light">
                  <tr>
                    <th>ชื่ออุปกรณ์</th>
                    <th>รูปภาพอุปกรณ์</th>
                    <th>ประเภทอุปกรณ์</th>
                    <th>ยี่ห้อ</th>
                    <th>จำนวนเครื่อง</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {[...currentItems].reverse().map((item, index) => (
                    <tr key={`equipment_${item.Equipe_ID}_${index}`}>
                      <td>{item.Equipe_Name}</td>
                      <td>
                        {item.Equipe_Photo ? (
                          <img
                            src={item.Equipe_Photo}
                            alt={item.Equipe_Name}
                            style={{ width: "50px", height: "50px" }}
                          />
                        ) : (
                          <div>No Image</div>
                        )}
                      </td>
                      <td>{item.Equipe_Type}</td>
                      <td>{item.Brand}</td>
                      <td>{item.ItemCount || 0}</td>
                      <td>
                        <FaEye
                          className="icon text-success"
                          onClick={() => navigate(`/admin/equipment/${item.Equipe_ID}`)}
                        />
                        <FaEdit className="icon text-primary" onClick={() => handleEditClick(item)} />
                        <FaTrashAlt className="icon text-danger" onClick={() => handleDelete(item.Equipe_ID)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="pagination-container d-flex justify-content-center">
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ก่อนหน้า
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`btn ${currentPage === index + 1 ? "btn-primary" : "btn-light"
                      }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for New Equipment */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold">เพิ่มอุปกรณ์ใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Equipment Name */}
            <Form.Group className="mb-4" controlId="formProductName">
              <Form.Label className="fw-bold">ชื่ออุปกรณ์</Form.Label>
              <Form.Control
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                placeholder="กรุณากรอกชื่ออุปกรณ์"
                className="shadow-sm"
              />
            </Form.Group>

            {/* Equipment Type */}
            <Form.Group className="mb-4" controlId="formEquipmentType">
              <Form.Label className="fw-bold">ประเภทอุปกรณ์</Form.Label>
              <Form.Control
                type="text"
                name="equipmentType"
                value={formData.equipmentType}
                onChange={handleInputChange}
                required
                placeholder="กรุณากรอกประเภทอุปกรณ์"
                className="shadow-sm"
              />
            </Form.Group>

            {/* Model Number - New Field */}
            <Form.Group className="mb-4" controlId="formModel">
              <Form.Label className="fw-bold">หมายเลขรุ่น</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                placeholder="กรุณากรอกหมายเลขรุ่น"
                className="shadow-sm"
              />
            </Form.Group>

            {/* Brand */}
            <Form.Group className="mb-4" controlId="formBrand">
              <Form.Label className="fw-bold">ยี่ห้อ</Form.Label>
              <Form.Control
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                placeholder="กรุณากรอกยี่ห้อ"
                className="shadow-sm"
              />
            </Form.Group>

            {/* Equipment Image */}
            <Form.Group className="mb-4" controlId="formImage">
              <Form.Label className="fw-bold">รูปภาพอุปกรณ์</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                className="shadow-sm"
              />
              <Form.Text className="text-muted">
                กรุณาอัปโหลดไฟล์รูปภาพ (JPEG, PNG, ฯลฯ)
              </Form.Text>
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                className="me-2 shadow-sm"
                onClick={handleCloseModal}
              >
                ยกเลิก
              </Button>
              <Button variant="primary" type="submit" className="shadow-sm">
                บันทึกอุปกรณ์
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {showPopupedit && (
        <div
          className="popup-overlay d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <div
            className="popup-content bg-white p-4 rounded shadow-lg"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "800px",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <h3 className="text-center mb-4">แก้ไขอุปกรณ์</h3>
            <form onSubmit={handleUpdateEquipment}>
              {/* Image Preview and Upload Section */}
              <div className="mb-4">
                {editData.Equipe_Photo ? (
                  <>
                    <label className="form-label d-block">รูปภาพปัจจุบัน</label>{" "}
                    {/* ใช้ d-block เพื่อให้ label อยู่บนหัวรูป */}
                    <img
                      src={editData.Equipe_Photo}
                      alt="Equipment"
                      className="img-fluid mb-3"
                      style={{ maxWidth: "60%", height: "auto" }}
                    />
                  </>
                ) : (
                  <div
                    className="image-placeholder mb-3"
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      height: "auto",
                      textAlign: "center",
                    }}
                  >
                    <p>No Image Available</p>
                  </div>
                )}
                <label className="form-label d-block">อัพโหลด รูปภาพใหม่</label>{" "}
                {/* ใช้ d-block เพื่อให้ label อยู่ใต้รูป */}
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
              </div>

              {/* Form Inputs Section */}
              <div className="mb-3">
                <label className="form-label">ชื่ออุปกรณ์</label>
                <input
                  type="text"
                  placeholder="ชื่ออุปกรณ์"
                  className="form-control"
                  value={editData.Equipe_Name}
                  onChange={(e) =>
                    setEditData({ ...editData, Equipe_Name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">ประเภทอุปกรณ์</label>
                <input
                  type="text"
                  placeholder="ประเภทอุปกรณ์"
                  className="form-control"
                  value={editData.Equipe_Type}
                  onChange={(e) =>
                    setEditData({ ...editData, Equipe_Type: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">แบรนด์</label>
                <input
                  type="text"
                  placeholder="แบรนด์"
                  className="form-control"
                  value={editData.Brand}
                  onChange={(e) =>
                    setEditData({ ...editData, Brand: e.target.value })
                  }
                />
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-between mt-4">
                <button type="submit" className="btn btn-primary w-45">
                  บันทึก
                </button>
                <button
                  type="button"
                  className="btn btn-danger w-45"
                  onClick={() => setShowPopupedit(false)}
                >
                  ปิด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipment;
