import { useEffect, useState } from "react";
import api from "../../api/axios";

const MyClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await api.get("/mechanic/clients");
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    if (loading) return <div>Loading clients...</div>;

    return (
        <div className="mechanic-clients">
            <h2>My Clients</h2>
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="4">No clients found.</td>
                            </tr>
                        ) : (
                            clients.map(client => (
                                <tr key={client._id}>
                                    <td>
                                        <div className="user-name-cell">
                                            {client.profileImage && (
                                                <img
                                                    src={client.profileImage.startsWith('http') ? client.profileImage : `${import.meta.env.VITE_API_URL.replace('/api', '')}${client.profileImage}`}
                                                    alt={client.name}
                                                    className="avatar-small"
                                                />
                                            )}
                                            {client.name}
                                        </div>
                                    </td>
                                    <td>{client.email}</td>
                                    <td>{client.phone || "N/A"}</td>
                                    <td>{client.address || "N/A"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyClients;
