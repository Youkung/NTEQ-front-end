import React, { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import logo from "../Logo/Fulllogo.png";
import "./side.css"
import { Link } from "react-router-dom";

function MyNotesPage() {
    const [notes, setNotes] = useState([]);
    const [userId, setUserId] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [showDetailsPopup, setShowDetailsPopup] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [editImages, setEditImages] = useState([]);
    const [userName, setUserName] = useState("");
    const token = localStorage.getItem('token');
    const [newImages, setNewImages] = useState([]);

    // Add pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]);

    useEffect(() => {
        if (userId) {
            fetchNotes();
        }
    }, [userId]);

    const fetchUserData = async () => {
        try {
            if (!token) {
                console.error('No token found');
                handleLogout();
                return;
            }

            const response = await fetch('https://nteq-back-end.vercel.app/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const userData = await response.json();
            if (userData.User_ID) {
                setUserId(userData.User_ID);
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            handleLogout();
        }
    };

    const fetchNotes = async (page = 1) => {
        try {
            if (!userId) return;

            const response = await fetch(`https://nteq-back-end.vercel.app/api/note/user/${userId}?page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.data) {
                setNotes(result.data.map(note => ({
                    id: note.Note_ID,
                    title: note.Note_Head,
                    content: note.Note,
                    date: note.Note_CreateDate,
                    author: note.author,
                    Note_Photo: note.Note_Photo
                })));
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        window.location.href = "/";
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                const response = await fetch(`https://nteq-back-end.vercel.app/api/note/${noteId}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error("Failed to delete note");
                }
                setNotes(notes.filter((note) => note.id !== noteId));
                alert("Note deleted successfully!");
            } catch (error) {
                console.error("Error deleting note:", error);
                alert("Error deleting note. Please try again.");
            }
        }
    };

    const handleViewDetails = async (note) => {
        try {
            const response = await fetch(`https://nteq-back-end.vercel.app/api/note/images/${note.id}`);
            const result = await response.json();
            setSelectedNote({
                ...note,
                images: result.images.map(image => ({
                    ...image,
                    Image_Path: `https://nteq-back-end.vercel.app${image.Image_Path}`
                })),
            });
            setShowDetailsPopup(true);
        } catch (error) {
            console.error("Error fetching note images:", error);
        }
    };

    const handleEdit = async (note) => {
        try {
            const response = await fetch(`https://nteq-back-end.vercel.app/api/note/images/${note.id}`);
            const result = await response.json();
            
            setEditNote({
                ...note,
                images: result.images || []
            });
            
            // Set edit images with proper URL formatting
            setEditImages(
                result.images.map(image => ({
                    ...image,
                    Image_Path: `https://nteq-back-end.vercel.app${image.Image_Path}`,
                    isExisting: true
                })) || []
            );
            
            setShowEditModal(true);
        } catch (error) {
            console.error("Error fetching note details:", error);
            alert("ไม่สามารถโหลดข้อมูลบันทึกได้ กรุณาลองใหม่");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const imagePaths = [];
            const formData = new FormData();

            // Process existing images
            for (const image of editImages) {
                if (image.isExisting) {
                    imagePaths.push(image.Image_Path.replace('https://nteq-back-end.vercel.app', ''));
                }
            }

            // Process new images
            for (const file of newImages) {
                const imageId = crypto.randomUUID();
                const compressedImage = await compressImage(file);
                const chunk = compressedImage.split(',')[1];
                
                const response = await fetch('https://nteq-back-end.vercel.app/api/upload-chunk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageId,
                        chunk,
                        chunkIndex: 0,
                        totalChunks: 1
                    })
                });

                if (!response.ok) throw new Error('Image upload failed');
                imagePaths.push(`/uploads/${imageId}.jpg`);
            }

            // Update note with new data
            const response = await fetch(`https://nteq-back-end.vercel.app/api/note/${editNote.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    User_ID: userId,
                    Note_Head: editNote.title,
                    Note: editNote.content,
                    Note_CreateDate: editNote.date,
                    Note_Images: imagePaths
                })
            });

            if (!response.ok) throw new Error('Failed to update note');

            // Clean up and refresh
            setShowEditModal(false);
            setNewImages([]);
            setEditImages([]);
            fetchNotes();
            alert('อัปเดตบันทึกสำเร็จ');

        } catch (error) {
            console.error('Error updating note:', error);
            alert('ไม่สามารถอัปเดตบันทึกได้ กรุณาลองใหม่');
        }
    };

    const renderTableRow = (note) => (
        <tr key={note.id}>
            <td>{note.title}</td>
            <td>{note.author}</td>
            <td>
                {new Date(note.date).toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })}
            </td>
            <td>
                <Button variant="info" size="md" className="me-2" onClick={() => handleViewDetails(note)}>
                    รายละเอียด
                </Button>
                <Button variant="danger" size="md" onClick={() => handleDeleteNote(note.id)}>
                    ลบ
                </Button>
            </td>
        </tr>
    );

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxFiles = 5 - editImages.length;

        if (files.length > maxFiles) {
            alert(`สามารถเพิ่มรูปได้อีกไม่เกิน ${maxFiles} รูป`);
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                alert(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`);
                return false;
            }
            return true;
        });

        setNewImages(prev => [...prev, ...validFiles]);
    };

    const handleRemoveImage = (image) => {
        if (image.isExisting) {
            setEditImages(prev => prev.filter(img => img.Image_Path !== image.Image_Path));
        } else {
            setNewImages(prev => prev.filter(img => img !== image));
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 800;
                    const maxHeight = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = height * (maxWidth / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = width * (maxHeight / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleAddImages = () => {
        const newImageData = newImages.map((file) => ({
            Image_ID: Date.now(), // or a unique ID from the server
            Image_Path: URL.createObjectURL(file),
        }));
        setEditImages((prevImages) => [...prevImages, ...newImageData]);
        setNewImages([]);
    };

    const renderEditModal = () => (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>แก้ไขบันทึก</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {editNote && (
                    <form onSubmit={handleEditSubmit}>
                        <div className="mb-3">
                            <label className="form-label">หัวข้อเรื่อง</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editNote.title}
                                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">ข้อความ</label>
                            <textarea
                                className="form-control"
                                rows={5}
                                value={editNote.content}
                                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">รูปภาพ</label>
                            <div className="image-preview-container d-flex flex-wrap gap-2">
                                {/* Existing Images */}
                                {editImages.map((image, index) => (
                                    <div key={`existing-${index}`} className="position-relative">
                                        <img
                                            src={image.Image_Path}
                                            alt={`Existing ${index + 1}`}
                                            className="preview-image"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0"
                                            onClick={() => handleRemoveImage(image)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                                {/* New Images Preview */}
                                {newImages.map((file, index) => (
                                    <div key={`new-${index}`} className="position-relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`New ${index + 1}`}
                                            className="preview-image"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0"
                                            onClick={() => handleRemoveImage(file)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="form-control mt-2"
                                disabled={editImages.length + newImages.length >= 5}
                            />
                            <small className="text-muted">
                                สามารถอัปโหลดได้สูงสุด 5 รูป (ขนาดไฟล์ไม่เกิน 5MB ต่อรูป)
                            </small>
                        </div>
                        <div className="text-end mt-3">
                            <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                                ยกเลิก
                            </Button>
                            <Button variant="primary" type="submit">
                                บันทึก
                            </Button>
                        </div>
                    </form>
                )}
            </Modal.Body>
        </Modal>
    );

    useEffect(() => {
        // ดึงข้อมูลจาก localStorage
        const userData = localStorage.getItem("userData");
        if (userData) {
            const user = JSON.parse(userData); // แปลงข้อมูลจาก JSON เป็นออบเจ็กต์
            setUserName(`${user.Name}`); // กำหนดชื่อผู้ใช้
        }
    }, []);

    // Add pagination handlers
    const handlePageChange = (pageNumber) => {
        fetchNotes(pageNumber);
    };

    // Add pagination component
    const renderPagination = () => (
        <div className="d-flex justify-content-center mt-3">
            <nav>
                <ul className="pagination gap-2"> {/* เพิ่ม gap-2 ให้เว้นระยะปุ่ม */}
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                        >
                            ก่อนหน้า
                        </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                        <li
                            key={i + 1}
                            className={`page-item ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                        >
                            <button
                                className="page-link mx-1" // เพิ่ม mx-1 ให้แต่ละปุ่มห่างกัน
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                        >
                            ถัดไป
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );

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

                <div
                    className="flex-grow-1 d-flex flex-column"
                    style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}
                >
                    <div className="p-4">
                        <div className="bg-white p-4 rounded shadow-sm">
                            <h1>บันทึกของฉัน</h1>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Button variant="outline-primary" as={Link} to="/user/Note">
                                    ดูบันทึกทั้งหมด
                                </Button>
                            </div>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th style={{ width: "30%" }}>เรื่อง</th>
                                        <th style={{ width: "30%" }}>ชื่อผู้เขียน</th>
                                        <th style={{ width: "20%" }}>วันที่เขียน</th>
                                        <th style={{ width: "20%" }}>การดำเนินการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notes
                                        .slice()
                                        .sort((a, b) => new Date(b.date) - new Date(a.date)) // เรียงลำดับจากใหม่ไปเก่า
                                        .map(renderTableRow)}
                                </tbody>
                            </Table>
                            {renderPagination()}
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showDetailsPopup} onHide={() => setShowDetailsPopup(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>รายละเอียด</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNote && (
                        <div className="note-details">
                            <div className="note-header">
                                <h5>หัวข้อเรื่อง: {selectedNote.title}</h5>
                                <p><strong>ผู้เขียน:</strong> {selectedNote.author}</p>
                                <p><strong>วันที่เขียน:</strong> {new Date(selectedNote.date).toLocaleDateString()}</p>
                            </div>

                            <div className="note-content mt-4">
                                <p><strong>ข้อความ:</strong> {selectedNote.content}</p>
                            </div>

                            <div className="note-images mt-4">
                                <strong>รูปภาพ:</strong>
                                <div className="image-gallery">
                                    {selectedNote.images && selectedNote.images.length > 0 ? (
                                        selectedNote.images.map((image) => (
                                            <img
                                                key={image.Image_ID}
                                                src={image.Image_Path}
                                                alt={`Note image`}
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                    objectFit: "cover",
                                                    margin: "5px",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <p>ไม่มีรูปภาพ</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => {
                            setShowDetailsPopup(false);
                            handleEdit(selectedNote);
                        }}
                    >
                        แก้ไข
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDetailsPopup(false)}>
                        ปืด
                    </Button>
                </Modal.Footer>
            </Modal>
            {renderEditModal()}
        </div>
    );
}

export default MyNotesPage;
