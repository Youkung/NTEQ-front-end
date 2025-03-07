import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import React from 'react';

function UserDashboarddetail({ categories }) {
  // คำนวณจำนวนแต่ละประเภท
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const totalCategories = Object.keys(categoryCounts).length;

  const cardStyle = {
    backgroundColor: "#3b82f6",
    padding: "10px",
    position: "relative",
  };

  const cardShadow = 'shadow-sm';

  const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  return (
    <div className="container py-5">
      <div className="row justify-content-center mb-4">
        <div className="col-12 col-md-6">
          <div className={`card ${cardShadow} text-center text-light rounded-3`} style={cardStyle}>
            <div className="card-body">
              <h3 className="fw-bold">ประเภททั้งหมด</h3>
              <h1 className="fw-bold">{totalCategories}</h1>
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

      {showCategoryDetails && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {Object.entries(categoryCounts).map(([category, count], index) => (
            <div className="col" key={index}>
              <div className={`card ${cardShadow} text-center text-light rounded-3`} style={cardStyle}>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">{category}</h5>
                  <p className="card-text">จำนวน: {count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboarddetail;
