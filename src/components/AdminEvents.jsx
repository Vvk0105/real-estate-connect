import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, MapPin, Plus, Trash, Edit, Users, CheckCircle, XCircle, QrCode } from 'lucide-react';
import AdminScanner from './AdminScanner';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false); // Scanner Modal State

    // Application Management State
    const [showAppsModal, setShowAppsModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [applications, setApplications] = useState([]);

    const [formData, setFormData] = useState({
        name: '', description: '', venue_name: '', address: '',
        city: '', state: '', country: '',
        start_date: '', end_date: '', booth_capacity: 100
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('events/');
            setEvents(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async (eventId) => {
        try {
            // Need a way to filter apps by event.
            // Assuming `GET /exhibitors/applications/?exhibition={eventId}`
            const response = await api.get(`exhibitor/applications/?exhibition=${eventId}`);
            setApplications(response.data.results || response.data);
            setSelectedEventId(eventId);
            setShowAppsModal(true);
        } catch (error) {
            console.error("Failed to fetch applications", error);
            alert("Failed to load applications.");
        }
    };

    const handleStatusUpdate = async (appId, status, booth = null) => {
        try {
            const endpoint = status === 'APPROVED' ? 'approve' : 'reject';
            await api.post(`exhibitor/applications/${appId}/${endpoint}/`, {
                // If approving, we might send booth number if collected
                booth_number: booth // Optional
            });
            // Refresh list
            fetchApplications(selectedEventId);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Action failed.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('events/', formData);
            setShowModal(false);
            fetchEvents();
            setFormData({
                name: '', description: '', venue_name: '', address: '',
                city: '', state: '', country: '',
                start_date: '', end_date: '', booth_capacity: 100
            });
        } catch (error) {
            alert('Failed to create event');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await api.delete(`events/${id}/`);
                fetchEvents();
            } catch (error) {
                alert('Failed to delete event');
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Exhibitions</h2>
                <div className="flex gap-2">
                    <button
                        className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
                        onClick={() => setShowScanner(true)}
                    >
                        <QrCode className="h-4 w-4 mr-2" /> Scan QR
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create New
                    </button>
                </div>
            </div>

            {/* Scanner Modal */}
            {showScanner && (
                <AdminScanner onClose={() => setShowScanner(false)} />
            )}

            {loading ? <p>Loading events...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                            <div style={{ height: '150px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {event.map_image ? <img src={event.map_image} alt={event.name} /> : <Calendar className="h-12 w-12 text-gray-400" />}
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{event.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    <MapPin className="h-4 w-4 mr-1" /> {event.venue_name}, {event.city}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className="btn bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex-1 flex items-center justify-center"
                                        onClick={() => fetchApplications(event.id)}
                                    >
                                        <Users className="h-4 w-4 mr-2" /> Applications
                                    </button>
                                    <button className="btn" style={{ backgroundColor: 'var(--error)', color: 'white' }} onClick={() => handleDelete(event.id)}>
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="font-bold text-xl mb-4">Create Exhibition</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input className="input-field" placeholder="Event Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <textarea className="input-field" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            <input className="input-field" placeholder="Venue Name" value={formData.venue_name} onChange={e => setFormData({ ...formData, venue_name: e.target.value })} required />
                            <input className="input-field" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input className="input-field" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                                <input className="input-field" placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required />
                            </div>
                            <input className="input-field" placeholder="Country" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="input-label">Start Date</label>
                                    <input type="datetime-local" className="input-field" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="input-label">End Date</label>
                                    <input type="datetime-local" className="input-field" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button type="button" className="btn bg-gray-200 flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applications Modal */}
            {showAppsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl">Exhibitor Applications</h3>
                            <button onClick={() => setShowAppsModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
                        </div>

                        <div className="space-y-4">
                            {applications.length === 0 ? <p className="text-gray-500">No applications found.</p> : (
                                applications.map(app => (
                                    <div key={app.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50">
                                        <div className="mb-4 md:mb-0">
                                            <h4 className="font-bold text-lg">{app.company_name}</h4>
                                            <p className="text-sm text-gray-600">Contact: {app.contact_details} | Type: {app.business_type}</p>
                                            <p className="text-sm text-gray-600">Council: {app.council_area}</p>
                                            {app.payment_screenshot && (
                                                <a href={app.payment_screenshot} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm underline mt-1 block">
                                                    View Payment Screenshot
                                                </a>
                                            )}
                                            <p className="mt-2 text-sm font-semibold">Status: <span className={app.status === 'APPROVED' ? 'text-green-600' : app.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}>{app.status}</span></p>
                                        </div>

                                        {app.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'APPROVED', prompt("Assign Booth Number (Optional):"))}
                                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {app.status !== 'PENDING' && (
                                            <div className="text-sm text-gray-400 italic">No actions available</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
