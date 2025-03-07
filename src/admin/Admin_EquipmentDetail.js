import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import "./EquipmentDetail.css"

function EquipmentDetail() {
  const { id } = useParams();
  // Initialize state with empty arrays/objects
  const [detail, setDetail] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showMoreDetailPopup, setShowMoreDetailPopup] = useState(false);
  const [newEquipment, setNewEquipment] = useState({});
  const [items, setItems] = useState([]); // Initialize with empty array
  const [selectedItem, setSelectedItem] = useState(null);
  const [userName, setUserName] = useState("");
  const [nodes, setNodes] = useState([]); // Initialize with empty array
  const [rooms, setRooms] = useState([]); // Initialize with empty array
  const [objects, setObjects] = useState([]); // Initialize with empty array
  const [itemHistory, setItemHistory] = useState([]); // Initialize with empty array
  const [searchSerialNumber, setSearchSerialNumber] = useState("");
  const [searchNodeName, setSearchNodeName] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [searchObject, setSearchObject] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [branchSuggestions, setBranchSuggestions] = useState([]);
  const [nodeSuggestions, setNodeSuggestions] = useState([]);
  const [roomSuggestions, setRoomSuggestions] = useState([]);
  const [objectSuggestions, setObjectSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Fix the userData parsing
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData && userData.Name) {
      setUserName(userData.Name);
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
    const fetchDetail = async () => {
      try {
        const equipmentResponse = await axios.get(
          `https://nteq-back-end.vercel.app/api/equipement/${id}`
        );
        setDetail(equipmentResponse.data);

        // Fetch items for this equipment
        const itemsResponse = await axios.get(
          `https://nteq-back-end.vercel.app/api/items/${id}`
        );

        // Ensure we're getting an array from the response
        const fetchedItems = itemsResponse.data?.items || [];
        setItems(Array.isArray(fetchedItems) ? fetchedItems : []);

      } catch (error) {
        console.error("Error fetching data:", error);
        setItems([]); // Set empty array on error
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await axios.get("https://nteq-back-end.vercel.app/api/nodes");
        setNodes(response.data.data);
      } catch (error) {
        console.error("Error fetching nodes:", error);
      }
    };
    fetchNodes();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const newItem = {
        User_ID: userData.User_ID,
        Equipe_ID: id,
        Serial_Number: newEquipment.serialNumber,
        Item_Status: newEquipment.status,
        Object_ID: newEquipment.objectId,
        Item_Others: newEquipment.details || '',
        Item_CreateDate: new Date().toISOString().slice(0, 10),
      };

      // Validate required fields
      const requiredFields = [
        "User_ID",
        "Equipe_ID",
        "Serial_Number",
        "Item_Status",
        "Object_ID"
      ];

      const missingFields = requiredFields.filter(field => !newItem[field]);
      if (missingFields.length > 0) {
        throw new Error(`กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(", ")}`);
      }

      if (selectedItem) {
        // Update existing item
        const response = await axios.put(
          `https://nteq-back-end.vercel.app/api/item/${selectedItem.Item_ID}`,
          newItem
        );
        alert(response.data.message || "แก้ไขข้อมูลสำเร็จ");
      } else {
        // Add new item
        const response = await axios.post("https://nteq-back-end.vercel.app/api/item", newItem);
        alert(response.data.message || "เพิ่มอุปกรณ์สำเร็จ");
      }

      setShowPopup(false);
      setNewEquipment({});
      setSelectedItem(null);

      // Refresh items list
      const itemsResponse = await axios.get(`https://nteq-back-end.vercel.app/api/items/${id}`);
      // Ensure we're getting an array from the response
      const updatedItems = itemsResponse.data?.items || [];
      setItems(Array.isArray(updatedItems) ? updatedItems : []);

    } catch (error) {
      console.error("Error adding/updating item:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({ ...prev, [name]: value }));
  };

  const handleNodeChange = async (e) => {
    const nodeId = e.target.value;
    setNewEquipment((prev) => ({ ...prev, nodeId }));
    try {
      const response = await axios.get(
        `https://nteq-back-end.vercel.app/api/rooms/${nodeId}`
      );
      setRooms(response.data.data);
      setObjects([]); // Clear objects when node changes
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleRoomChange = async (e) => {
    const roomId = e.target.value;
    setNewEquipment((prev) => ({ ...prev, roomId }));
    try {
      // เรียก API เพื่อดึงข้อมูล objects ในห้องที่เลือก
      const response = await axios.get(
        `https://nteq-back-end.vercel.app/api/objects/${roomId}`
      );
      // ตรวจสอบว่ามี data property และเป็น array หรือไม่
      if (response.data && Array.isArray(response.data)) {
        setObjects(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setObjects(response.data.data);
      } else {
        console.error("Invalid objects data format:", response.data);
        setObjects([]); // ถ้าข้อมูลไม่ถูกต้อง ให้เซ็ตเป็น array ว่าง
      }
    } catch (error) {
      console.error("Error fetching objects:", error);
      setObjects([]); // กรณี error ให้เซ็ตเป็น array ว่าง
    }
  };

  const handleObjectChange = (e) => {
    const objectId = e.target.value;
    setNewEquipment((prev) => ({ ...prev, objectId }));
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`https://nteq-back-end.vercel.app/api/item/${itemId}`);

      // Refresh items list with proper error handling
      try {
        const itemsResponse = await axios.get(
          `https://nteq-back-end.vercel.app/api/items/${id}`
        );

        // Ensure we're getting an array from the response
        const updatedItems = itemsResponse.data?.items || [];
        setItems(Array.isArray(updatedItems) ? updatedItems : []);

      } catch (fetchError) {
        console.error("Error fetching updated items:", fetchError);
        setItems([]); // Set empty array if fetch fails
      }

    } catch (error) {
      console.error("Error deleting item:", error);
      alert("เกิดข้อผิดพลาดในการลบอุปกรณ์");
    }
  };

  const handleEditItem = async (item) => {
    try {
      setSelectedItem(item);

      // First get the complete object data
      const objectResponse = await axios.get(
        `https://nteq-back-end.vercel.app/api/object/${item.Object_ID}`
      );
      const objectData = objectResponse.data.data;

      // Set initial form data
      setNewEquipment({
        serialNumber: item.Serial_Number,
        details: item.Item_Others,
        nodeId: objectData.Node_ID,
        roomId: objectData.Room_ID,
        objectId: item.Object_ID,
        status: item.Item_Status,
      });

      // Fetch rooms for the selected node
      const roomsResponse = await axios.get(
        `https://nteq-back-end.vercel.app/api/rooms/${objectData.Node_ID}`
      );
      setRooms(roomsResponse.data.data || []);

      // Fetch objects for the selected room
      const objectsResponse = await axios.get(
        `https://nteq-back-end.vercel.app/api/objects/${objectData.Room_ID}`
      );
      setObjects(objectsResponse.data || []);

      setShowPopup(true);
    } catch (error) {
      console.error("Error setting up edit form:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  };


  const handleViewHistory = async (item) => {
    try {
      const response = await axios.get(
        `https://nteq-back-end.vercel.app/api/item/history/${item.Item_ID}`
      );
      setItemHistory(response.data.data);
      setSelectedItem(item);
      setShowMoreDetailPopup(true);
    } catch (error) {
      console.error("Error fetching item history:", error);
    }
  };

  const fetchSuggestions = (type, search, setSuggestions) => {
    if (search.length > 0) {
      fetch(
        `https://nteq-back-end.vercel.app/api/equipment/suggestions?type=${type}&search=${search}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.suggestions) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions([]);
          }
        })
        .catch((err) => {
          console.error(err);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchChange = (type, value) => {
    switch (type) {
      case "serialNumber":
        setSearchSerialNumber(value);
        fetchSuggestions("Serial_Number", value, setModelSuggestions);
        break;
      case "nodeName":
        setSearchNodeName(value);
        fetchSuggestions("Node_Name", value, setNodeSuggestions);
        break;
      case "room":
        setSearchRoom(value);
        fetchSuggestions("Room_Name", value, setRoomSuggestions);
        break;
      case "object":
        setSearchObject(value);
        fetchSuggestions("Object_Name", value, setObjectSuggestions);
        break;
      default:
        break;
    }
  };

  const handleStatusChange = (e) => {
    setSearchStatus(e.target.value);
  };

  const handleSearch = async () => {
    const searchParams = new URLSearchParams({
      Serial_Number: searchSerialNumber,
      Node_Name: searchNodeName,
      Room_Name: searchRoom,
      Object_Name: searchObject,
      Item_Status: searchStatus,
      page: currentPage,
      limit: itemsPerPage
    }).toString();

    try {
      const response = await fetch(`https://nteq-back-end.vercel.app/api/equipment/search?${searchParams}`);
      const data = await response.json();

      // Ensure we're setting an array
      const searchResults = data.data || [];
      setItems(Array.isArray(searchResults) ? searchResults : []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setItems([]); // Set empty array on error
      setTotalPages(1);
    }
  };

  const renderObjectSelect = () => (
    <select
      name="object"
      className="form-control mb-2"
      value={newEquipment.objectId || ""}
      onChange={handleObjectChange}
      disabled={!newEquipment.roomId}
    >
      <option value="">เลือกอุปกรณ์</option>
      {objects && objects.map((object) => (
        <option key={object.Object_ID} value={object.Object_ID}>
          {object.Object_Name}
          {object.item_count !== undefined && ` (จำนวนอุปกรณ์: ${object.item_count})`}
        </option>
      ))}
    </select>
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setItems([]); // Clear current items while loading
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]); // Dependency on currentPage

  const renderPagination = () => {
    return (
      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center d-flex gap-2">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >ก่อนหน้า
            </button>
          </li>
          {[...Array(totalPages)].map((_, index) => (
            <li
              key={index + 1}
              className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ถัดไป
            </button>
          </li>
        </ul>
      </nav>
    );
  };


  return (
    <div className="d-flex vh-100 flex-column">
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

        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}
        >
          <div className="p-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <h5>รายละเอียดอุปกรณ์</h5>

              <div className="mb-4 d-flex align-items-center justify-content-between">
                <div className="d-flex flex-grow-1 gap-3">
                  <div className="position-relative col-2">
                    <input
                      type="text"
                      placeholder="ค้นหา Serial Number"
                      className="form-control"
                      value={searchSerialNumber}
                      onChange={(e) =>
                        handleSearchChange("serialNumber", e.target.value)
                      }
                    />
                    {modelSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {modelSuggestions.map((suggestion, index) => (
                          <li
                            key={`${suggestion}-${index}`} // Ensure unique key
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchSerialNumber(suggestion);
                              setModelSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="position-relative col-2">
                    <input
                      type="text"
                      placeholder="ค้นหา Node Name"
                      className="form-control"
                      value={searchNodeName}
                      onChange={(e) =>
                        handleSearchChange("nodeName", e.target.value)
                      }
                    />
                    {nodeSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {nodeSuggestions.map((suggestion, index) => (
                          <li
                            key={`${suggestion}-${index}`} // Ensure unique key
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchNodeName(suggestion);
                              setNodeSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="position-relative col-2">
                    <input
                      type="text"
                      placeholder="ค้นหา Room"
                      className="form-control"
                      value={searchRoom}
                      onChange={(e) =>
                        handleSearchChange("room", e.target.value)
                      }
                    />
                    {roomSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {roomSuggestions.map((suggestion, index) => (
                          <li
                            key={`${suggestion}-${index}`} // Ensure unique key
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchRoom(suggestion);
                              setRoomSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="position-relative col-2">
                    <input
                      type="text"
                      placeholder="ค้นหา Object"
                      className="form-control"
                      value={searchObject}
                      onChange={(e) =>
                        handleSearchChange("object", e.target.value)
                      }
                    />
                    {objectSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {objectSuggestions.map((suggestion, index) => (
                          <li
                            key={`${suggestion}-${index}`} // Ensure unique key
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchObject(suggestion);
                              setObjectSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <select
                    className="form-control"
                    value={searchStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="">เลือกสถานะ</option>
                    <option value="ใช้งาน">ใช้งาน</option>
                    <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
                  </select>
                </div>
                <div className="d-flex ">
                  <button
                    className="btn btn-primary ms-2 mt-0"
                    onClick={handleSearch}
                  >
                    ค้นหา
                  </button>
                  <button
                    className="btn btn-success ms-2 mt-0"
                    onClick={() => setShowPopup(true)}
                  >
                    เพิ่มอุปกรณ์ใหม่
                  </button>
                </div>
              </div>

              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                      เลขรุ่น
                    </th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                      ที่อยู่สาขา
                    </th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>อาคาร</th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>ห้อง</th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>สถานะ</th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items && items.map((item, index) => (
                    <tr key={`${item.Item_ID}-${index}`}>
                      <td>{item.Serial_Number}</td>
                      <td>{item.Branch_Location}</td>
                      <td>{item.Building_Name}</td>
                      <td>{item.Room_Name}</td>
                      <td>{item.Item_Status}</td>
                      <td>
                        <button
                          className="btn btn-primary me-2"
                          onClick={() => handleViewHistory(item)}
                        >
                          ประวัติ
                        </button>
                        <button
                          className="btn btn-warning me-2"
                          onClick={() => handleEditItem(item)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteItem(item.Item_ID)}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>

      {/* ป๊อปอัพสำหรับการเพิ่ม Item */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{selectedItem ? "แก้ไข Item" : "เพิ่ม Item ใหม่"}</h3>
            <form className="formEdit" onSubmit={handleAddItem}>
              <input
                type="text"
                name="serialNumber"
                placeholder="กรอกเลขรุ่น"
                className="form-control mb-2"
                value={newEquipment.serialNumber || ""}
                onChange={handleInputChange}
              />
              <textarea
                name="details"
                placeholder="กรอกรายละเอียด"
                className="form-control mb-2"
                rows="4"
                value={newEquipment.details || ""}
                onChange={handleInputChange}
              ></textarea>
              <select
                name="node"
                className="form-control mb-2"
                value={newEquipment.nodeId || ""}
                onChange={handleNodeChange}
              >
                <option value="">เลือกสาขา</option>
                {nodes && nodes.map((node) => (
                  <option key={node.Node_ID} value={node.Node_ID}>
                    {node.Node_Name} ({node.Node_Location})
                  </option>
                ))}
              </select>
              <select
                name="room"
                className="form-control mb-2"
                value={newEquipment.roomId || ""}
                onChange={handleRoomChange}
                disabled={!newEquipment.nodeId}
              >
                <option value="">เลือกห้อง</option>
                {rooms && rooms.map((room) => (
                  <option key={room.Room_ID} value={room.Room_ID}>
                    {room.Room_Name} (ชั้น {room.Room_Floor})
                  </option>
                ))}
              </select>
              {renderObjectSelect()}
              <select
                name="status"
                className="form-control mb-2"
                value={newEquipment.status || ""}
                onChange={handleInputChange}
              >
                <option value="">เลือกสถานะ</option>
                <option value="ใช้งาน">ใช้งาน</option>
                <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
              </select>
              <button type="submit" className="btn btn-primary me-2">
                {selectedItem ? "แก้ไข" : "เพิ่ม"}
              </button>
              <button
                type="button"
                className="btn btn-danger ms-2"
                onClick={() => {
                  setShowPopup(false);
                  setNewEquipment({});
                  setSelectedItem(null);
                }}
              >
                ปิด
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Popup for More Detail */}
      {showMoreDetailPopup && selectedItem && (
        <div className="popup-overlay">
          <div
            className="popup-content card p-5 shadow-lg rounded-3 position-relative"
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              backgroundColor: "#f9fafb",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* ปุ่มปิดเป็นกากบาทที่มุมขวาบน */}
            <button
              className="position-absolute top-0 end-0 m-3 btn btn-light border-0"
              onClick={() => {
                setShowMoreDetailPopup(false);
                setSelectedItem(null);
              }}
              style={{
                fontSize: "1.5rem",
                cursor: "pointer",
                background: "none",
              }}
            >
              ❌
            </button>

            <h3 className="text-center mb-4 text-primary fs-4 fw-bold">
              รายละเอียดเพิ่มเติม
            </h3>

            <ul className="list-unstyled">
              {itemHistory &&
                [...itemHistory]
                  .sort(
                    (a, b) =>
                      new Date(b.Item_history_CreateDate) -
                      new Date(a.Item_history_CreateDate)
                  )
                  .map((history, index) => {
                    // แปลงวันที่ให้อยู่ในรูปแบบ วัน/เดือน/ปี (DD/MM/YYYY)
                    const formattedDate = new Date(history.Item_history_CreateDate)
                      .toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });

                    return (
                      <li key={history.StatusID} className="mb-4">
                        {/* แสดงหัวข้อกำกับ */}
                        {index === 0 ? (
                          <h4 className="text-danger fw-bold">🟡 ล่าสุด</h4>
                        ) : index === 1 ? (
                          <h5 className="text-secondary fw-bold mt-4">⚪ ก่อนหน้า</h5>
                        ) : null}

                        <div
                          className={`border-bottom pb-3 p-3 rounded ${index === 0
                            ? "bg-warning-subtle border-2 border-warning fs-5 fw-bold"
                            : "fs-6"
                            }`}
                        >
                          <p>
                            <strong>สถานะ:</strong> {history.Item_history_Status}
                          </p>
                          <p>
                            <strong>วันที่เพิ่ม:</strong> {formattedDate}
                          </p>
                          <p>
                            <strong>รายละเอียด:</strong> {history.Item_history_Other}
                          </p>
                          <p>
                            <strong>ที่อยู่สาขา:</strong> {history.Branch_Location}
                          </p>
                          <p>
                            <strong>อาคาร:</strong> {history.Building_Name}
                          </p>
                          <p>
                            <strong>ห้อง:</strong> {history.Room_Name}
                          </p>
                          <p>
                            <strong>แลค:</strong> {/* เพิ่มข้อมูลที่ต้องการ */}
                          </p>
                          <p>
                            <strong>โน็ต:</strong> {selectedItem.Item_Others || "ไม่มีข้อมูล"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
            </ul>
          </div>
        </div>
      )}


    </div>
  );
}

export default EquipmentDetail;
