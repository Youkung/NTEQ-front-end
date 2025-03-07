import React, { useEffect, useState } from "react";
import logo from "../Logo/Fulllogo.png";
import "./side.css";
import CategorySummary from './User_Dashboarddetail'; // ตรวจสอบเส้นทางให้ถูกต้อง
import { Link } from "react-router-dom";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement, // Add this for Line chart
    LineElement,  // Add this for Line chart
    ArcElement,   // Add this for Pie chart
    Title,
    Tooltip,
    Legend
);

// Give each chart a unique ID
const chartOptions = {
    bar: {
        id: 'equipment-by-node'
    },
    line: {
        id: 'usage-trends'
    },
    pie: {
        id: 'equipment-distribution'
    }
};

function Dashboard() {
    const [userName, setUserName] = useState("");
    const [deviceSummary, setDeviceSummary] = useState({
        totalDevices: 0,
        activeDevices: 0,
        inactiveDevices: 0,
        totalTypes: 0,
        totalBrands: 0,
        devicesByBrand: [],
    });
    const [equipmentByNode, setEquipmentByNode] = useState([]);
    const [dateRange, setDateRange] = useState('week');
    const [recentActivities, setRecentActivities] = useState([]);
    const categories = ["Laptop", "Tablet", "Phone", "Laptop", "Phone", "Tablet", "Laptop", "Smartwatch", "Camera", "Laptop"];

    useEffect(() => {
        // Fetch user data
        const userData = localStorage.getItem("userData");
        if (userData) {
            const user = JSON.parse(userData);
            setUserName(`${user.Name}`);
        }

        // Fetch device summary data
        const fetchDeviceSummary = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8080/api/device-summary"
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDeviceSummary({
                    totalDevices: data.totalCount,
                    activeDevices: data.activeCount,
                    inactiveDevices: data.inactiveCount,
                    totalTypes: data.typeCount,
                    totalBrands: data.brandCount,
                    devicesByBrand: data.brandDistribution,
                });
            } catch (error) {
                console.error("Error fetching device summary:", error);
            }
        };

        // Fetch equipment count by node
        const fetchEquipmentByNode = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/equipment-by-node");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setEquipmentByNode(data);
            } catch (error) {
                console.error("Error fetching equipment by node:", error);
            }
        };

        // Fetch recent activities
        const fetchRecentActivities = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/recent-activities');
                const data = await response.json();
                setRecentActivities(data);
            } catch (error) {
                console.error('Error fetching recent activities:', error);
            }
        };

        fetchDeviceSummary();
        fetchEquipmentByNode();
        fetchRecentActivities();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        window.location.href = "/";
    };

    const equipmentByNodeData = {
        labels: equipmentByNode.map(node => node.Node_Name),
        datasets: [
            {
                label: 'Equipment Count',
                data: equipmentByNode.map(node => node.EquipmentCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const renderHeader = () => (
        <div className="dashboard-header d-flex  align-items-center mb-4">
            <div className="flex-grow-1">
                <h1>รายงาน</h1>
                <p>{format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
            <div className="mt-2 p-0">
                <select
                    className="form-select"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
            </div>
            <div className="ms-3 p-0">
                <button className="btn btn-primary" onClick={() => exportData()}>
                    Export Data
                </button>
            </div>
        </div>
    );

    const renderRecentActivities = () => (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
                <h5 className="mb-0">Recent Activities</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="timeline">
                    {recentActivities.map((activity, index) => (
                        <div key={index} className="timeline-item mb-3">
                            <div className="d-flex">
                                <div className="timeline-indicator bg-primary rounded-circle me-3"></div>
                                <div>
                                    <p className="mb-1 fw-bold">{activity.title}</p>
                                    <p className="text-muted small mb-0">
                                        {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const exportData = () => {
        const data = {
            summary: deviceSummary,
            equipmentByNode: equipmentByNode,
            dateRange
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="d-flex flex-column vh-100">
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
                    <span className="me-3">{userName || "Loading..."}</span>
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
                        width: "320px",
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
                    className="flex-grow-1 p-4"
                    style={{ background: "linear-gradient(to bottom, #ffcc00, #EEE891)" }}
                >
                    <div className="container-fluid">
                        {renderHeader()}

                        {/* Dashboard Grid Layout */}
                        <div className="row g-4">
                            {/* KPIs Section */}
                            <div className="col-12">
                                <div className="row g-4">
                                    <div className="col-md-4">
                                        <div className="card text-center border-0 shadow-sm bg-primary">
                                            <div className="card-body text-white rounded">
                                                <h5 className="card-title fw-bold">อุปกรณ์ ทั้งหมด</h5>
                                                <p className="card-text display-4 fw-bold">
                                                    {deviceSummary.totalDevices}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card text-center border-0 shadow-sm bg-success">
                                            <div className="card-body text-white rounded">
                                                <h5 className="card-title fw-bold">ใช้งานอยู่</h5>
                                                <p className="card-text display-4 fw-bold">
                                                    {deviceSummary.activeDevices}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card text-center border-0 shadow-sm bg-danger">
                                            <div className="card-body text-white rounded">
                                                <h5 className="card-title fw-bold">ไม่ได้ใช้งาน</h5>
                                                <p className="card-text display-4 fw-bold">
                                                    {deviceSummary.inactiveDevices}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <CategorySummary categories={categories} />

                            {/* Charts Section */}
                            <div className="col-md-8">
                                <div className="card shadow-sm mb-4">
                                    <div className="card-body">
                                        <Bar
                                            data={equipmentByNodeData}
                                            options={chartOptions.bar}
                                        />
                                    </div>
                                </div>

                                {/* เพิ่ม Line Chart สำหรับแนวโน้มการใช้งาน */}
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5>Usage Trends</h5>
                                        <Line
                                            data={{
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                                datasets: [{
                                                    label: 'Equipment Usage',
                                                    data: [65, 59, 80, 81, 56, 55],
                                                    fill: false,
                                                    borderColor: 'rgb(75, 192, 192)',
                                                }]
                                            }}
                                            options={chartOptions.line}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Content */}
                            <div className="col-md-4">
                                {renderRecentActivities()}

                                {/* Distribution Pie Chart */}
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5>Equipment Distribution</h5>
                                        <Pie
                                            data={{
                                                labels: deviceSummary.devicesByBrand.map(item => item.brand),
                                                datasets: [{
                                                    data: deviceSummary.devicesByBrand.map(item => item.count),
                                                    backgroundColor: [
                                                        '#FF6384',
                                                        '#36A2EB',
                                                        '#FFCE56',
                                                        '#4BC0C0',
                                                        '#9966FF'
                                                    ]
                                                }]
                                            }}
                                            options={chartOptions.pie}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;