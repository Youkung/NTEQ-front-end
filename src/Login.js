import React, { useState } from "react";
import axios from "axios";
import Logo from "./Logo/NT.png";
import logo from "./Logo/Fulllogo.png";

function Login() {
    const [Username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loadingMessage, setLoadingMessage] = useState(""); // สำหรับแสดงข้อความ

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoadingMessage("");

        if (!Username || !password) {
            setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
            return;
        }

        try {
            setLoadingMessage("กำลังเข้าสู่ระบบ...");

            const response = await axios.post("http://localhost:8080/ntdtb/users", {
                Username,
                Password: password
            });

            if (response.data.success) {
                const { accessToken, user } = response.data;

                // Store both token and user data
                localStorage.setItem("token", accessToken);
                localStorage.setItem("userData", JSON.stringify(user));
                localStorage.setItem('userRole', user.Role_ID);
                localStorage.setItem('userId', user.User_ID);

                console.log("Login successful", user);
                setLoadingMessage("เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังหน้าหลัก...");

                // Redirect based on role after 2 seconds
                setTimeout(() => {
                    if (user.Role_ID === 'R1') {
                        window.location.href = "/admin/dashboard";
                    } else if (user.Role_ID === 'R2') {
                        window.location.href = "/user/dashboard";
                    }
                }, 2000);
            } else {
                setError(response.data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            setLoadingMessage("");
        }
    };

    return (
        <div>
            {/* ส่วนหัวที่มีโลโก้ */}
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
            </div>

            {/* ส่วนล็อกอิน */}
            <div
                className="d-flex justify-content-center align-items-center vh-100"
                style={{
                    background: "linear-gradient(to bottom, #ffcc00 ,rgb(237, 228, 109) ,rgb(255, 254, 204))",
                }}
            >
                <div
                    className="card p-4"
                    style={{
                        maxWidth: "400px",
                        width: "100%",
                        backgroundColor: "#728367",
                        padding: "0px",
                        borderRadius: "12px",
                        marginTop: "-150px", // ลด mt ลง
                    }}
                >
                    <div className="text-center mb-4">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="mb-3"
                            style={{ height: "80px", margin: "25px" }} // ลด margin ลง
                        />
                        <h2 style={{ margin: "5px" }}>Login</h2> {/* ลด mt */}
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="Username" className="form-label fs-5">
                                Username
                            </label>
                            <input
                                type="text"
                                id="Username"
                                value={Username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-control"
                                placeholder="Username"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label fs-5">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control"
                                placeholder="Password"
                            />
                        </div>
                        {error && <p className="text-danger">{error}</p>}

                        {/* แสดงข้อความโลดดิ้ง */}
                        {loadingMessage && (
                            <p className="text-center text-info">{loadingMessage}</p>
                        )}

                        <button type="submit" className="btn btn-primary w-100">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
}

export default Login;
