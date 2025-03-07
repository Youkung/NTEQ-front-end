import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import "./Note.css";

const NotesPage = ({ userData: initialUserData = { name: "" } }) => {
  const [notes, setNotes] = useState([]);
  const [userName, setUserName] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setshowEditPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    images: [],
    date: "",
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [userData, setUserData] = useState(initialUserData);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    fetchNotes();
    fetchUserData();
  }, []);

  const fetchNotes = async (page = 1) => {
    try {
      const response = await fetch(`https://nteq-back-end.vercel.app/api/note?page=${page}`);
      const result = await response.json();
      setNotes(
        result.data.map((note) => ({
          id: note.Note_ID,
          title: note.Note_Head,
          content: note.Note,
          author: note.Name,
          userId: note.User_ID,
          date: note.Note_CreateDate,
          image: note.Note_Photo,
        }))
      );
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://nteq-back-end.vercel.app/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();
      setUserData({
        User_ID: userData.User_ID,
        username: userData.Username,
        name: userData.Name,
        email: userData.email,
        phone: userData.phone,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      console.log("File type:", file); // Log the file type
      if (!(file instanceof File)) {
        reject(new Error("Invalid file type"));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
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

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImageChunks = async (imageData) => {
    const chunkSize = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(imageData.length / chunkSize);
    const imageId = crypto.randomUUID();

    for (let i = 0; i < totalChunks; i++) {
      const chunk = imageData.slice(i * chunkSize, (i + 1) * chunkSize);
      const response = await fetch("https://nteq-back-end.vercel.app/api/upload-chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, chunk, chunkIndex: i, totalChunks }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image chunk");
      }
    }

    return `/uploads/${imageId}.jpg`;
  };

  const handleCreateNote = async () => {
    try {
      setUploadProgress(0);
      const totalImages = newNote.images.length;
      const imagePaths = [];

      // Compress images one by one and upload in chunks
      for (let i = 0; i < totalImages; i++) {
        const file = newNote.images[i].file; // Extract the file property
        const compressedImage = await compressImage(file);
        const imagePath = await uploadImageChunks(compressedImage.split(",")[1]); // Remove data URL prefix
        imagePaths.push(imagePath);
        setUploadProgress(((i + 1) / totalImages) * 100);
      }

      const noteData = {
        User_ID: userData.User_ID,
        Note_Head: newNote.title,
        Note: newNote.content,
        Note_CreateDate: new Date().toISOString().split("T")[0],
        Note_Images: imagePaths, // Send array of image paths
      };

      const response = await fetch("https://nteq-back-end.vercel.app/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      alert("Note created successfully!");
      setNewNote({ title: "", content: "", images: [], date: "" });
      setShowCreatePopup(false);
      setUploadProgress(0);
      await fetchNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Error creating note. Please try again.");
      setUploadProgress(0);
    }
  };

  const handleEditNote = async () => {
    try {
      setUploadProgress(0);
      const totalImages = newNote.images.length;
      const imagePaths = [];

      // Compress images one by one and upload in chunks
      for (let i = 0; i < totalImages; i++) {
        const compressedImage = await compressImage(newNote.images[i]);
        const imagePath = await uploadImageChunks(compressedImage.split(",")[1]); // Remove data URL prefix
        imagePaths.push(imagePath);
        setUploadProgress(((i + 1) / totalImages) * 100);
      }

      const noteData = {
        User_ID: userData.User_ID,
        Note_Head: newNote.title,
        Note: newNote.content,
        Note_CreateDate: new Date().toISOString().split("T")[0],
        Note_Images: imagePaths, // Send array of image paths
      };

      const response = await fetch(`https://nteq-back-end.vercel.app/api/note/${selectedNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      alert("Note updated successfully!");
      setNewNote({ title: "", content: "", images: [], date: "" });
      setshowEditPopup(false); // Hide edit popup
      setUploadProgress(0);
      await fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Error updating note. Please try again.");
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const maxFiles = 5; // Limit the number of files to 5
    if (files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }
    console.log('Selected files:', files); // Debug log
    setNewNote(prev => ({
      ...prev,
      images: [...prev.images, ...files.map(file => ({ file, url: URL.createObjectURL(file) }))]
    }));
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

  const handleEditClick = async (note) => {
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
      setNewNote({
        title: note.title,
        content: note.content,
        images: result.images.map(image => ({
          file: null, // No file object for existing images
          url: `https://nteq-back-end.vercel.app${image.Image_Path}`
        })),
        date: note.date,
      });
      setshowEditPopup(true); // Show edit popup instead of create popup
    } catch (error) {
      console.error("Error fetching note images:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handleCreateNoteClick = () => {
    setNewNote({ title: "", content: "", images: [], date: "" });
    setShowCreatePopup(true);
  };

  const handlePageChange = (pageNumber) => {
    fetchNotes(pageNumber);
  };

  const renderPagination = () => (
    <div className="d-flex justify-content-center mt-3">
      <nav>
        <ul className="pagination gap-2"> {/* เพิ่ม gap-2 */}
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
                className="page-link"
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

  useEffect(() => {
    // ดึงข้อมูลจาก localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData); // แปลงข้อมูลจาก JSON เป็นออบเจ็กต์
      setUserName(`${user.Name}`); // กำหนดชื่อผู้ใช้
    }
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
              <h1 className="fw-bold text-dark">บันทึกทั้งหมด</h1>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="outline-primary" as={Link} to="/user/my-notes">
                  ดูบันทึกของฉัน
                </Button>
                {/* Dropdown สำหรับเลือกประเภทการค้นหา */}
                <div className="col-md-3 d-flex ms-2">
                  <select className="form-select flex-grow-1">
                    <option value="all">ค้นหาทั้งหมด</option>
                    <option value="name">ค้นหาตามชื่อ</option>
                    <option value="type">ค้นหาตามประเภท</option>
                    <option value="brand">ค้นหาตามแบรนด์</option>
                  </select>
                </div>

                {/* ช่องค้นหา */}
                <div className="col-md-5 position-relative d-flex ms-2">
                  <input
                    type="text"
                    className="form-control flex-grow-1"
                    placeholder="พิมพ์คำค้นหา..."
                  />
                </div>

                {/* ปุ่มค้นหา */}
                <div className="col-md-auto d-flex m-2" style={{ flexGrow: 1.3 }}>
                  <button className="btn btn-primary w-100 m-0">ค้นหา</button>
                </div>
                <Button className="mt-0" variant="success" onClick={handleCreateNoteClick}>
                  สร้างบันทึกใหม่
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
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((note) => (
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
                          <Button
                            variant="info"
                            size="mก"
                            className="ms-2"
                            onClick={() => handleViewDetails(note)}
                          >
                            ดูรายละเอียด
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
              {renderPagination()}
            </div>
          </div>
        </div>

      </div>

      {/* Create Note Popup */}
      <Modal show={showCreatePopup} onHide={() => setShowCreatePopup(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>สร้างบันทึก</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="noteTitle">
              <Form.Label>หัวข้อเรื่อง</Form.Label>
              <Form.Control
                type="text"
                placeholder="หัวข้อเรื่อง"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="noteContent">
              <Form.Label>ข้อความ</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="ข้อความ"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="noteImages">
              <Form.Label>รูปภาพ</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileSelect}
                accept="image/*"
              />
              {newNote.images.length > 0 && (
                <div className="mt-2">
                  <small>Selected {newNote.images.length} images</small>
                  <div className="image-preview-container">
                    {newNote.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url || image.Image_Path}
                        alt={`Selected ${index}`}
                        className="image-preview"
                      />
                    ))}
                  </div>
                </div>
              )}
              {uploadProgress > 0 && (
                <div className="progress mt-2">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {Math.round(uploadProgress)}%
                  </div>
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreatePopup(false)}>
            ปิด
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateNote}
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Note Popup */}
      <Modal show={showEditPopup} onHide={() => setshowEditPopup(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="noteTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter note title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="noteContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter note content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="noteImages">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileSelect}
                accept="image/*"
              />
              {newNote.images.length > 0 && (
                <div className="mt-2">
                  <small>Selected {newNote.images.length} images</small>
                  <div className="image-preview-container">
                    {newNote.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url || image.Image_Path}
                        alt={`Selected ${index}`}
                        className="image-preview"
                      />
                    ))}
                  </div>
                </div>
              )}
              {uploadProgress > 0 && (
                <div className="progress mt-2">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {Math.round(uploadProgress)}%
                  </div>
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setshowEditPopup(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleEditNote}
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            Update Note
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Details and Edit Popup */}
      <Modal show={showDetailsPopup} onHide={() => setShowDetailsPopup(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>รายละเอียดบันทึก</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNote && (
            <div className="note-details">
              <div className="note-header">
                <h5>หัวข้อเรื่อง: {selectedNote.title}</h5>
                <p>
                  <strong>ผู้เขียน:</strong> {selectedNote.author}
                </p>
                <p>
                  <strong>วันที่เขียน:</strong>{" "}
                  {new Date(selectedNote.date).toLocaleDateString()}
                </p>
              </div>

              <div className="note-content mt-4">
                <p>
                  <strong>ข้อความ:</strong> {selectedNote.content}
                </p>
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
            variant="secondary"
            onClick={() => setShowDetailsPopup(false)}
          >
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotesPage;
