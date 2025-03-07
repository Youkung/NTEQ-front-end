import React, { useEffect, useState } from "react";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import { Link } from "react-router-dom";
import "./room.css"
import Admin_AddRoomModal from "./Admin_AddRoom";

function Admin_Room() {
  const [userName, setUserName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  // Add these states at the top of your component
  const [searchBranchNumber, setSearchBranchNumber] = useState("");
  const [searchBranchName, setSearchBranchName] = useState("");
  const [searchBuilding, setSearchBuilding] = useState("");
  const [searchFloor, setSearchFloor] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [branchNumberSuggestions, setBranchNumberSuggestions] = useState([]);
  const [branchNameSuggestions, setBranchNameSuggestions] = useState([]);
  const [floorSuggestions, setFloorSuggestions] = useState([]);
  const [roomSuggestions, setRoomSuggestions] = useState([]);
  const [buildingSuggestions, setBuildingSuggestions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null);
  const [editData, setEditData] = useState({
    nodeName: "",
    nodeLocation: "",
    nodeBuilding: "", // Add nodeBuilding
    roomFloor: "",
    roomName: ""
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addFlowStep, setAddFlowStep] = useState('initial'); // 'initial', 'addNode', 'selectNode', 'addRoom'
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const handleEdit = (room) => {
    setEditData({
      nodeName: room.branch_name,
      nodeLocation: room.branch_number,
      nodeBuilding: room.building_name, // ใช้ค่า building_name จาก API
      roomFloor: room.floor,
      roomName: room.room_name,
      nodeId: room.node_id,
      roomId: room.room_id,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (type) => {
    if (window.confirm(`ยืนยันการแก้ไขข้อมูล${type === 'node' ? 'สาขา' : 'ห้อง'}?`)) {
      const endpoint = type === 'node' ?
        `http://localhost:8080/api/rooms/node/${editData.nodeId}` :
        `http://localhost:8080/api/rooms/room/${editData.roomId}`;

      const data = type === 'node' ?
        {
          Node_Name: editData.nodeName,
          Node_Location: editData.nodeLocation,
          Node_Building: editData.nodeBuilding // Include building in update
        } :
        {
          Room_Floor: editData.roomFloor,
          Room_Name: editData.roomName
        };

      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);

        if (response.ok) {
          fetch("http://localhost:8080/api/rooms")
            .then(res => res.json())
            .then(data => setRooms(data.data));
          setShowEditModal(false);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
      }
    }
  };


  // Add delete handler
  const handleDelete = (nodeId, roomId) => {
    setSelectedItem({ nodeId, roomId });
    setShowDeleteModal(true);
  };

  // Add confirm delete handler
  const handleConfirmDelete = async (type) => {
    if (window.confirm(`ยืนยันการลบ${type === 'node' ? 'สาขา' : 'ห้อง'}?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/rooms/${type}/${type === 'node' ? selectedItem.nodeId : selectedItem.roomId}`, {
          method: 'DELETE'
        });
        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          fetch("http://localhost:8080/api/rooms")
            .then(res => res.json())
            .then(data => setRooms(data.data));
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setShowDeleteModal(false);
    }
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
    const fetchRooms = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/rooms?page=${currentPage}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setRooms(data.data);
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.totalItems);
          setError(null);
        } else {
          throw new Error(data.message || "Failed to fetch rooms");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError(err.message);
        setRooms([]);
      }
    };

    fetchRooms();
  }, [currentPage]);

  // Add this function to handle search
  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      branch_number: searchBranchNumber,
      branch_name: searchBranchName,
      building: searchBuilding,
      floor: searchFloor,
      room: searchRoom,
    }).toString();

    fetch(`http://localhost:8080/api/rooms/search?${searchParams}`)
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleBranchNumberSearch = (value) => {
    setSearchBranchNumber(value);
    if (value.length > 0) {
      fetch(
        `http://localhost:8080/api/rooms/suggestions?type=branch_number&search=${value}`
      )
        .then((res) => res.json())
        .then((data) => setBranchNumberSuggestions(data.suggestions));
    } else {
      setBranchNumberSuggestions([]);
    }
  };

  const handleBranchNameSearch = (value) => {
    setSearchBranchName(value);
    if (value.length > 0) {
      fetch(
        `http://localhost:8080/api/rooms/suggestions?type=branch_name&search=${value}`
      )
        .then((res) => res.json())
        .then((data) => setBranchNameSuggestions(data.suggestions));
    } else {
      setBranchNameSuggestions([]);
    }
  };

  const handleBuildingSearch = (value) => {
    setSearchBuilding(value);
    if (value.length > 0) {
      fetch(
        `http://localhost:8080/api/rooms/suggestions?type=building&search=${value}`
      )
        .then((res) => res.json())
        .then((data) => setBuildingSuggestions(data.suggestions));
    } else {
      setBuildingSuggestions([]);
    }
  };

  const handleFloorSearch = (value) => {
    setSearchFloor(value);
    if (value.length > 0) {
      fetch(
        `http://localhost:8080/api/rooms/suggestions?type=floor&search=${value}`
      )
        .then((res) => res.json())
        .then((data) => setFloorSuggestions(data.suggestions));
    } else {
      setFloorSuggestions([]);
    }
  };

  const handleRoomSearch = (value) => {
    setSearchRoom(value);
    if (value.length > 0) {
      fetch(
        `http://localhost:8080/api/rooms/suggestions?type=room&search=${value}`
      )
        .then((res) => res.json())
        .then((data) => setRoomSuggestions(data.suggestions));
    } else {
      setRoomSuggestions([]);
    }
  };

  const handleAddFlowStart = () => {
    setIsModalOpen(true);
    setAddFlowStep('initial');
    // Fetch available nodes
    fetch("http://localhost:8080/api/rooms/nodes")
      .then(res => res.json())
      .then(data => {
        if (data.nodes) {
          setNodes(data.nodes);
        }
      })
      .catch(err => console.error(err));
  };

  const AddFlowModal = () => {
    const [newNodeData, setNewNodeData] = useState({
      name: '',
      location: '',
      building: '' // Add building field
    });
    const [newRoomData, setNewRoomData] = useState({ floor: '', name: '', building: '' });
    const [nodeSearch, setNodeSearch] = useState(''); // Add this state
    const [filteredNodes, setFilteredNodes] = useState([]); // Add this state
    const [roomChoice, setRoomChoice] = useState(null); // 'new' or 'select'
    const [existingRooms, setExistingRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Update handleNodeSearch function
    const handleNodeSearch = async (value) => {
      setNodeSearch(value);
      if (value.trim()) {
        try {
          const response = await fetch(`http://localhost:8080/api/rooms/nodes/search?search=${value}`);
          const data = await response.json();
          setFilteredNodes(data.nodes);
        } catch (error) {
          console.error('Error searching nodes:', error);
          setFilteredNodes([]);
        }
      } else {
        setFilteredNodes(nodes);
      }
    };

    useEffect(() => {
      // Only update filtered nodes when search is empty
      if (!nodeSearch.trim()) {
        setFilteredNodes(nodes);
      }
    }, [nodes, nodeSearch]);

    const handleNodeSubmit = async () => {
      if (!newNodeData.name || !newNodeData.location) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      try {
        console.log("Sending node data:", newNodeData); // Debug log

        const response = await fetch('http://localhost:8080/api/rooms/node', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: newNodeData.name.trim(),
            location: newNodeData.location.trim(),
            building: newNodeData.building.trim() // Include building in request
          })
        });

        const data = await response.json();
        console.log("Server response:", data); // Debug log

        if (!response.ok) {
          throw new Error(data.message || 'เกิดข้อผิดพลาดในการสร้างสาขา');
        }

        alert(data.message);
        setSelectedNode(data.node);
        setAddFlowStep('addRoom');

        // Refresh nodes list
        const nodesResponse = await fetch("http://localhost:8080/api/rooms/nodes");
        const nodesData = await nodesResponse.json();
        if (nodesData.nodes) {
          setNodes(nodesData.nodes);
        }
      } catch (error) {
        console.error('Error creating node:', error);
        alert(error.message || "เกิดข้อผิดพลาดในการสร้างสาขา");
      }
    };

    const handleRoomSubmit = async () => {
      if (!newRoomData.floor || !newRoomData.name || !selectedNode) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน (ต้องระบุชั้น, ชื่อห้อง และสาขา)");
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/rooms/room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            floor: newRoomData.floor,
            name: newRoomData.name,
            building: newRoomData.building,
            nodeId: selectedNode.id
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'เกิดข้อผิดพลาดในการสร้างห้อง');
        }

        alert(data.message);
        setIsModalOpen(false);

        // Refresh room list
        const roomsResponse = await fetch("http://localhost:8080/api/rooms");
        const roomsData = await roomsResponse.json();
        if (roomsData.data) {
          setRooms(roomsData.data);
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    };

    // Add function to fetch existing rooms for selected node
    const fetchExistingRooms = async (nodeId) => {
      try {
        const response = await fetch(`http://localhost:8080/api/rooms/${nodeId}`);
        const data = await response.json();
        if (data.data) {
          setExistingRooms(data.data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setExistingRooms([]);
      }
    };

    // Update node selection handler
    const handleNodeSelect = (node) => {
      setSelectedNode(node);
      setRoomChoice(null); // Reset room choice when node changes
      fetchExistingRooms(node.id);
    };

    // Add function to handle the next step after node selection
    const handleAfterNodeSelect = (choice) => {
      setRoomChoice(choice);
      if (choice === 'new') {
        setAddFlowStep('addRoom');
      }
      // Remove the option to select an existing room
    };

    return (
      <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-xl p-4" style={{ maxWidth: '90%', width: '500px' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                {addFlowStep === 'initial' ? 'เลือกวิธีการเพิ่มห้อง' :
                  addFlowStep === 'addNode' ? 'เพิ่มสาขาใหม่' :
                    addFlowStep === 'selectNode' ? 'เลือกสาขา' : 'เพิ่มห้อง'}
              </h5>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
            </div>
            <div className="modal-body">
              {addFlowStep === 'initial' && (
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => setAddFlowStep('addNode')}>
                    เพิ่มสาขาใหม่
                  </button>
                  <button className="btn btn-secondary" onClick={() => setAddFlowStep('selectNode')}>
                    เพิ่มห้องใหม่
                  </button>
                </div>
              )}

              {addFlowStep === 'addNode' && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">ชื่อสาขา</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={e => setNewNodeData({ ...newNodeData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">เลขสาขา</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={e => setNewNodeData({ ...newNodeData, location: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">อาคาร</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={e => setNewNodeData({ ...newNodeData, building: e.target.value })}
                    />
                  </div>
                  <button className="btn btn-primary w-100" onClick={handleNodeSubmit}>
                    ดำเนินการต่อ
                  </button>
                </div>
              )}

              {addFlowStep === 'selectNode' && (
                <div>
                  {selectedNode && (
                    <div className="alert alert-info mb-3">
                      <small className="d-block mb-1">สาขาที่เลือก:</small>
                      <strong className="d-block">
                        {selectedNode.name} ({selectedNode.location})
                      </strong>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">ค้นหาสาขา</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="พิมพ์ชื่อหรือเลขสาขา"
                      value={nodeSearch}
                      onChange={(e) => handleNodeSearch(e.target.value)}
                    />
                  </div>
                  <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredNodes.map(node => (
                      <div
                        key={node.id}
                        className={`p-2 border rounded mb-2 ${selectedNode?.id === node.id ? 'bg-primary text-white' : 'bg-light'
                          }`}
                        onClick={() => handleNodeSelect(node)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex justify-content-between">
                          <div>{node.name}</div>
                          <small className={selectedNode?.id === node.id ? 'text-light' : 'text-muted'}>
                            {node.location}
                          </small>
                        </div>
                      </div>
                    ))}
                    {nodeSearch && filteredNodes.length === 0 && (
                      <div className="text-center text-muted">
                        ไม่พบสาขาที่ตรงกับการค้นหา
                      </div>
                    )}
                  </div>
                  {selectedNode && (
                    <div className="mt-3">
                      <h6>เลือกการดำเนินการ:</h6>
                      <div className="d-grid gap-2">
                        <button
                          className={`btn ${roomChoice === 'new' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleAfterNodeSelect('new')}
                        >
                          สร้างห้องใหม่
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {addFlowStep === 'addRoom' && (
                <div>
                  <div className="alert alert-info mb-3">
                    <small className="d-block mb-1">กำลังเพิ่มห้องใหม่ที่สาขา:</small>
                    <strong className="d-block">
                      {selectedNode.name} ({selectedNode.location})
                    </strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ชั้น</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={e => setNewRoomData({ ...newRoomData, floor: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ชื่อห้อง</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={e => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">อาคาร</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={e => setNewRoomData({ ...newRoomData, building: e.target.value })}
                    />
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setAddFlowStep('selectNode')}
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      className="btn btn-success flex-grow-1"
                      onClick={handleRoomSubmit}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn ${currentPage === i ? 'btn-primary' : 'btn-light'}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <button
          className="btn btn-secondary"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        {startPage > 1 && (
          <>
            <button
              className="btn btn-light"
              onClick={() => handlePageClick(1)}
            >
              1
            </button>
            {startPage > 2 && <span className="mx-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-2">...</span>}
            <button
              className="btn btn-light"
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          className="btn btn-secondary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          ถัดไป
        </button>
      </div>
    );
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
              <h1>สถานที่</h1>
              {/* Search Fields */}
              <div className="search-container row mb-3">
                <div className="search-container d-flex align-items-center gap-2">
                  {/* Branch Number Search */}
                  <div className="col-md-2 position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหา เลขสาขา"
                      value={searchBranchNumber}
                      onChange={(e) => handleBranchNumberSearch(e.target.value)}
                    />
                    {branchNumberSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {branchNumberSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchBranchNumber(suggestion);
                              setBranchNumberSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-md-2 position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหา ชื่อสาขา"
                      value={searchBranchName}
                      onChange={(e) => handleBranchNameSearch(e.target.value)}
                    />
                    {branchNameSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {branchNameSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchBranchName(suggestion);
                              setBranchNameSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-md-2 position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหา อาคาร"
                      value={searchBuilding}
                      onChange={(e) => handleBuildingSearch(e.target.value)}
                    />
                    {buildingSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {buildingSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchBuilding(suggestion);
                              setBuildingSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-md-2 position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหา ชั้น"
                      value={searchFloor}
                      onChange={(e) => handleFloorSearch(e.target.value)}
                    />
                    {floorSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {floorSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSearchFloor(suggestion);
                              setFloorSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-md-2 position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหา ห้อง"
                      value={searchRoom}
                      onChange={(e) => handleRoomSearch(e.target.value)}
                    />
                    {roomSuggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 z-1">
                        {roomSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
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

                  <button
                    className="btn btn-success m-0"
                    onClick={handleSearch}
                  >
                    ค้นหา
                  </button>
                  <button className="btn btn-primary m-0" onClick={handleAddFlowStart}>
                    เพิ่มห้องใหม่
                  </button>
                </div>
              </div>

              {/* Table */}
              <table className="table table-bordered text-center">
                <thead className="bg-light">
                  <tr>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                      ที่อยู่สาขา
                    </th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                      ชื่อสาขา
                    </th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>อาคาร</th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>ชั้น</th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>ห้อง</th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                      จำนวนอุปกรณ์
                    </th>
                    <th style={{ padding: "16px", fontSize: "18px" }}>
                    การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {error ? (
                    <tr>
                      <td colSpan="7" className="text-center text-danger">
                        Error: {error}
                      </td>
                    </tr>
                  ) : rooms.length > 0 ? (
                    rooms.map((room, index) => (
                      <tr key={index}>
                        <td>{room.branch_number}</td>
                        <td>{room.branch_name}</td>
                        <td>{room.building_name || '-'}</td>
                        <td>{room.floor || '-'}</td>
                        <td>{room.room_name}</td>
                        <td>{room.item_count || 0}</td>
                        <td>
                          <Link to={`/admin/adminRoomdetail/${room.room_id}`} className="text-blue-500 hover:underline">
                            <button className="btn btn-primary btn-md me-2" >รายละเอียด</button>
                          </Link>
                          <button
                            className="btn btn-primary btn-md me-2"
                            onClick={() => handleEdit(room)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="btn btn-danger btn-md"
                            onClick={() =>
                              handleDelete(room.node_id, room.room_id)
                            }
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {renderPagination()}
            </div>
          </div>
        </div>


        {/* Edit Modal */}
        {showEditModal && (
          <div
            className="modal show fade d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                {/* Header */}
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">แก้ไขข้อมูล</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  {/* Button Group */}
                  <div className="btn-group mb-4 w-100">
                    <button
                      className={`btn ${editType === "node" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setEditType("node")}
                    >
                      แก้ไขข้อมูลสาขา
                    </button>
                    <button
                      className={`btn ${editType === "room" ? "btn-info" : "btn-outline-info"}`}
                      onClick={() => setEditType("room")}
                    >
                      แก้ไขข้อมูลห้อง
                    </button>
                  </div>

                  {/* Edit Node Section */}
                  {editType === "node" && (
                    <div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">ชื่อสาขา</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกชื่อสาขา"
                          value={editData.nodeName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              nodeName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">เลขสาขา</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกเลขสาขา"
                          value={editData.nodeLocation}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              nodeLocation: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">อาคาร</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกชื่ออาคาร"
                          value={editData.nodeBuilding}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              nodeBuilding: e.target.value,
                            })
                          }
                        />
                      </div>
                      <button
                        className="btn btn-success w-100"
                        onClick={() => handleEditSubmit("node")}
                      >
                        บันทึกข้อมูลสาขา
                      </button>
                    </div>
                  )}

                  {/* Edit Room Section */}
                  {editType === "room" && (
                    <div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">ชั้น</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกชั้น"
                          value={editData.roomFloor}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              roomFloor: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">ชื่อห้อง</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกชื่อห้อง"
                          value={editData.roomName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              roomName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <button
                        className="btn btn-success w-100"
                        onClick={() => handleEditSubmit("room")}
                      >
                        บันทึกข้อมูลห้อง
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Delete Modal */}
        {showDeleteModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">เลือกการลบข้อมูล</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>กรุณาเลือกสิ่งที่ต้องการลบ:</p>
                  <button
                    className="btn btn-danger me-2"
                    onClick={() => handleConfirmDelete("node")}
                  >
                    ลบสาขา (Node)
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleConfirmDelete("room")}
                  >
                    ลบห้อง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && <AddFlowModal />}


      </div>
    </div>
  );
}

export default Admin_Room;
