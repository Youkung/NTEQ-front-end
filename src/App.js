import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import UserDashboard from "./user/User_Dashboard";
import User_Dashboard_detail from './user/User_Dashboard_detail'; // Fix import path
import UserEquipment from "./user/User_Equipment";
import UserAccount from "./user/User_Account";
import UserNote from "./user/User_Note";
import UserRoom from "./user/User_Room";
import UserEquipmentDetail from "./user/User_EquipmentDetail";
import UserRoomdetail from "./user/User_Roomdetail"
import UserMyNotesPage from './user/User_Mynote';
import UserRackdetail from "./user/User_Rackdetail"
import AdminEquipment from "./admin/Admin_Equipment";
import AdminAccount from './admin/Admin_Account';
import AdminNote from "./admin/Admin_Note";
import AdminRoom from "./admin/Admin_Room";
import AdminEquipmentDetail from "./admin/Admin_EquipmentDetail";
import AdminMyNotesPage from './admin/Admin_Mynote';
import AdminDashboard from "./admin/Admin_Dashboard";
import AdminAddRoom from "./admin/Admin_AddRoom";
import Adminshowuser from "./admin/Admin_showuser"
import Adminroomdetail from "./admin/Admin_roomdetail"
import AdminRackdetail from "./admin/Admin_rackdetail"
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute allowedRole="R1">
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="Equipment" element={<AdminEquipment />} />
                <Route path="equipment/:id" element={<AdminEquipmentDetail />} />
                <Route path="accounts" element={<AdminAccount />} />
                <Route path="Note" element={<AdminNote />} />
                <Route path="Room" element={<AdminRoom />} />
                <Route path="my-notes" element={<AdminMyNotesPage />} />
                <Route path="addroom" element={<AdminAddRoom />} />
                <Route path="UserManagement" element={<Adminshowuser />} />
                <Route path="adminRoomdetail/:id" element={<Adminroomdetail />} />
                <Route path="rackdetail/:id" element={<AdminRackdetail />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* User Routes */}
        <Route
          path="/user/*"
          element={
            <PrivateRoute allowedRole="R2">
              <Routes>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="dashboard_detail" element={<User_Dashboard_detail />} />
                <Route path="Equipment" element={<UserEquipment />} />
                <Route path="equipment/:id" element={<UserEquipmentDetail />} />
                <Route path="accounts" element={<UserAccount />} />
                <Route path="Note" element={<UserNote />} />
                <Route path="Room" element={<UserRoom />} />
                <Route path="my-notes" element={<UserMyNotesPage />} />
                <Route path="userRoomdetail/:id" element={<UserRoomdetail />} />
                <Route path="rackdetail/:id" element={<UserRackdetail />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );

}
export default App;
