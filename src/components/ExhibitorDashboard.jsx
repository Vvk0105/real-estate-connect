import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, MapPin, CheckCircle, Clock, XCircle, Upload, Plus, Trash, Store, Image, DollarSign } from 'lucide-react';

const ExhibitorDashboard = () => {
    const [events, setEvents] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [view, setView] = useState('all'); // 'all', 'my', 'properties'
    const [showAppModal, setShowAppModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [appFormData, setAppFormData] = useState({
        company_name: '',
        council_area: '',
        business_type: 'Developer',
        contact_details: '',
        payment_screenshot: null
    });

    // Property Management State
    const [approvedApps, setApprovedApps] = useState([]);
    const [properties, setProperties] = useState([]);
    const [showPropModal, setShowPropModal] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [propFormData, setPropFormData] = useState({
        title: '', location: '', price_min: '', price_max: '', description: ''
    });

    useEffect(() => {
        fetchEvents();
        fetchMyApplications();
    }, []);

    useEffect(() => {
        // Filter approved applications
        const approved = myApplications.filter(app => app.status === 'APPROVED');
        setApprovedApps(approved);
        if (approved.length > 0 && view === 'properties' && !selectedAppId) {
            setSelectedAppId(approved[0].id);
        }
    }, [myApplications, view]);

    useEffect(() => {
        if (selectedAppId && view === 'properties') {
            fetchProperties(selectedAppId);
        }
    }, [selectedAppId, view]);


    const fetchEvents = async () => {
        try {
            const response = await api.get('events/');
            setEvents(response.data.results || response.data);
        } catch (error) { console.error(error); }
    };

    const fetchMyApplications = async () => {
        try {
            // Updated Endpoint: /api/exhibitors/applications/
            // Assuming router registered as 'applications' under 'exhibitors'
            // In backend/exhibitors/urls.py: router.register(r'applications', ExhibitorApplicationViewSet)
            // Included in config/urls.py as 'api/exhibitors/'
            const response = await api.get('exhibitor/applications/');
            setMyApplications(response.data.results || response.data);
        } catch (error) { console.error("Fetch Apps Error", error); }
    };

    const fetchProperties = async (appId) => {
        try {
            // Need endpoint to get properties for an app or user?
            // Existing backend `PropertyViewSet` might be generic or nested.
            // Let's assume `GET /properties/?exhibitor_application=${appId}`
            const response = await api.get(`exhibitor/properties/?exhibitor_application=${appId}`);
            setProperties(response.data.results || response.data);
        } catch (error) { console.error("Fetch Props Error", error); }
    };


    const handleFileChange = (e) => {
        setAppFormData({ ...appFormData, payment_screenshot: e.target.files[0] });
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('company_name', appFormData.company_name);
        formData.append('council_area', appFormData.council_area);
        formData.append('business_type', appFormData.business_type);
        formData.append('contact_details', appFormData.contact_details);
        formData.append('exhibition', selectedEventId); // Backend expects exhibition ID
        if (appFormData.payment_screenshot) {
            formData.append('payment_screenshot', appFormData.payment_screenshot);
        }

        try {
            await api.post('exhibitor/applications/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Application Submitted Successfully!');
            setShowAppModal(false);
            fetchMyApplications();
            // Reset Form...
        } catch (error) {
            console.error(error);
            alert('Submission Failed. Please check all fields.');
        }
    };

    const submitProperty = async (e) => {
        e.preventDefault();
        if (!selectedAppId) return;

        try {
            await api.post('exhibitor/properties/', {
                ...propFormData,
                exhibitor_application: selectedAppId
            });
            setShowPropModal(false);
            fetchProperties(selectedAppId);
            setPropFormData({ title: '', location: '', price_min: '', price_max: '', description: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to add property');
        }
    };

    const deleteProperty = async (id) => {
        if (confirm("Delete this property?")) {
            await api.delete(`exhibitor/properties/${id}/`);
            fetchProperties(selectedAppId);
        }
    };


    return (
        <div>
            {/* Tabs */}
            <div className="flex space-x-4 border-b pb-2 mb-6">
                <button onClick={() => setView('all')} className={`pb-2 px-1 ${view === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}>Available Exhibitions</button>
                <button onClick={() => setView('my')} className={`pb-2 px-1 ${view === 'my' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}>My Applications</button>
                {approvedApps.length > 0 && (
                    <button onClick={() => setView('properties')} className={`pb-2 px-1 ${view === 'properties' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}>My Properties</button>
                )}
            </div>

            {/* Content areas */}
            {view === 'all' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => {
                        const application = myApplications.find(app => app.exhibition === event.id);
                        const hasApplied = !!application;

                        return (
                            <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="h-40 bg-gray-200 flex items-center justify-center">
                                    {event.map_image ? <img src={event.map_image} className="h-full w-full object-cover" /> : <Calendar className="h-12 w-12 text-gray-400" />}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                                    <div className="text-gray-500 text-sm mb-4"><MapPin className="inline h-4 w-4 mr-1" /> {event.venue_name}, {event.city}</div>
                                    {hasApplied ? (
                                        <button
                                            disabled
                                            className={`w-full py-2 rounded text-white ${application.status === 'APPROVED' ? 'bg-green-600' : 'bg-gray-400'}`}
                                        >
                                            {application.status === 'APPROVED' ? 'Approved' : 'Application Sent'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { setSelectedEventId(event.id); setShowAppModal(true); }}
                                            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                                        >
                                            Apply for Booth
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {view === 'my' && (
                <div className="space-y-4">
                    {myApplications.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4" style={{ borderColor: app.status === 'APPROVED' ? 'green' : app.status === 'REJECTED' ? 'red' : 'orange' }}>
                            <div>
                                <h3 className="font-bold text-lg">{app.company_name}</h3>
                                <p className="text-sm text-gray-500">Event ID: {app.exhibition}</p>
                                <p className="text-sm">Status: <span className={`font-bold ${app.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>{app.status}</span></p>
                            </div>
                            {app.status === 'APPROVED' && (
                                <button onClick={() => { setView('properties'); setSelectedAppId(app.id); }} className="text-indigo-600 font-medium">Manage Properties</button>
                            )}
                        </div>
                    ))}
                    {myApplications.length === 0 && <p className="text-gray-500">No applications yet.</p>}
                </div>
            )}

            {view === 'properties' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <select
                            className="border p-2 rounded"
                            value={selectedAppId || ''}
                            onChange={(e) => setSelectedAppId(e.target.value)}
                        >
                            {approvedApps.map(app => (
                                <option key={app.id} value={app.id}>{app.company_name}</option>
                            ))}
                        </select>
                        <button onClick={() => setShowPropModal(true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center"><Plus className="h-4 w-4 mr-2" /> Add Property</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {properties.map(prop => (
                            <div key={prop.id} className="bg-white p-4 rounded shadow relative">
                                <h4 className="font-bold">{prop.title}</h4>
                                <p className="text-sm text-gray-500 mb-2">{prop.location}</p>
                                <p className="text-indigo-600 font-bold mb-2">${prop.price_min} - ${prop.price_max}</p>
                                <p className="text-sm text-gray-600 mb-4">{prop.description}</p>
                                <div className="absolute top-2 right-2">
                                    <button onClick={() => deleteProperty(prop.id)} className="text-red-500 hover:text-red-700 p-1"><Trash className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Application Modal */}
            {showAppModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 50 }}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Booth Application</h3>
                        <form onSubmit={submitApplication} className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Company Name" value={appFormData.company_name} onChange={e => setAppFormData({ ...appFormData, company_name: e.target.value })} required />
                            <input className="w-full border p-2 rounded" placeholder="Council Area" value={appFormData.council_area} onChange={e => setAppFormData({ ...appFormData, council_area: e.target.value })} required />
                            <select className="w-full border p-2 rounded" value={appFormData.business_type} onChange={e => setAppFormData({ ...appFormData, business_type: e.target.value })}>
                                <option>Developer</option>
                                <option>Broker</option>
                                <option>Loan Agent</option>
                            </select>
                            <input className="w-full border p-2 rounded" placeholder="Contact Details" value={appFormData.contact_details} onChange={e => setAppFormData({ ...appFormData, contact_details: e.target.value })} required />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot</label>
                                <input type="file" className="w-full border p-2 rounded" onChange={handleFileChange} required />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowAppModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Property Modal */}
            {showPropModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 50 }}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add Property</h3>
                        <form onSubmit={submitProperty} className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Title" value={propFormData.title} onChange={e => setPropFormData({ ...propFormData, title: e.target.value })} required />
                            <input className="w-full border p-2 rounded" placeholder="Location" value={propFormData.location} onChange={e => setPropFormData({ ...propFormData, location: e.target.value })} required />
                            <div className="flex gap-2">
                                <input type="number" className="w-full border p-2 rounded" placeholder="Min Price" value={propFormData.price_min} onChange={e => setPropFormData({ ...propFormData, price_min: e.target.value })} required />
                                <input type="number" className="w-full border p-2 rounded" placeholder="Max Price" value={propFormData.price_max} onChange={e => setPropFormData({ ...propFormData, price_max: e.target.value })} required />
                            </div>
                            <textarea className="w-full border p-2 rounded" placeholder="Description" value={propFormData.description} onChange={e => setPropFormData({ ...propFormData, description: e.target.value })} required />

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowPropModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExhibitorDashboard;
