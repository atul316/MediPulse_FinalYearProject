import React from "react";

const OrganizationDashboard = () => {
  // Organization Details
  const organizationDetails = {
    name: "Burnpur Hospital",
    email: "burnpurhospital@org.com",
    phone: "+91 6874593345",
    accessCode: "12345",
    photo: "https://via.placeholder.com/150", // Placeholder image URL
  };

  // Doctor List
  const doctors = [
    {
      id: 1,
      name: "Dr. Jane Smith",
      experience: 10,
      specialization: "Hypertension",
      department: "",
    },
    {
      id: 2,
      name: "Dr. Bob Johnson",
      experience: 15,
      specialization: "Diabetes",
      department: "",
    },
    {
      id: 3,
      name: "Dr. Alice Williams",
      experience: 12,
      specialization: "Asthma",
      department: "",
    },
  ];

  return (
    <>
      {/* Navigation */}
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

      {/* Main Content */}
      <div className="pt-10 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-6">
          {/* Organization Profile */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <img
                src={organizationDetails.photo}
                alt="Doctor"
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-semibold">
                  {organizationDetails.name}
                </h2>
                <p className="text-gray-500">
                  Access Code: {organizationDetails.accessCode}
                </p>
                <p className="text-gray-500">{organizationDetails.email}</p>
                <p className="text-gray-500">{organizationDetails.phone}</p>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Doctors List</h2>
            <table className="w-full border border-gray-200 text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Experience</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Specialzation
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {doctor.id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {doctor.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {doctor.experience}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {doctor.specialization}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {doctor.department}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationDashboard;
