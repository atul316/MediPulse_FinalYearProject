import React, { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { server } from "@/main";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import OrderSummary from "./OrderSummary";
import {toast} from "react-toastify"

const PatientDashboard = () => {
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userid, setuserid] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${server}/common/getuserdetails`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setPatientDetails(data.user);
          setuserid(data.user._id);
        } else {
          setError(data.message || "Failed to fetch user details.");
        }
      } catch {
        setError("An error occurred while fetching user details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userid) return;
      setLoading(true);
      try {
        const response = await axios.post(
          `${server}/patient/get-all-appointments`,
          { patientId: userid },
          {
            header: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setAppointments(response.data.bookings || []);
      } catch {
        setError("An error occurred while fetching appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [userid]);

  const [lastViewedId, setLastViewedId] = useState(null);

  const handleViewPrescription = async (appointmentId) => {
    if (lastViewedId === appointmentId && prescriptions.length > 0) {
      setPrescriptionModal(true);
      return;
    }

    try {
      const res = await axios.post(
        "https://medipulse-backend.vercel.app/api/patient/get-patient-prescriptions-by-appointment",
        { appointmentId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // ✅ FIX HERE
      if (res.data?.prescription) {
        // Wrap single object in array to reuse modal rendering logic
        setPrescriptions([res.data.prescription]);
        setLastViewedId(appointmentId);
        setPrescriptionModal(true);
      } else {
        toast.warn("No prescription found.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to fetch prescription.");
    }
  };

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userid) return;
      try {
        const res = await axios.get(
          `https://medicine-store-backend-three.vercel.app/orders/user/${userid}`
        );
        if (res.status === 200) {
          setOrders(res.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };

    fetchOrders();
  }, [userid]);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 z-50 bg-white shadow-md navbar">
        <div className="container flex items-center justify-between px-6 py-3 mx-auto">
          <a href="/" className="text-3xl font-bold text-pink-700">
            MediPulse
          </a>
          <ul className="flex space-x-6 text-lg text-pink-800">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/#features">Features</a>
            </li>
            <li>
              <a href="/">Log Out</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen pt-10 bg-gray-100">
        <div className="container px-6 mx-auto">
          {/* Patient Profile */}
          <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-6">
              <FaUserAlt className="text-6xl text-blue-500" />
              {patientDetails ? (
                <div>
                  <h2 className="text-2xl font-semibold">
                    {`${patientDetails.firstName} ${patientDetails.lastName}` ||
                      "No Name Available"}
                  </h2>
                  <p className="text-gray-500">
                    {patientDetails.email || "No Email Available"}
                  </p>
                  <p className="text-gray-500">
                    {patientDetails.contactNumber || "No Phone Available"}
                  </p>
                  <p className="text-gray-500">
                    {patientDetails.address || "No Address Available"}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Loading patient details...</p>
              )}
            </div>
          </div>

          {/* Appointments List */}
          <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
            <h2 className="mb-6 text-2xl font-bold">My Appointments</h2>
            {appointments.length > 0 ? (
              <table className="w-full border border-collapse border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Sl.No.</th>
                    <th className="px-4 py-2 border">Doctor Name</th>
                    <th className="px-4 py-2 border">Appointment Date</th>
                    <th className="px-4 py-2 border">Time Slot</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Prescription</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr key={index} className="text-center">
                      <td className="px-4 py-2 border">{index + 1}</td>
                      <td className="px-4 py-2 border">
                        {`${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.appointmentDate}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.timeSlot}
                      </td>
                      <td className="px-4 py-2 border">{appointment.status}</td>
                      <td className="px-4 py-2 border">
                        <button
                          disabled={appointment.status !== "Completed"}
                          onClick={() =>
                            handleViewPrescription(appointment._id)
                          }
                          className={`px-3 py-1 rounded text-white transition
                        ${
                          appointment.status === "Completed"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 cursor-not-allowed"
                        }
                      `}
                        >
                          View Prescription
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No appointments found.</p>
            )}
          </div>

          {/* Prescription Modal */}
          <Dialog open={prescriptionModal} onOpenChange={setPrescriptionModal}>
            <DialogContent className="w-full max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-gray-800">
                  Prescription Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {prescriptions.map((pres, i) => (
                  <div
                    key={i}
                    className="p-5 bg-white border border-gray-300 shadow-md rounded-xl"
                  >
                    <div className="mb-4">
                      <p className="text-lg">
                        <strong>Disease:</strong> {pres.disease}
                      </p>
                      <p className="text-gray-700">
                        <strong>Remarks:</strong> {pres.remarks}
                      </p>
                      <p className="text-gray-700">
                        <strong>Date Issued:</strong>{" "}
                        {new Date(pres.dateIssued).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-2 text-lg font-semibold">Medicines:</h4>
                      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {(pres.medication || []).map((med, idx) => (
                          <li
                            key={idx}
                            className="p-5 transition duration-300 border border-gray-200 shadow-lg rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-xl"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-800">
                                {med.name}
                              </h3>
                              <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                {med.category}
                              </span>
                            </div>

                            <p className="mb-1 text-sm text-gray-600">
                              <strong>Description:</strong> {med.description}
                            </p>

                            <p className="mb-1 text-sm text-gray-600">
                              <strong>Price:</strong>{" "}
                              <span className="font-semibold text-green-600">
                                ₹{Math.round(med.price * 83)}
                              </span>
                            </p>

                            <p className="mb-1 text-sm text-gray-600">
                              <strong>Stock:</strong> {med.stock}
                            </p>

                            <p className="mb-3 text-sm text-gray-600">
                              <strong>Expiry:</strong>{" "}
                              {new Date(med.expiryDate).toLocaleDateString()}
                            </p>

                            {med.imageUrl && (
                              <div className="w-full h-32 overflow-hidden rounded-md">
                                <img
                                  src={med.imageUrl}
                                  alt={med.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {prescriptions.map((pres, i) => (
                <div key={i} className="p-4 border rounded shadow">
                  {/* prescription details... */}
                  <DialogFooter className="mt-4">
                    <Button
                      onClick={() => setPrescriptionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-yellow-400 hover:bg-yellow-600"
                      onClick={() => {
                        setSelectedPrescription(pres);
                        // setPrescriptionModal(false);
                        setOrderModalOpen(true);
                      }}
                    >
                      Order Now
                    </Button>
                  </DialogFooter>
                </div>
              ))}
            </DialogContent>
          </Dialog>

          <OrderSummary
            open={orderModalOpen}
            onClose={() => setOrderModalOpen(false)}
            prescription={selectedPrescription}
            onPlaceOrder={async (medicineIds, totalAmount) => {
              try {
                const res = await axios.post(
                  "https://medicine-store-backend-three.vercel.app/orders",
                  {
                    customer: userid, // already available in state
                    medicineIds,
                    totalAmount,
                    orderStatus: "confirmed",
                    paymentStatus: "paid",
                    shippingAddress: "123 Main St, Asansol, West Bengal", // replace if dynamic
                    orderDate: new Date().toISOString(),
                    expectedDeliveryDate: new Date(
                      Date.now() + 3 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                  },
                  {
                    headers: { "Content-Type": "application/json" },
                    // withCredentials: true,
                  }
                );
                toast.success("Order placed successfully!");
                setOrderModalOpen(false);
                setPrescriptionModal(false)
              } catch (error) {
                console.error("Order failed", error);
                toast.error("Failed to place order.");
              }
            }}
          />

          {/* Order Details Table */}
          
            <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
              <h2 className="mb-6 text-2xl font-bold">My Orders</h2>
              {orders.length > 0 ? (
              <table className="w-full border border-collapse border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Order ID</th>
                    <th className="px-4 py-2 border">Medicines</th>
                    <th className="px-4 py-2 border">Total Amount</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Payment</th>
                    <th className="px-4 py-2 border">Ordered On</th>
                    <th className="px-4 py-2 border">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id} className="text-center">
                      <td className="px-4 py-2 border">{order._id}</td>
                      <td className="px-4 py-2 border">
                        <ul className="text-left list-disc list-inside">
                          {order.medicineIds.map((med, idx) => (
                            <li key={idx}>{med.name}</li>
                          ))}
                        </ul>
                      </td>

                      <td className="px-4 py-2 font-semibold text-green-700 border">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-4 py-2 border">{order.orderStatus}</td>
                      <td className="px-4 py-2 border">
                        {order.paymentStatus}
                      </td>
                      <td className="px-4 py-2 border">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border">
                        {new Date(
                          order.expectedDeliveryDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ): (
              <p className="text-gray-500">No Orders found.</p>
            )}
            </div>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
