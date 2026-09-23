import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { AlertBanner } from '../../components/common/AlertBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error("Events fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setActionLoading(eventId);
    setAlert(null);
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data.success) {
        setAlert({ type: 'success', message: 'Successfully registered for event!' });
        fetchEvents();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Registration failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (eventId) => {
    setActionLoading(eventId);
    setAlert(null);
    try {
      const res = await api.post(`/events/${eventId}/cancel`);
      if (res.data.success) {
        setAlert({ type: 'info', message: 'Event registration cancelled.' });
        fetchEvents();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Cancellation failed' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">College Events, Hackathons & Fests</h1>
        <p className="text-xs text-slate-500 mt-1">Participate in national symposiums, hackathons, and campus activities</p>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => {
          const isFull = ev.capacity && ev.registered_count >= ev.capacity;
          const isPast = new Date() > new Date(ev.end_datetime);

          return (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                {/* Event Image */}
                <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                    alt={ev.title}
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    {ev.is_registered ? (
                      <Badge variant="emerald">Registered</Badge>
                    ) : isPast ? (
                      <Badge variant="slate">Concluded</Badge>
                    ) : isFull ? (
                      <Badge variant="rose">Full</Badge>
                    ) : (
                      <Badge variant="indigo">Open</Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-base font-bold text-slate-800 leading-snug">{ev.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{ev.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>{new Date(ev.start_datetime).toLocaleDateString()} · {new Date(ev.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{ev.registered_count} / {ev.capacity || 'Unlimited'} Seats Booked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                {ev.is_registered ? (
                  <button
                    onClick={() => handleCancel(ev.id)}
                    disabled={actionLoading === ev.id}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Registration</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(ev.id)}
                    disabled={isFull || isPast || actionLoading === ev.id}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isFull ? 'Capacity Reached' : 'Register for Event'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
