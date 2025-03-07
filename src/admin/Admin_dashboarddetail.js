import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';

const CategorySummary = ({ categories }) => {
  // คำนวณจำนวนแต่ละประเภท
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const totalCategories = Object.keys(categoryCounts).length;  // จำนวนประเภทที่แตกต่างกัน

  // กำหนดสไตล์ของการ์ด
  const cardStyle = {
    backgroundColor: "#3b82f6", // สีน้ำเงินอ่อน
    padding: "10px", // ลดขนาดการ padding
    position: "relative", // ใช้ position: relative เพื่อใช้กับปุ่ม
  };

  const cardShadow = 'shadow-sm'; // ใช้เงาเล็ก

  // สถานะการแสดงผลของการ์ดประเภทแต่ละประเภท
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  return (
    <div className="container py-5">
      {/* กรอบจำนวนประเภททั้งหมด */}
      <div className="row justify-content-center mb-4">
        <div className="col-12 col-md-6">
          <div className={`card ${cardShadow} text-center text-light rounded-3`} style={cardStyle}>
            <div className="card-body">
              <h3 className="fw-bold">ประเภททั้งหมด</h3>
              <h1 className="fw-bold">{totalCategories}</h1> {/* ขนาดใหญ่ */}

              {/* ปุ่มอยู่ข้างล่างจำนวนทั้งหมด */}
              <button
                className="btn btn-primary mt-3"
                onClick={() => setShowCategoryDetails(!showCategoryDetails)}
              >
                {showCategoryDetails ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* การ์ดแสดงจำนวนของแต่ละประเภท */}
      {showCategoryDetails && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {Object.entries(categoryCounts).map(([category, count], index) => {
            return (
              <div className="col" key={index}>
                <div className={`card ${cardShadow} text-center text-light rounded-3`} style={cardStyle}>
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3">{category}</h5>
                    <p className="card-text">จำนวน: {count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySummary;
