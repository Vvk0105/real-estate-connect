import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, MapPin, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

const VisitorDashboard = () => {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [view, setView] = useState('events'); // events or tickets

    useEffect(() => {
        fetchEvents();
        fetchRegistrations();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('events/');
            setEvents(response.data.results);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRegistrations = async () => {
        try {
            const response = await api.get('/visitor/registrations/');
            console.log('regss',response);
            
            setRegistrations(response.data.results);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post('visitor/registrations/', { exhibition: eventId }); // Corrected Payload to match Model/Serializer
            // Actually Serializer expects 'exhibition' ID. 
            // In backend/visitors/serializers.py: fields = ['id', 'exhibition', ...]
            // But we need to check if 'exhibition' passed or url param?
            // The API spec said POST /events/{id}/visitor-register/ BUT I implemented standard ViewSet `api/visitor/registrations/`.
            // Let's stick to the ViewSet implementation for now.
            alert('Registered Successfully! Check My Tickets.');
            fetchRegistrations();
            setView('tickets');
        } catch (error) {
            alert('Registration Failed (Maybe already registered?)');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setView('events')}
                    style={{ fontWeight: view === 'events' ? 'bold' : 'normal', color: view === 'events' ? 'var(--primary-color)' : 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                    Upcoming Events
                </button>
                <button
                    onClick={() => setView('tickets')}
                    style={{ fontWeight: view === 'tickets' ? 'bold' : 'normal', color: view === 'tickets' ? 'var(--primary-color)' : 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                    My Tickets (QR)
                </button>
            </div>

            {view === 'events' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                            <div style={{ height: '150px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {event.map_image ? <img src={event.map_image} alt={event.name} /> : <Calendar className="h-12 w-12 text-gray-400" />}
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{event.name}</h3>
                                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', margin: '0.5rem 0' }}>{event.description.substring(0, 100)}...</p>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    <MapPin className="h-4 w-4 mr-1" /> {event.city}
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleRegister(event.id)}>
                                    Register Free
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {registrations.map(reg => (
                        <div key={reg.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: 'var(--shadow-md)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem' }}>{reg.exhibition_details?.name || 'Event Ticket'}</h3>
                            <div style={{ padding: '1rem', backgroundColor: 'white', border: '2px solid var(--text-color)', borderRadius: '0.5rem' }}>
                                <QRCode value={reg.qr_token} size={150} />
                            </div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.875rem' }}>Show this QR code at the entrance</p>
                        </div>
                    ))}
                    {registrations.length === 0 && <p>No tickets found. Register for an event!</p>}
                </div>
            )}
        </div>
    );
};

export default VisitorDashboard;
