import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole) {
    // ถ้าไม่มี role ให้กลับไปหน้า login
    return <Navigate to="/" replace />;
  }

  if (userRole !== allowedRole) {
    // ถ้า role ไม่ตรงกับที่กำหนด ให้ redirect ไปหน้าที่เหมาะสม
    if (userRole === 'R1') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
