import React, { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, Users, Trash2, Users2, Eye } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AlertBanner } from '../../components/common/AlertBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Create Event Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Registrations Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

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
      console.error("Events load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setAlert(null);

    try {
      const res = await api.post('/events', {
        title,
        description,
        venue,
        start_datetime: new Date(startDate).toISOString(),
        end_datetime: new Date(endDate).toISOString(),
        capacity: parseInt(capacity),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'
      });

      if (res.data.success) {
        setAlert({ type: 'success', message: 'Event created and published successfully!' });
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setVenue('');
        fetchEvents();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleViewRegistrations = async (ev) => {
    setSelectedEvent(ev);
    setRegistrationsModalOpen(true);
    setLoadingRegs(true);
    try {
      const res = await api.get(`/events/${ev.id}/registrations`);
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      console.error("Registrations fetch error", err);
    } finally {
      setLoadingRegs(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Campus Events & Hackathons</h1>
          <p className="text-xs text-slate-500 mt-1">Host and manage collegiate hackathons, conferences, fests, and workshops</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campus Event</span>
        </button>
      </div>

      {alert && (
        <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
                <img
                  src={ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'}
                  alt={ev.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={ev.status}>{ev.status}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-800">{ev.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ev.description}</p>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{new Date(ev.start_datetime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{ev.registered_count} / {ev.capacity} Attendees</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => handleViewRegistrations(ev)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Registered Students ({ev.registered_count})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Campus Event"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual TechSymposium 2025"
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Venue / Hall</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., Central Auditorium & Lab 4"
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Maximum Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Banner Image URL (Optional)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Event Description & Rules</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed schedule, eligibility criteria, prize pools..."
              className="w-full p-2.5 bg-slate-50 border rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 border rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Registrations List Modal */}
      {selectedEvent && (
        <Modal
          isOpen={registrationsModalOpen}
          onClose={() => setRegistrationsModalOpen(false)}
          title={`Registered Attendees: ${selectedEvent.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {loadingRegs ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading registrations...</p>
            ) : registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Enrollment No.</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Registration Time</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{r.enrollment_number}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.student_name}</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(r.registered_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="emerald">{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No student registrations recorded yet.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
