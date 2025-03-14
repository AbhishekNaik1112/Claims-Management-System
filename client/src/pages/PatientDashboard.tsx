import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LogOut,
  PlusCircle,
  Eye,
  RotateCw,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Claim {
  _id: string;
  amount: number;
  approvedAmount: number;
  status: string;
  createdAt: string;
  description: string;
  patientName: string;
  patientEmail: string;
  insurerComments?: string;
  supportingDocuments?: string;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);

  const [newClaim, setNewClaim] = useState({
    patientName: '',
    patientEmail: '',
    description: '',
    amount: '',
    supportingDocuments: '',
  });

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const email = localStorage.getItem('email');
      const response = await axios.get('http://localhost:3000/claims', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { patientEmail: email },
      });
      setClaims(response.data);
    } catch {
      console.error('Error fetching claims');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleNewClaim = () => {
    setIsNewClaimModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClaim((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitClaim = async () => {
    try {
      await axios.post('http://localhost:3000/claims', newClaim, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setIsNewClaimModalOpen(false);
      fetchClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    navigate('/');
  };

  const statusBadge = (status: string) => {
    const baseStyle = 'px-3 py-1 rounded-full text-sm font-semibold';
    switch (status) {
      case 'approved':
        return (
          <span className={`${baseStyle} bg-green-500 text-white`}>
            <CheckCircle size={14} className="inline-block mr-1" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseStyle} bg-orange-500 text-white`}>
            <Clock size={14} className="inline-block mr-1" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseStyle} bg-red-500 text-white`}>
            <AlertCircle size={14} className="inline-block mr-1" /> Rejected
          </span>
        );
      default:
        return <span className={`${baseStyle} bg-gray-300`}>Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="flex justify-between items-center p-6 shadow-lg border-b border-gray-300 rounded-lg">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchClaims}
            disabled={isLoading}
            className="px-6 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:opacity-80 transition"
          >
            <RotateCw size={18} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleNewClaim}
            className="px-6 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:opacity-80 transition"
          >
            <PlusCircle size={18} />
            New
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:opacity-80 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2 bg-white shadow-sm rounded-lg mt-6 mb-4"
      >
        <option value="all">All Claims</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <div className="overflow-x-auto">
        {claims.length === 0 ? (
          <p className="text-gray-500">No claims submitted yet.</p>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <table className="w-full text-black text-center">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Approved Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Description</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-200 transition">
                    <td className="p-4">{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">₹{claim.amount}</td>
                    <td className="p-4">
                      ₹{claim.status === 'rejected' ? 0 : claim.approvedAmount || 'Pending'}
                    </td>
                    <td className="p-4">{statusBadge(claim.status)}</td>
                    <td className="p-4">{claim.description}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewClaim(claim)}
                        className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:opacity-80 transition"
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isNewClaimModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96 text-black shadow-lg">
            <h3 className="text-xl font-bold mb-4">New Claim</h3>

            <input
              type="text"
              name="patientName"
              value={newClaim.patientName}
              onChange={handleInputChange}
              placeholder="Patient Name"
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="patientEmail"
              value={newClaim.patientEmail}
              onChange={handleInputChange}
              placeholder="Patient Email"
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              name="description"
              value={newClaim.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />

            <input
              type="number"
              name="amount"
              value={newClaim.amount}
              onChange={handleInputChange}
              placeholder="Amount"
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
            <input
              type="file"
              name="supportingDocuments"
              value={newClaim.supportingDocuments}
              onChange={handleInputChange}
              placeholder="Amount"
              className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
              accept="image/jpeg,image/png,image/jpg"
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsNewClaimModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitClaim}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && selectedClaim && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96 text-black shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Claim Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p>
                <strong>Date:</strong> {new Date(selectedClaim.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedClaim.amount}
              </p>
              <p>
                <strong>Approved Amount:</strong> ₹{selectedClaim.approvedAmount || 'Pending'}
              </p>
              <p>
                <strong>Status:</strong> {statusBadge(selectedClaim.status)}
              </p>
              <p>
                <strong>Description:</strong> {selectedClaim.description}
              </p>
              {selectedClaim.insurerComments && (
                <p>
                  <strong>Insurer Comments:</strong> {selectedClaim.insurerComments}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 px-6 py-2 bg-black text-white rounded-lg w-full hover:opacity-80 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
