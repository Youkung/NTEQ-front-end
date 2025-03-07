import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import "bootstrap/dist/css/bootstrap.min.css";

function Roomdetail() {
    const { id } = useParams();
    const [objects, setObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newObject, setNewObject] = useState({
        objectName: '',
        objectType: '',
        objectOthers: ''
    });
    const [editingObject, setEditingObject] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    // Updated useEffect with better error handling and logging
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log('Fetching objects for room:', id);
                const objectsResponse = await fetch(`http://localhost:8080/api/rooms/${id}/objects`);

                if (!objectsResponse.ok) {
                    throw new Error(`HTTP error! status: ${objectsResponse.status}`);
                }

                const objectsData = await objectsResponse.json();
                console.log('Received objects data:', objectsData);

                if (!Array.isArray(objectsData)) {
                    console.error('Received non-array data:', objectsData);
                    throw new Error('Invalid data format received');
                }

                setObjects(objectsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

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
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        window.location.href = "/"; // เปลี่ยนหน้าโดยตรง
    };

    // Updated handleAddObject with proper request body
    const handleAddObject = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/objects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId: id,
                    nodeName: '', // Add these required fields
                    nodeLocation: '',
                    nodeBuilding: '',
                    objectName: newObject.objectName,
                    objectType: newObject.objectType,
                    objectOthers: newObject.objectOthers
                })
            });

            if (response.ok) {
                const objectsResponse = await fetch(`http://localhost:8080/api/rooms/${id}/objects`);
                const objectsData = await objectsResponse.json();
                setObjects(objectsData);
                setShowModal(false);
                setNewObject({ objectName: '', objectType: '', objectOthers: '' });
            } else {
                const errorData = await response.json();
                console.error('Error adding object:', errorData);
            }
        } catch (error) {
            console.error('Error adding object:', error);
        }
    };

    const handleEditObject = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/objects/${editingObject.Object_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    objectName: editingObject.Object_Name,
                    objectType: editingObject.Object_Type,
                    objectOthers: editingObject.Object_Others
                })
            });

            if (response.ok) {
                const objectsResponse = await fetch(`http://localhost:8080/api/rooms/${id}/objects`);
                const objectsData = await objectsResponse.json();
                setObjects(objectsData);
                setShowEditModal(false);
                setEditingObject(null);
            }
        } catch (error) {
            console.error('Error updating object:', error);
        }
    };

    const handleDeleteObject = async (objectId) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้?')) {
            try {
                const response = await fetch(`http://localhost:8080/api/objects/${objectId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const objectsResponse = await fetch(`http://localhost:8080/api/rooms/${id}/objects`);
                    const objectsData = await objectsResponse.json();
                    setObjects(objectsData);
                } else {
                    const error = await response.json();
                    alert(error.message || 'ไม่สามารถลบอุปกรณ์ได้');
                }
            } catch (error) {
                console.error('Error deleting object:', error);
                alert('เกิดข้อผิดพลาดในการลบอุปกรณ์');
            }
        }
    };

    const handleViewRack = (objectId) => {
        navigate(`/admin/rackdetail/${objectId}`);
    };

    const renderObjectCard = (object) => {
        console.log('Rendering object:', object);
        return (
            <div className="col-md-3 mb-4" key={object.Object_ID}>
                <div
                    className="card h-100 border border-secondary transition"
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease-in-out' }}
                    onClick={() => handleViewRack(object.Object_ID)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.borderColor = '#007bff'; // เปลี่ยนเป็นสี primary
                        e.currentTarget.style.backgroundColor = '#f8f9fa'; // เทาอ่อน Bootstrap
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#6c757d'; // สีเดิม
                        e.currentTarget.style.backgroundColor = '#fff'; // พื้นหลังเดิม
                    }}
                >
                    <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{object.Object_Name}</h5>
                        <p className="card-text">ประเภท: {object.Object_Type || 'N/A'}</p>
                        <p className="card-text">
                            จำนวนอุปกรณ์: {object.item_count ?? '0'}
                        </p>
                        {object.Object_Others && (
                            <p className="card-text">หมายเหตุ: {object.Object_Others}</p>
                        )}
                        <div className="mt-auto align-self-end">
                            <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingObject(object);
                                    setShowEditModal(true);
                                }}
                            >
                                <i className="bi bi-pencil"></i> แก้ไข
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteObject(object.Object_ID);
                                }}
                            >
                                <i className="bi bi-trash"></i> ลบ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    if (loading) return <div>Loading...</div>;

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

                <div className="flex-grow-1 d-flex flex-column" style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}>
                    <div className="p-4">
                        <div className="bg-white p-4 rounded shadow-sm">
                            {/* ปรับปุ่มกลับให้อยู่ข้างบน */}
                            <Link to="/admin/Room">
                                <img src="https://cdn-icons-png.flaticon.com/128/151/151846.png" alt="back-icon" style={{ width: '20px', height: '20px' }} />
                            </Link>

                            <div className="container">
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <h1>ตู้แร็ค</h1>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowModal(true)}
                                    >
                                        เพิ่มตู้แร๊ค
                                    </button>
                                </div>

                                <div className="container border rounded p-4 mt-4">
                                    <div className="row">
                                        {objects.map(object => renderObjectCard(object))}
                                    </div>

                                    {/* Edit Modal */}
                                    <div className={`modal ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1">
                                        <div className="modal-dialog modal-xl modal-dialog-centered">
                                            <div className="modal-content shadow-lg border-0">
                                                <div className="modal-header bg-primary text-white">
                                                    <h5 className="modal-title">แก้ไขอุปกรณ์</h5>
                                                    <button type="button" className="btn-close btn-close-white" onClick={() => {
                                                        setShowEditModal(false);
                                                        setEditingObject(null);
                                                    }}></button>
                                                </div>
                                                <div className="modal-body">
                                                    <form onSubmit={handleEditObject}>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">ชื่ออุปกรณ์</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editingObject?.Object_Name || ''}
                                                                onChange={(e) => setEditingObject({
                                                                    ...editingObject,
                                                                    Object_Name: e.target.value
                                                                })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">ประเภท</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editingObject?.Object_Type || ''}
                                                                onChange={(e) => setEditingObject({
                                                                    ...editingObject,
                                                                    Object_Type: e.target.value
                                                                })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">หมายเหตุ</label>
                                                            <textarea
                                                                className="form-control"
                                                                value={editingObject?.Object_Others || ''}
                                                                onChange={(e) => setEditingObject({
                                                                    ...editingObject,
                                                                    Object_Others: e.target.value
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" onClick={() => {
                                                                setShowEditModal(false);
                                                                setEditingObject(null);
                                                            }}>ยกเลิก</button>
                                                            <button type="submit" className="btn btn-success">บันทึก</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {showEditModal && <div className="modal-backdrop show"></div>}

                                    {/* Modal for adding new object */}
                                    <div className={`modal ${showModal ? 'show d-block' : ''}`} tabIndex="-1">
                                        <div className="modal-dialog modal-xl modal-dialog-centered">
                                            <div className="modal-content shadow-lg border-0">
                                                <div className="modal-header bg-success text-white">
                                                    <h5 className="modal-title">เพิ่มตู้แร๊ค</h5>
                                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                                </div>
                                                <div className="modal-body">
                                                    <form onSubmit={handleAddObject}>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">ชื่อแร็ค</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={newObject.objectName}
                                                                onChange={(e) => setNewObject({ ...newObject, objectName: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">ประเภท</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={newObject.objectType}
                                                                onChange={(e) => setNewObject({ ...newObject, objectType: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">หมายเหตุ</label>
                                                            <textarea
                                                                className="form-control"
                                                                value={newObject.objectOthers}
                                                                onChange={(e) => setNewObject({ ...newObject, objectOthers: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="modal-footer">
                                                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                                            <button type="submit" className="btn btn-success">บันทึก</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {showModal && <div className="modal-backdrop show"></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Roomdetail;
