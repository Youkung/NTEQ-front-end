import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin_AddRoom.css";

function Admin_AddRoomModal({ isOpen, onClose }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [objectName, setObjectName] = useState("");
  const [buildingName, setBuildingName] = useState("");  // สำหรับอาคาร
  const [floorName, setFloorName] = useState("");        // สำหรับชั้น
  const navigate = useNavigate();
  const [isAdditionalPopupOpen, setIsAdditionalPopupOpen] = useState(false);
  const [equipmentImage, setEquipmentImage] = useState(null);
  const [equipmentQuantity, setEquipmentQuantity] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:8080/api/nodes")
        .then((res) => res.json())
        .then((data) => setNodes(data.data))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  const handleNodeChange = (nodeId) => {
    setSelectedNode(nodeId);
    fetch(`http://localhost:8080/api/rooms?nodeId=${nodeId}`)
      .then((res) => res.json())
      .then((data) => setRooms(data.data))
      .catch((err) => console.error(err));
  };

  const handleSubmit = () => {
    if (buildingName) {
      // ส่งข้อมูลเพิ่มอาคาร
      fetch("http://localhost:8080/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Node_ID: selectedNode,
          Building_Name: buildingName,
        }),
      }).catch((err) => console.error(err));
    }

    if (floorName) {
      // ส่งข้อมูลเพิ่มชั้น
      fetch("http://localhost:8080/api/floors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Node_ID: selectedNode,
          Building_Name: buildingName,
          Floor_Name: floorName,
        }),
      }).catch((err) => console.error(err));
    }

    if (roomName && roomFloor) {
      // ส่งข้อมูลเพิ่มห้อง
      fetch("http://localhost:8080/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Node_ID: selectedNode,
          Room_Name: roomName,
          Room_Floor: roomFloor,
        }),
      }).catch((err) => console.error(err));
    }

    if (objectName && selectedRoom) {
      // ส่งข้อมูลเพิ่มอุปกรณ์
      fetch("http://localhost:8080/api/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Node_ID: selectedNode,
          Room_ID: selectedRoom,
          Object_Name: objectName,
        }),
      }).catch((err) => console.error(err));
      setIsAdditionalPopupOpen(true); // เปิดป็อปอัพใหม่
    }

    if (equipmentImage && equipmentQuantity) {
      // ส่งข้อมูลอุปกรณ์
      const formData = new FormData();
      formData.append("Node_ID", selectedNode);
      formData.append("Room_ID", selectedRoom);
      formData.append("Object_Name", objectName);
      formData.append("Equipment_Image", equipmentImage);
      formData.append("Equipment_Quantity", equipmentQuantity);

      fetch("http://localhost:8080/api/equipment", {
        method: "POST",
        body: formData,
      })
        .then(() => alert("All data has been submitted successfully!"))
        .then(() => {
          onClose();
        })
        .catch((err) => console.error(err));
    } else {
      alert("Please fill in all the required fields!");
    }
  };

  const handleSubmitAdditionalData = () => {
    const formData = new FormData();
    formData.append("Node_ID", selectedNode);
    formData.append("Room_ID", selectedRoom);
    formData.append("Object_Name", objectName);
    formData.append("Equipment_Image", equipmentImage);
    formData.append("Equipment_Quantity", equipmentQuantity);

    fetch("http://localhost:8080/api/equipment", {
      method: "POST",
      body: formData,
    })
      .then(() => alert("Equipment Added Successfully!"))
      .then(() => {
        setIsAdditionalPopupOpen(false);
        onClose();
      })
      .catch((err) => console.error(err));
  };

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="text-xl mb-4">Add Building, Floor, Room & Object</h2>

          {/* Select Node */}
          <div className="mb-3">
            <label>Select Node:</label>
            <select
              className="form-control"
              value={selectedNode}
              onChange={(e) => handleNodeChange(e.target.value)}
            >
              <option value="">-- Select Node --</option>
              {nodes.map((node) => (
                <option key={node.Node_ID} value={node.Node_ID}>
                  {node.Node_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Building */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Building Name"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
            />
          </div>

          {/* Add Floor */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Floor Name"
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
            />
          </div>

          {/* Add Room */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Room Floor"
              value={roomFloor}
              onChange={(e) => setRoomFloor(e.target.value)}
            />
          </div>

          {/* Select Existing Room */}
          <div className="mb-3">
            <label>Select Existing Room:</label>
            <select
              className="form-control"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">-- Select Room --</option>
              {rooms.map((room) => (
                <option key={room.Room_ID} value={room.Room_ID}>
                  {room.Room_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Object */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Object Name"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
            />
          </div>

          {/* Add Equipment */}
          {isAdditionalPopupOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="text-xl mb-4">Add Equipment Details</h2>
                <input
                  type="file"
                  className="form-control mb-2"
                  onChange={(e) => setEquipmentImage(e.target.files[0])}
                />
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Equipment Quantity"
                  value={equipmentQuantity}
                  onChange={(e) => setEquipmentQuantity(e.target.value)}
                />
              </div>
            </div>
          )}

          <button className="btn btn-success mt-3" onClick={handleSubmit}>
            Submit All
          </button>

          <button className="btn btn-secondary mt-3" onClick={onClose}>
            Close
          </button>
        </div>


        {/* ป็อปอัพใหม่สำหรับข้อมูลเพิ่มเติม */}
        {isAdditionalPopupOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="text-xl mb-4">Add Equipment Details</h2>
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setEquipmentImage(e.target.files[0])}
              />
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Equipment Quantity"
                value={equipmentQuantity}
                onChange={(e) => setEquipmentQuantity(e.target.value)}
              />
              <button className="btn btn-success mt-2" onClick={handleSubmitAdditionalData}>
                Submit
              </button>
              <button
                className="btn btn-secondary mt-2"
                onClick={() => setIsAdditionalPopupOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default Admin_AddRoomModal;
