import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import "bootstrap/dist/css/bootstrap.min.css";

const RackDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Add this
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userName, setUserName] = useState("");
    const [roomId, setRoomId] = useState(null); // Add this
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({
        Serial_Number: '',
        Item_Status: '',
        Item_Others: '',
        Item_CreateDate: '' // Add this field
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [addForm, setAddForm] = useState({
        Equipe_ID: '',
        Serial_Number: '',
        Item_Status: 'active',
        Item_Others: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // First fetch object details to get room ID
                const objectResponse = await fetch(`https://nteq-back-end.vercel.app/api/object/${id}`);
                const objectData = await objectResponse.json();
                if (objectData.success) {
                    setRoomId(objectData.data.Room_ID);
                }

                // Then fetch items
                const itemsResponse = await fetch(`https://nteq-back-end.vercel.app/api/objects/${id}/items`);
                const itemsData = await itemsResponse.json();
                if (itemsData.success) {
                    setItems(itemsData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
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

    useEffect(() => {
        const fetchAvailableEquipment = async () => {
            try {
                const response = await fetch('https://nteq-back-end.vercel.app/api/available-equipment');
                const data = await response.json();
                if (data.success) {
                    setAvailableEquipment(data.data);
                }
            } catch (error) {
                console.error('Error fetching available equipment:', error);
            }
        };

        if (showAddModal) {
            fetchAvailableEquipment();
        }
    }, [showAddModal]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        window.location.href = "/"; // เปลี่ยนหน้าโดยตรง
    };

    const handleBack = () => {
        if (roomId) {
            navigate(`/admin/adminRoomdetail/${roomId}`);
        } else {
            navigate('/admin/Room'); // Fallback if no roomId
        }
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setEditForm({
            Serial_Number: item.Serial_Number,
            Item_Status: item.Item_Status,
            Item_Others: item.Item_Others || '',
            Item_CreateDate: item.Item_CreateDate ? item.Item_CreateDate.split('T')[0] : '' // Format date
        });
        setShowEditModal(true);
    };

    const handleDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await fetch(`https://nteq-back-end.vercel.app/api/item/${selectedItem.Item_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...editForm,
                    Object_ID: selectedItem.Object_ID,
                    Item_CreateDate: editForm.Item_CreateDate // Include date in request
                })
            });

            if (response.ok) {
                // Refresh items list
                const itemsResponse = await fetch(`https://nteq-back-end.vercel.app/api/objects/${id}/items`);
                const itemsData = await itemsResponse.json();
                if (itemsData.success) {
                    setItems(itemsData.data);
                }
                setShowEditModal(false);
            } else {
                alert('Failed to update item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Error updating item');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`https://nteq-back-end.vercel.app/api/item/${selectedItem.Item_ID}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                // Remove item from list
                setItems(items.filter(item => item.Item_ID !== selectedItem.Item_ID));
                setShowDeleteModal(false);
                alert('ลบอุปกรณ์สำเร็จ');
            } else {
                alert(data.message || 'Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('เกิดข้อผิดพลาดในการลบอุปกรณ์');
        }
    };

    const handleAddSubmit = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            const response = await fetch(`https://nteq-back-end.vercel.app/api/objects/${id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...addForm,
                    User_ID: userData.User_ID
                })
            });

            const data = await response.json();

            if (data.success) {
                // Refresh items list
                const itemsResponse = await fetch(`https://nteq-back-end.vercel.app/api/objects/${id}/items`);
                const itemsData = await itemsResponse.json();
                if (itemsData.success) {
                    setItems(itemsData.data);
                }
                setShowAddModal(false);
                setAddForm({
                    Equipe_ID: '',
                    Serial_Number: '',
                    Item_Status: 'active',
                    Item_Others: ''
                });
                alert('เพิ่มอุปกรณ์สำเร็จ');
            } else {
                alert(data.message || 'Failed to add equipment');
            }
        } catch (error) {
            console.error('Error adding equipment:', error);
            alert('Error adding equipment');
        }
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
                            {/* Replace Link with button */}
                            <button
                                onClick={handleBack}
                                className="btn btn-link p-0"
                                style={{ border: 'none', background: 'none' }}
                            >
                                <img
                                    src="https://cdn-icons-png.flaticon.com/128/151/151846.png"
                                    alt="back-icon"
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </button>

                            <div className="container py-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h1>อุปกรณ์</h1>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        เพิ่มอุปกรณ์
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="form-control mb-4"
                                    placeholder="Search by equipment name or serial number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                <div className="row">
                                    {items
                                        .filter(item =>
                                            item.Serial_Number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.Equipe_Name?.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((item) => (
                                            <div key={item.Item_ID} className="col-md-4 mb-4">
                                                <div className="card h-100">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{item.Equipe_Name}</h5>
                                                        <p><strong>เลขอุปกรณ์:</strong> {item.Serial_Number}</p>
                                                        <p><strong>ยี่ห้อ:</strong> {item.Brand}</p>
                                                        <p><strong>รุ่น:</strong> {item.Model_Number}</p>
                                                        <p className={`card-text ${item.Item_Status === 'active' ? 'text-success' : 'text-danger'}`}>
                                                            <strong>สถานะ:</strong> {item.Item_Status}
                                                        </p>
                                                        <p><strong>รายละเอียด:</strong> {item.Item_Others || '-'}</p>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-warning"
                                                                onClick={() => handleEdit(item)}
                                                            >
                                                                แก้ไข
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => handleDelete(item)}
                                                            >
                                                                ลบ
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* โมเดลสำหรับเพิ่มอุปกรณ์ */}
                                <div className={`modal ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1">
                                    <div className="modal-dialog modal-xl modal-dialog-centered">
                                        <div className="modal-content shadow-lg border-0">
                                            <div className="modal-header bg-primary text-white">
                                                <h5 className="modal-title">เพิ่มอุปกรณ์</h5>
                                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">อุปกรณ์</label>
                                                    <select
                                                        className="form-select"
                                                        value={addForm.Equipe_ID}
                                                        onChange={(e) => setAddForm({ ...addForm, Equipe_ID: e.target.value })}
                                                    >
                                                        <option value="">เลือกอุปกรณ์</option>
                                                        {availableEquipment.map(equip => (
                                                            <option key={equip.Equipe_ID} value={equip.Equipe_ID}>
                                                                {equip.Equipe_Name} - {equip.Brand} ({equip.Model_Number})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">หมายเลขซีเรียล</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={addForm.Serial_Number}
                                                        onChange={(e) => setAddForm({ ...addForm, Serial_Number: e.target.value })}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">สถานะ</label>
                                                    <select
                                                        className="form-select"
                                                        value={addForm.Item_Status}
                                                        onChange={(e) => setAddForm({ ...addForm, Item_Status: e.target.value })}
                                                    >
                                                        <option value="active">active</option>
                                                        <option value="inactive">inactive</option>
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">หมายเหตุ</label>
                                                    <textarea
                                                        className="form-control"
                                                        value={addForm.Item_Others}
                                                        onChange={(e) => setAddForm({ ...addForm, Item_Others: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                                    ยกเลิก
                                                </button>
                                                <button type="button" className="btn btn-primary" onClick={handleAddSubmit}>
                                                    เพิ่มอุปกรณ์
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {showAddModal && <div className="modal-backdrop show"></div>}


                                {/* โมเดลแก้ไขข้อมูล */}
                                <div className={`modal ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1">
                                    <div className="modal-dialog modal-xl modal-dialog-centered">
                                        <div className="modal-content shadow-lg border-0">
                                            <div className="modal-header bg-warning text-white">
                                                <h5 className="modal-title">แก้ไขข้อมูล</h5>
                                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">หมายเลขซีเรียล</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editForm.Serial_Number}
                                                        onChange={(e) => setEditForm({ ...editForm, Serial_Number: e.target.value })}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">สถานะ</label>
                                                    <select
                                                        className="form-select"
                                                        value={editForm.Item_Status}
                                                        onChange={(e) => setEditForm({ ...editForm, Item_Status: e.target.value })}
                                                    >
                                                        <option value="active">active</option>
                                                        <option value="inactive">inactive</option>
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">หมายเหตุ</label>
                                                    <textarea
                                                        className="form-control"
                                                        value={editForm.Item_Others}
                                                        onChange={(e) => setEditForm({ ...editForm, Item_Others: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                                    ยกเลิก
                                                </button>
                                                <button type="button" className="btn btn-warning text-white" onClick={handleEditSubmit}>
                                                    บันทึกการเปลี่ยนแปลง
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {showEditModal && <div className="modal-backdrop show"></div>}


                                {/* โมเดลยืนยันการลบ */}
                                <div className={`modal ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1">
                                    <div className="modal-dialog modal-lg modal-dialog-centered">
                                        <div className="modal-content shadow-lg border-0">
                                            <div className="modal-header bg-danger text-white">
                                                <h5 className="modal-title">
                                                    <i className="bi bi-exclamation-triangle-fill me-2"></i> ยืนยันการลบ
                                                </h5>
                                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                                            </div>
                                            <div className="modal-body text-center">
                                                <p className="fs-5 fw-bold text-danger">คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</p>
                                                <p className="text-muted">หากลบแล้วจะไม่สามารถกู้คืนได้</p>
                                            </div>
                                            <div className="modal-footer justify-content-center">
                                                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowDeleteModal(false)}>
                                                    ยกเลิก
                                                </button>
                                                <button type="button" className="btn btn-danger px-4" onClick={handleDeleteConfirm}>
                                                    ลบข้อมูล
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* โมเดล Backdrop */}
                                {(showEditModal || showDeleteModal || showAddModal) && <div className="modal-backdrop show"></div>}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RackDetail;
