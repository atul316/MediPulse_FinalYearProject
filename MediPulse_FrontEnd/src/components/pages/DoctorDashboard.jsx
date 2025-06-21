import React, { useEffect, useState } from "react";
import { FaUserMd } from "react-icons/fa";
import { format, addMinutes, startOfToday, addDays } from "date-fns";
import { server } from "@/main";
import axios from "axios";
import EditIcon from "../../assets/images/edit.png";
import PrescriptionDialog from "./PrescriptionDialog";
import {toast} from "react-toastify"

const DoctorDashboard = () => {
  const [user, setuser] = useState([]);
  const [loading, setloading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [matrix, setmatrix] = useState([]);
  const [appointments, setappointments] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Confirmed");
  const [onlyPatientId, setPatientId] = useState(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [medOptions, setMedOptions] = useState([]);
  const [medSearch, setMedSearch] = useState("");
  const [date, setDate] = useState(new Date());
  const doctorId = user._id;
  const doctorDetails = {
    name: user.firstName + " " + user.lastName,
    specialization: user.specialization,
    email: user.email,
    phone: user.contactNumber,
    photo: user.profilePicture,
    medicalRegNumber: user.medicalRegNumber,
    MyDays: user.timeSlots,
    qualifications: user.qualifications,
    affiliations: user.affiliations,
    consultationFee: user.consultationFee,
  };

  useEffect(() => {
    const fetchData = async () => {
      setloading(true);

      // Fetch user
      let fetchedUser = null;
      try {
        const response = await fetch(`${server}/common/getuserdetails`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setuser(data.user);
          fetchedUser = data.user;
        } else {
          setloading(false);
          return;
        }
      } catch (error) {
        setloading(false);
        return;
      }

      // Fetch matrix
      try {
        const response = await axios.post(
          `${server}/doctors/get-my-matrix`,
          { doctorId: fetchedUser._id },
          {
            header: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.data && response.data.availabilityMatrix) {
          setmatrix(response.data.availabilityMatrix);
        }
        setResponseData(response);
        setError(null);
      } catch (err) {
        setError(err.message);
        setResponseData(null);
      }

      // Fetch patient appointment list
      try {
        const response = await axios.post(
          `${server}/doctors/get-my-all-patient-appointment`,
          { doctorId: fetchedUser._id },
          {
            header: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.data && response.data.appointments) {
          setappointments(response.data.appointments);
        }
        setResponseData(response);
        setError(null);
      } catch (err) {
        setError(err.message);
        setResponseData(null);
      }

      setloading(false);
    };

    fetchData();
  }, []);

  const generateTimeSlots = (start, end, breakStart, breakEnd) => {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${start}:00`);
    const breakStartTime = new Date(`1970-01-01T${breakStart}:00`);
    const breakEndTime = new Date(`1970-01-01T${breakEnd}:00`);
    const endTimeDate = new Date(`1970-01-01T${end}:00`);

    while (currentTime < endTimeDate) {
      const timeStr = format(currentTime, "HH:mm");
      if (currentTime < breakStartTime || currentTime >= breakEndTime) {
        slots.push(timeStr);
      }
      currentTime = addMinutes(currentTime, 30);
    }
    return slots;
  };

  const generateDates = (rows) => {
    const today = startOfToday();
    return Array.from({ length: rows }, (_, index) =>
      format(addDays(today, index), "dd-MM-yyyy")
    );
  };

  const timeSlots = generateTimeSlots("09:00", "17:00", "13:00", "14:00");
  const dates = generateDates(30);

  return (
    <>
      <nav className="navbar fixed top-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <a href="/" className="text-pink-700 font-bold text-3xl">
            MediPulse
          </a>
          <ul className="flex space-x-6 text-pink-800 text-lg">
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

      <div className="pt-10 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-6">
          {/* Doctor Profile */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <img
                src={doctorDetails.photo}
                alt="Doctor"
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-semibold">{doctorDetails.name}</h2>
                <p className="text-gray-700">
                  {doctorDetails.medicalRegNumber}
                </p>
                <p className="text-gray-700">{doctorDetails.specialization}</p>
                <p className="text-gray-500">{doctorDetails.email}</p>
                <p className="text-gray-500">{doctorDetails.phone}</p>
                <p className="text-gray-500">{doctorDetails.MyDays}</p>
                <p className="text-gray-500">{doctorDetails.qualifications}</p>
                <p className="text-gray-500">{doctorDetails.affiliations}</p>
              </div>
              <FaUserMd className="text-6xl text-blue-500 ml-auto" />
            </div>
          </div>

          {/* ✅ Patient List */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Patient List</h2>
            <table className="w-full border border-gray-200 text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Sl.No</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Patient Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Contact</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Appointment Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Time</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((patient, index) => {
                  const currentStatus =
                    statusMap[patient.appointmentId] ||
                    patient.status ||
                    "Confirmed";
                  return (
                    <tr key={patient.appointmentId}>
                      <td className="border border-gray-300 px-4 py-2">
                        {index+1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {patient.patientName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {patient.patientContact}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {patient.patientEmail}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {patient.appointmentDate}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {patient.timeSlot}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {currentStatus}
                        {currentStatus === "Completed" && (
                          <button
                            className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            onClick={() => {
                              setSelectedStatus(currentStatus);
                              setSelectedAppointmentId(patient.appointmentId);
                              setIsPrescriptionOpen(true);
                              setPatientId(patient.patientId);
                            }}
                          >
                            Generate Prescription
                          </button>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="ml-2 px-3 py-3 text-white rounded bg-white w-[3rem] hover:bg-blue-200 hover:shadow-xl hover:scale-110 transition duration-300"
                          onClick={() => {
                            setSelectedAppointmentId(patient.appointmentId);
                            setSelectedStatus(currentStatus);
                            setIsModalOpen(true);
                            setPatientId(patient.patientId);
                          }}
                        >
                          <img src={EditIcon} className=""></img>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ MODAL FOR STATUS CHANGE */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-xl font-bold mb-4">
                  Change Appointment Status
                </h3>
                <select
                  className="w-full border border-gray-300 p-2 rounded mb-4"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-800"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={async () => {
                      try {
                        const res = await axios.patch(
                          `https://medipulse-backend.vercel.app/api/doctors/change-appointment-status/${selectedAppointmentId}`,
                          {
                            status: selectedStatus,
                          },
                          {
                            headers: {
                              "Content-Type": "application/json",
                            },
                            withCredentials: true,
                          }
                        );

                        if (res.status === 200) {
                          setStatusMap((prev) => ({
                            ...prev,
                            [selectedAppointmentId]: selectedStatus,
                          }));
                          setIsModalOpen(false);

                          // ✅ Refresh appointment list
                          const refreshed = await axios.post(
                            `${server}/doctors/get-my-all-patient-appointment`,
                            { doctorId: doctorId },
                            {
                              headers: {
                                "Content-Type": "application/json",
                              },
                              withCredentials: true,
                            }
                          );
                          if (refreshed.data?.appointments) {
                            setappointments(refreshed.data.appointments);
                            toast.success("Status updated!")
                          }
                        } else {
                          toast.error("Failed to update status");
                        }
                      } catch (error) {
                        console.error("Error updating status:", error);
                        toast.error("Error updating appointment status");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPrescriptionOpen && (
            <PrescriptionDialog
              open={isPrescriptionOpen}
              onClose={() => setIsPrescriptionOpen(false)}
              onGenerate={async (formData) => {
                try {
                  const response = await axios.post(
                    "https://medipulse-backend.vercel.app/api/doctors/generate-prescription",
                    {
                      doctorId: doctorId,
                      patientId: onlyPatientId,
                      appointmentId: selectedAppointmentId,
                      disease: formData.disease,
                      medication: formData.medication.map((med) => med._id),
                      remarks: formData.remarks,
                      dateIssued: date.toISOString(),
                    },
                    {
                      headers: { "Content-Type": "application/json" },
                      withCredentials: true,
                    }
                  );

                  if (response.status === 200 || response.data.success) {
                    toast.success("Prescription saved and sent to Patient successfully.");
                    setIsPrescriptionOpen(false);

                    const refreshed = await axios.post(
                      `${server}/doctors/get-my-all-patient-appointment`,
                      { doctorId: doctorId },
                      {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                      }
                    );
                    if (refreshed.data?.appointments) {
                      setappointments(refreshed.data.appointments);
                    }
                  } else {
                    toast.error("Failed to save prescription");
                  }
                } catch (error) {
                  console.error("Prescription submission failed:", error);
                  toast.error("An error occurred while saving prescription");
                } finally {
                  const payload = {
                    doctorId: doctorId,
                    patientId: onlyPatientId,
                    disease: formData.disease,
                    medication: formData.medication.map((med) => med.label),
                    remarks: formData.remarks,
                    dateIssued: new Date().toISOString(),
                  };

                  console.log("Sending prescription payload:", payload);
                }
              }}
            />
          )}

          {/* Appointment Grid */}
          <div className="bg-white shadow-lg rounded-lg p-3">
            <h2 className="text-2xl font-bold mb-4">Appointment Grid</h2>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full">
                <thead>
                  <tr>
                    <th className="p-4 bg-gray-300 text-left font-bold">
                      Date
                    </th>
                    {matrix[0]?.timeSlots.map((time, index) => (
                      <th
                        key={index}
                        className="p-4 bg-gray-300 text-center font-bold"
                      >
                        {time.slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((day, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-4 bg-gray-100 text-left font-medium">
                        {day.date}
                      </td>
                      {day.timeSlots.map((slot, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className={`p-4 border border-gray-200 text-center ${
                            slot.status === 1
                              ? "bg-green-400 hover:bg-green-500"
                              : "bg-gray-50 hover:bg-gray-200"
                          }`}
                        >
                          {slot.status === 1 ? "Booked" : "Available"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
