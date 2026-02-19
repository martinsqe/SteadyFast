import { useState, useEffect } from "react";
import axios from "axios";
import "./AvailableJobs.css"; // Reuse available jobs styling for consistency

function MechanicActiveJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActiveJobs = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/services/my-active`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setJobs(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching active jobs:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveJobs();
    }, []);

    // Periodic location updates for jobs that are 'on_the_way'
    useEffect(() => {
        const activeDrivingJobs = jobs.filter(j => j.status === 'on_the_way');

        if (activeDrivingJobs.length > 0) {
            const interval = setInterval(() => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        const token = localStorage.getItem("token");

                        // Update for each active driving job (usually just one)
                        for (const job of activeDrivingJobs) {
                            try {
                                await axios.post(
                                    `${import.meta.env.VITE_API_URL}/services/update-location`,
                                    { latitude, longitude, jobId: job._id },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );
                                console.log(`📍 Sent location update for job ${job._id}`);
                            } catch (e) {
                                console.error("Failed to send location update:", e);
                            }
                        }
                    });
                }
            }, 10000); // Every 10 seconds

            return () => clearInterval(interval);
        }
    }, [jobs]);

    const handleStatusUpdate = async (jobId, status) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/services/${jobId}/status`,
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // If completed, remove from list or refresh
            if (status === 'completed') {
                setJobs(prev => prev.filter(j => j._id !== jobId));
                alert("Job marked as completed!");
            } else {
                fetchActiveJobs();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="loading">Loading active jobs...</div>;

    return (
        <div className="available-jobs">
            <h2>Your Active Jobs</h2>

            {jobs.length === 0 ? (
                <div className="no-jobs">
                    <p>You don't have any active jobs at the moment.</p>
                    <p>Go to "Available Jobs" to find new requests!</p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {jobs.map((job) => (
                        <div key={job._id} className="job-card">
                            <div className="job-header">
                                <span className="vehicle-type">{job.vehicleType}</span>
                                <span className="price">${job.price}</span>
                            </div>

                            <div className="job-problem">
                                <strong>{job.problem}</strong>
                            </div>

                            <div className={`status-badge ${job.status}`} style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                marginBottom: '10px',
                                display: 'inline-block',
                                background: job.status === 'on_the_way' ? '#3498DB' : job.status === 'arrived' ? '#F1C40F' : '#E67E22',
                                color: '#fff'
                            }}>
                                {job.status.replace('_', ' ').toUpperCase()}
                            </div>

                            <div className="job-client">
                                {job.client && (
                                    <>
                                        <div className="avatar-placeholder" style={{ width: '40px', height: '40px', marginRight: '10px' }}>
                                            {job.client.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="client-name">{job.client.name}</p>
                                            <p className="client-phone">{job.client.phone}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="action-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '15px' }}>
                                {job.status === 'accepted' && (
                                    <button
                                        className="btn-on-the-way"
                                        onClick={() => handleStatusUpdate(job._id, 'on_the_way')}
                                        style={{ background: '#3498DB', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        🚀 Start Driving
                                    </button>
                                )}

                                {job.status === 'on_the_way' && (
                                    <button
                                        className="btn-arrived"
                                        onClick={() => handleStatusUpdate(job._id, 'arrived')}
                                        style={{ background: '#F1C40F', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        📍 Reached Location
                                    </button>
                                )}

                                {(job.status === 'arrived' || job.status === 'on_the_way' || job.status === 'accepted') && (
                                    <button
                                        className="btn-complete"
                                        onClick={() => handleStatusUpdate(job._id, 'completed')}
                                        style={{ background: '#27AE60', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        🏁 Complete Job
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MechanicActiveJobs;
