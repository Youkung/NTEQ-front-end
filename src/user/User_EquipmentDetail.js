import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import logo from "../Logo/Fulllogo.png";
import "./side.css";

function EquipmentDetail() {
    const { id } = useParams();
    const [equipmentDetails, setEquipmentDetails] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [updatedStatus, setUpdatedStatus] = useState("");
    const [updatedNotes, setUpdatedNotes] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch equipment details and its items
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch equipment details
                const equipResponse = await fetch(`http://localhost:8080/api/equipement/${id}`);
                const equipData = await equipResponse.json();
                setEquipmentDetails(equipData);

                // Fetch items with pagination and search
                const searchQuery = searchTerm ? `&search=${searchTerm}` : '';
                const itemsResponse = await fetch(
                    `http://localhost:8080/api/items/${id}?page=${currentPage}${searchQuery}`
                );
                const data = await itemsResponse.json();
                setItems(data.items);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentPage, searchTerm]);

    useEffect(() => {
        // ดึงข้อมูลจาก localStorage
        const userData = localStorage.getItem("userData");
        if (userData) {
            const user = JSON.parse(userData); // แปลงข้อมูลจาก JSON เป็นออบเจ็กต์
            setUserName(`${user.Name}`); // กำหนดชื่อผู้ใช้
        }
    }, []);

    const handleEdit = (item) => {
        setSelectedItem(item);
        setUpdatedStatus(item.Item_Status);
        setUpdatedNotes(item.Item_Others || "");
        setShowPopup(true);
    };

    const handleSave = async () => {
        if (!selectedItem) return;

        try {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (!userData || !userData.User_ID) {
                throw new Error('User data not found');
            }

            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Create history entry first
            const historyResponse = await fetch('http://localhost:8080/api/changestatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    User_ID: userData.User_ID,
                    Equipe_ID: id,
                    Item_ID: selectedItem.Item_ID,
                    Object_ID: selectedItem.Object_ID,
                    Item_history_CreateDate: currentDate,
                    Item_history_Other: updatedNotes || '',
                    Item_history_Status: updatedStatus
                })
            });

            if (!historyResponse.ok) {
                const errorData = await historyResponse.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            // Update local state
            const updatedItems = items.map(item =>
                item.Item_ID === selectedItem.Item_ID
                    ? { ...item, Item_Status: updatedStatus, Item_Others: updatedNotes }
                    : item
            );
            setItems(updatedItems);
            setShowPopup(false);

            // Show success message
            alert('บันทึกการเปลี่ยนแปลงสำเร็จ');

            // Refresh data
            const itemsResponse = await fetch(`http://localhost:8080/api/items/${id}`);
            const itemsData = await itemsResponse.json();
            setItems(itemsData);

        } catch (error) {
            console.error('Error updating status:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error.message || 'Unknown error'));
        }
    };

    // ฟังก์ชัน logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        window.location.href = "/"; // เปลี่ยนหน้าโดยตรง
    };

    // Get status class based on item status
    const getStatusClass = (status) => {
        return status === "active" ? "text-success" : "text-danger";
    };

    if (loading) return <div>Loading...</div>;
    if (!equipmentDetails) return <div>Equipment not found</div>;

    return (
        <div className="d-flex vh-100 flex-column">
            <div className="d-flex align-items-center px-4 py-2 bg-light border-bottom" style={{ height: "80px" }}>
                <img src={logo} alt="Logo" style={{ height: "50px", width: "auto" }} className="ms-5 me-2" />
                <div className="ms-auto d-flex align-items-center">
                    <span className="me-3">{userName || "Loading..."}</span> {/* แสดงชื่อผู้ใช้ */}
                    <img src="https://static.vecteezy.com/system/resources/previews/009/749/751/non_2x/avatar-man-icon-cartoon-male-profile-mascot-illustration-head-face-business-user-logo-free-vector.jpg" alt="Profile" className="rounded-circle" style={{ height: "40px", width: "40px" }} />
                </div>
            </div>

            <div className="d-flex flex-grow-1">
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

                <div className="flex-grow-1 d-flex flex-column" style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}>
                    <div className="p-4">
                        <div className="bg-white p-4 rounded shadow-sm">
                            {/* ปรับปุ่มกลับให้อยู่ข้างบน */}
                            <Link to="/user/Equipment">
                                <img src="https://cdn-icons-png.flaticon.com/128/151/151846.png" alt="back-icon" style={{ width: '20px', height: '20px' }} />
                            </Link>

                            <div className="container py-4">
                                <h1 className="mb-3">{equipmentDetails.Equipe_Name}</h1>
                                <div className="mb-4">
                                    <p><strong>ประเภท:</strong> {equipmentDetails.Equipe_Type}</p>
                                    <p><strong>ยี่ห้อ:</strong> {equipmentDetails.Brand}</p>
                                    <p><strong>รุ่น:</strong> {equipmentDetails.Model_Number}</p>
                                </div>

                                <input
                                    type="text"
                                    className="form-control mb-4"
                                    placeholder="Search by serial number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                <div className="row">
                                    {items.map((item) => (
                                        <div key={item.Item_ID} className="col-md-4 mb-4">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h5 className="card-title">เลขรุ่น: {item.Serial_Number}</h5>
                                                    <p><strong>ยี่ห้อ:</strong> {item.Branch_Location}</p>
                                                    <p><strong>อาคาร:</strong> {item.Building_Name}</p>
                                                    <p><strong>ห้อง:</strong> {item.Room_Name}</p>
                                                    <p><strong>แร็ค:</strong></p>
                                                    <p className={`card-text ${getStatusClass(item.Item_Status)}`}>
                                                        <strong>สถานะ:</strong> {item.Item_Status}
                                                    </p>
                                                    <p><strong>รายละเอียด:</strong> {item.Item_Others || 'No notes'}</p>
                                                    <button className="btn btn-primary" onClick={() => handleEdit(item)}>Change</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <nav>
                                            <ul className="pagination">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button 
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>

                                                {[...Array(totalPages)].map((_, idx) => (
                                                    <li 
                                                        key={idx + 1} 
                                                        className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(idx + 1)}
                                                        >
                                                            {idx + 1}
                                                        </button>
                                                    </li>
                                                ))}

                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </div>

                            {showPopup && (
                                <div className="popup-overlay d-flex justify-content-center align-items-center position-fixed top-0 left-0 w-100 h-100 bg-dark bg-opacity-50">
                                    <div className="popup bg-white p-4 rounded shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
                                        <h2 className="mb-3">Edit Item</h2>
                                        <div className="mb-3">
                                            <label className="form-label">Status:</label>
                                            <select className="form-select" value={updatedStatus} onChange={(e) => setUpdatedStatus(e.target.value)}>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Notes:</label>
                                            <textarea className="form-control" value={updatedNotes} onChange={(e) => setUpdatedNotes(e.target.value)} />
                                        </div>
                                        <div className="d-flex justify-content-between mt-3">
                                            <button className="btn btn-success" onClick={handleSave}>Save</button>
                                            <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EquipmentDetail;
