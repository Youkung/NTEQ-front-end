import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Modal } from "react-bootstrap";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import "./AccountProfile.css";
import { Link } from "react-router-dom";

function Account() {
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    profilePicture:
      "https://static.vecteezy.com/system/resources/previews/009/749/751/non_2x/avatar-man-icon-cartoon-male-profile-mascot-illustration-head-face-business-user-logo-free-vector.jpg",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false); // ควบคุม Modal
  const [selectedFile, setSelectedFile] = useState(null); // เก็บไฟล์ที่เลือก
  const [userName, setUserName] = useState("");

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
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      fetchUserData();
    }
  }, []);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();

      // เก็บ password ที่ได้จาก API ไว้ใน state
      setUserData({
        username: userData.Username,
        name: userData.Name,
        email: userData.email,
        phone: userData.phone,
        password: userData.Password, // เก็บ password จาก API
        profilePicture:
          userData.profilePicture ||
          "https://static.vecteezy.com/system/resources/previews/009/749/751/non_2x/avatar-man-icon-cartoon-male-profile-mascot-illustration-head-face-business-user-logo-free-vector.jpg",
      });

      // เก็บข้อมูลเดิมไว้เพื่อใช้เปรียบเทียบ
      setOriginalData({
        ...userData,
        password: userData.Password,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    // เก็บข้อมูลเดิมทั้งหมด
    setOriginalData({ ...userData });

    // ต้องแน่ใจว่าเรามี password จาก API
    if (userData.Password) {
      // สังเกตว่าใช้ตัว P ใหญ่เพราะมาจาก API
      setUserData((prev) => ({
        ...prev,
        password: userData.Password, // กำหนดค่า password จาก API
      }));
    }

    setIsEditing(true);
  };

  const handleCancel = () => {
    setUserData({ ...originalData });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/user/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: userData.username,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            // ส่ง password เฉพาะเมื่อมีการเปลี่ยนแปลง
            password:
              userData.password !== originalData.password
                ? userData.password
                : undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await response.json();

      // Update local storage
      const currentUserData = JSON.parse(localStorage.getItem("userData"));
      const updatedUserData = {
        ...currentUserData,
        Username: result.data.Username || userData.username,
        Name: result.data.Name || userData.name,
        Email: result.data.email || userData.email,
        Tel_Number: result.data.phone || userData.phone,
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      // ดึงข้อมูลใหม่ทันที
      await fetchUserData();

      // อัพเดตชื่อที่แสดงในส่วนบนของหน้า
      setUserName(updatedUserData.Name);

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.message || "Failed to update profile. Please try again.");
    }
  };

  // เพิ่ม useEffect เพื่อติดตามการเปลี่ยนแปลงของ userData
  useEffect(() => {
    // อัพเดตชื่อผู้ใช้เมื่อ userData มีการเปลี่ยนแปลง
    if (userData.name) {
      setUserName(userData.name);
    }
  }, [userData.name]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        // Replace with your actual API endpoint
        const response = await fetch("/api/user/profile/picture", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setUserData((prev) => ({
            ...prev,
            profilePicture: data.pictureUrl,
          }));
          setShowModal(false); // ปิด Modal
          alert("Profile picture updated successfully!");
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
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
              <Row>
                {/* Profile Picture Column */}
                <Col
                  md={4}
                  className="d-flex justify-content-center align-items-center"
                >
                  <div className="profile-picture-container text-center">
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="profile-picture rounded-circle mb-3"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <Button
                      variant="link"
                      className="mt-2 text-primary"
                      onClick={() => setShowModal(true)}
                    >
                      เปลี่ยนรูปภาพ
                    </Button>
                  </div>
                </Col>

                {/* Account Details Column */}
                <Col md={8}>
                  <h2
                    className="mb-4"
                    style={{ fontSize: "2rem", color: "#333" }}
                  >
                    โปรไฟล์
                  </h2>
                  <Form onSubmit={handleSubmit}>
                    {/* Username */}
                    <Form.Group controlId="username" className="mb-3">
                      <Form.Label>ชื่อผู้ใช้</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-control"
                      />
                    </Form.Group>

                    {/* Name */}
                    <Form.Group controlId="name" className="mb-3">
                      <Form.Label>ชื่อ</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>

                    {/* Email */}
                    <Form.Group controlId="email" className="mb-3">
                      <Form.Label>อีเมล</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>

                    {/* Phone */}
                    <Form.Group controlId="phone" className="mb-3">
                      <Form.Label>เบอร์โทร</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>

                    {/* Password - Only show when editing */}
                    {isEditing && (
                      <Form.Group controlId="password" className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={userData.password || ""}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className="form-control"
                          />
                          <span
                            className="input-group-text"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: "pointer" }}
                          >
                            <i
                              className={
                                showPassword ? "bi bi-eye-slash" : "bi bi-eye"
                              }
                            ></i>
                          </span>
                        </div>
                      </Form.Group>
                    )}

                    {/* Save/Cancel Buttons */}
                    <div className="text-end">
                      {isEditing ? (
                        <>
                          <Button
                            variant="secondary"
                            className="me-2"
                            onClick={handleCancel}
                          >
                            ยกเลิก
                          </Button>
                          <Button variant="primary" type="submit">
                            บันทึก
                          </Button>
                        </>
                      ) : (
                        <Button variant="primary" onClick={handleEdit}>
                          แก้ไขโปรไฟล์
                        </Button>
                      )}
                    </div>
                  </Form>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>เปลี่ยนรูปโปรไฟล์</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>อัพโหลดรูปภาพใหม่</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              ยกเลิก
            </Button>
            <Button variant="primary" onClick={handleProfilePictureChange}>
              บันทึก
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Account;
