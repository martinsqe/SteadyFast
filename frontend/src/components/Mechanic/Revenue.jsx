import { useEffect, useState } from "react";
import api from "../../api/axios";

const Revenue = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const response = await api.get("/mechanic/revenue");
                setRevenueData(response.data);
            } catch (error) {
                console.error("Error fetching revenue:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue();
    }, []);

    if (loading) return <div>Loading revenue data...</div>;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="mechanic-revenue">
            <h2>Revenue Analytics</h2>

            <div className="revenue-summary">
                <p>Total Revenue (This Year): <strong>${revenueData.reduce((acc, curr) => acc + curr.total, 0)}</strong></p>
            </div>

            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Jobs Completed</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenueData.length === 0 ? (
                            <tr>
                                <td colSpan="3">No revenue data available.</td>
                            </tr>
                        ) : (
                            revenueData.map(item => (
                                <tr key={item._id}>
                                    <td>{monthNames[item._id - 1]}</td>
                                    <td>{item.count}</td>
                                    <td>${item.total}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Revenue;
