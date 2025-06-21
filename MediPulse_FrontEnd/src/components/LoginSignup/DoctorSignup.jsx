import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SidePic from "./../../assets/bg-sidebar-desktop.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import VerifyEmailandPhone from "./VerifyEmailandPhone";

import axios from "axios";
import { setActivationToken } from "@/Auth/SetActivationToken";
import Loader from "../Common/Loader";
import { server } from "@/main";
import { toast } from "react-toastify";


const DoctorSignup = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setloading] = useState(false);
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleVerify = () => {
    if (validateOtherDetails()) {
      handleSubmit();
      
    }
  };

  // State for Basic Details Form (Step 1)
  const [basicDetails, setBasicDetails] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    medicalRegNumber: "",
  });

  // State for Medical Details Form (Step 2)
  const [medicalDetails, setMedicalDetails] = useState({
    specialization: "",
    qualifications: "",
    experience: "",
    affiliations: "",
    department: "",
  });
  // State for Appointment Details Form (Step 3)
  const [appointmentDetails, setAppointmentDetails] = useState({
    consultationFee: "",
    availableDays: "",
    timeSlots: "",
    mode: "",
    chamberNumber: "",
    organizations: "",
  });

  // State for Other Details Form (Step 4)
  const [otherDetails, setOtherDetails] = useState({
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedBasicDetails = localStorage.getItem("basicDetails");
    const savedMedicalDetails = localStorage.getItem("medicalDetails");
    const savedAppointmentDetails = localStorage.getItem("appointmentDetails");
    const savedOtherDetails = localStorage.getItem("otherDetails");

    if (savedBasicDetails) setBasicDetails(JSON.parse(savedBasicDetails));
    if (savedMedicalDetails) setMedicalDetails(JSON.parse(savedMedicalDetails));
    if (savedAppointmentDetails)
      setAppointmentDetails(JSON.parse(savedAppointmentDetails));
    if (savedOtherDetails) setOtherDetails(JSON.parse(savedOtherDetails));
  }, []);

  // Handle changes for Basic Details
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails({ ...basicDetails, [name]: value });
  };

  // Handle changes for Other Details
  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    setOtherDetails({ ...otherDetails, [name]: value });
  };

  // Handle changes for Medical Details
  const handleMedicalChange = (e) => {
    const { name, value } = e.target;
    setMedicalDetails({ ...medicalDetails, [name]: value });
  };
  // Handle changes for Appointment Details
  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentDetails({ ...appointmentDetails, [name]: value });
  };

  const [photo, setPhoto] = useState(null);
  // Validation for Step 1 (Basic Details)
  const validateBasicDetails = () => {
    let newErrors = {};
    Object.keys(basicDetails).forEach((key) => {
      if (!basicDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });
    if (basicDetails.fullName.length < 3) {
      newErrors.fullName = "Full Name should be at least 3 letters";
    }
    if (!photo) {
      newErrors.photo = "Photo is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 4 (Other Details)
  const validateOtherDetails = () => {
    let newErrors = {};
    Object.keys(otherDetails).forEach((key) => {
      if (!otherDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(otherDetails.email)) {
      newErrors.email = "Invalid email address";
    }

    if (otherDetails.password !== otherDetails.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 3 (Appointment Details)
  const validateAppointmentDetails = () => {
    let newErrors = {};
    Object.keys(appointmentDetails).forEach((key) => {
      if (!appointmentDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 2 (Medical Details)
  const validateMedicalDetails = () => {
    let newErrors = {};
    Object.keys(medicalDetails).forEach((key) => {
      if (!medicalDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    localStorage.removeItem("basicDetails");
    localStorage.removeItem("medicalDetails");
    localStorage.removeItem("appointmentDetails");
    localStorage.removeItem("otherDetails");
    localStorage.removeItem("photo"); // Clear the photo from local storage
    setPhoto(null); // Clear the state

    setBasicDetails({
      fullName: "",
      dateOfBirth: "",
      gender: "",
      medicalRegNumber: "",
    });

    setMedicalDetails({
      specialization: "",
      qualifications: "",
      experience: "",
      affiliations: "",
      department: "",
    });

    setAppointmentDetails({
      consultationFee: "",
      availableDays: "",
      timeSlots: "",
      mode: "",
      chamberNumber: "",
      organizations: "",
    });

    setOtherDetails({
      email: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
    });
    navigate("/");
  };

  // Function to handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setPhoto(base64);
        localStorage.setItem("photo", base64); // Save the Base64 string to local storage
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const savedPhoto = localStorage.getItem("photo");
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
  }, []);

  // Handle Next Button
  const handleBasicNext = () => {
    if (validateBasicDetails()) {
      localStorage.setItem("basicDetails", JSON.stringify(basicDetails));
      setErrors({});
      setStep(2);
    }
  };
  const handleMedicalNext = () => {
    if (validateMedicalDetails()) {
      localStorage.setItem("medicalDetails", JSON.stringify(medicalDetails));
      setErrors({});
      setStep(3);
    }
  };
  const handleAppointmentNext = () => {
    if (validateAppointmentDetails()) {
      localStorage.setItem(
        "appointmentDetails",
        JSON.stringify(appointmentDetails)
      );
      setErrors({});
      setStep(4);
    }
  };

  // Handle Back Button
  const handleOtherBack = () => {
    setStep(3);
  };
  const handleAppointmentBack = () => {
    setStep(2);
  };
  const handleMedicalBack = () => {
    setStep(1);
  };

  // Handle Submit Button
  const handleSubmit = async() => {
    if (validateOtherDetails()) {
      const completeData = {
        ...basicDetails,
        ...medicalDetails,
        ...appointmentDetails,
        ...otherDetails,
        photo,
      };
      console.log("Complete Data:", completeData);



  // Consolidated Doctor Data
const doctorData = {
  // Basic Details
  firstName: basicDetails.fullName.split(" ")[0] || "", // Extract first name
  lastName: basicDetails.fullName.split(" ")[1] || "", // Extract last name
  dob: basicDetails.dateOfBirth, // Format: "YYYY-MM-DD"
  gender: basicDetails.gender, // Example: "Male" or "Female"
  medicalRegNumber: basicDetails.medicalRegNumber, // String

  // Medical Details
  specialization: [medicalDetails.specialization], // Array of strings
  qualifications: medicalDetails.qualifications, // String
  experience: parseInt(medicalDetails.experience, 10), // Integer
  affiliations: medicalDetails.affiliations, // String
  department: medicalDetails.department, // String

  // Appointment Details
  consultationFee: parseFloat(appointmentDetails.consultationFee), // Float
  availableDays: appointmentDetails.availableDays.split(",").map(day => day.trim()), // Array of strings
  timeSlots: appointmentDetails.timeSlots.split(",").map(slot => slot.trim()), // Array of strings
  mode: appointmentDetails.mode, // Example: "Online", "Offline", or "Both"
  chamberNumber: appointmentDetails.chamberNumber, // String
  organizations: appointmentDetails.organizations.split(",").map(org => org.trim()), // Array of strings

  // Other Details
  email: otherDetails.email, // String
  contactNumber: otherDetails.contactNumber, // String
  password: otherDetails.password, // String
  profilePicture: photo, // Default placeholder
  role: "doctor", // Static value
};

setloading(true);

try {
  const response = await axios.post(
    `${server}/doctors/register`,
    doctorData,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials:true,
    }
  );
  console.log("Registration successful:", response.data);
  setActivationToken(response.data.token)
  console.log(response.data.token)
  toast.success("Registration Sucessful!")
  setloading(false)
  setDialogOpen(true);
  
} catch (error) {
  console.error("Error during registration:", error.response?.data || error.message);
  toast.error("Error during registration:", error.response?.data || error.message);
  setloading(false)
}


      // Clear local storage
      localStorage.removeItem("basicDetails");
      localStorage.removeItem("medicalDetails");
      localStorage.removeItem("appointmentDetails");
      localStorage.removeItem("otherDetails");
      localStorage.removeItem("photo"); // Clear the photo from local storage
      setPhoto(null); // Clear the state

      // alert("Registration successful!");

      // Reset form states
      // setBasicDetails({
      //   fullName: "",
      //   dateOfBirth: "",
      //   gender: "",
      //   medicalRegNumber: "",
      // });

      // setMedicalDetails({
      //   specialization: "",
      //   qualifications: "",
      //   experience: "",
      //   affiliations: "",
      //   department: "",
      // });

      // setAppointmentDetails({
      //   consultationFee: "",
      //   availableDays: "",
      //   timeSlots: "",
      //   mode: "",
      //   chamberNumber: "",
      //   organizations: "",
      // });

      // setOtherDetails({
      //   email: "",
      //   contactNumber: "",
      //   password: "",
      //   confirmPassword: "",
      // });
      // navigate("/");
      setloading(false)
    }
  };

  return (

    <>
    <>
    {
      loading?<Loader/>:(<></>)
    }
    </>
    
  
    <div className="w-[60%] mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md  ">
      {step === 1 && (
        <div className="flex gap-10 justify-center items-center">
          <img src={SidePic} alt="sidepic" className="w-fit" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold mb-3">Basic Details</h2>
            <form className="space-y-4">
              {[
                {    
                  label: "Full Name",
                  type: "text",
                  name: "fullName",
                  placeholder: "Enter your Full Name",
                },
                { label: "Date of Birth", type: "date", name: "dateOfBirth" },
                {
                  label: "Medical Registration Number",
                  type: "text",
                  name: "medicalRegNumber",
                  placeholder: "Enter your Medical Registration number",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={basicDetails[field.name]}
                    onChange={handleBasicChange}
                    placeholder={field.placeholder}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={basicDetails.gender}
                  onChange={handleBasicChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Upload Photo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  onChange={handlePhotoChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none"
                />
                {photo && (
                  <div className="mt-4">
                    <img
                      src={photo}
                      alt="Selected"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {errors.photo && (
                  <p className="text-red-500 text-sm">{errors.photo}</p>
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 duration-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBasicNext}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 duration-500"
                >
                  Next (1/4)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex gap-10 justify-center items-center">
          <img src={SidePic} alt="sidepic" className="w-fit" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold mb-3">Medical Details</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-medium mb-1">
                  Qualifications <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={medicalDetails.qualifications}
                  onChange={handleMedicalChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.qualifications && (
                  <p className="text-red-500 text-sm">
                    {errors.qualifications}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={medicalDetails.experience}
                  onChange={handleMedicalChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm">{errors.experience}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={medicalDetails.department}
                  onChange={handleMedicalChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.department && (
                  <p className="text-red-500 text-sm">{errors.department}</p>
                )}
              </div>

              {[
                { label: "Specialization", name: "specialization" },
                { label: "Affiliations", name: "affiliations" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={medicalDetails[field.name]}
                    onChange={handleMedicalChange}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 duration-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMedicalBack}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 duration-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleMedicalNext}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 duration-500"
                >
                  Next (2/4)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex gap-10 justify-center items-center">
          <img src={SidePic} alt="sidepic" className="w-fit" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold mb-3">Appointment Details</h2>
            <form className="space-y-4">
              {[
                {
                  label: "Oragnizations",
                  type: "text",
                  name: "organizations",
                  placeholder: "Enter your Organizations details",
                },
                {
                  label: "Consultation Fee",
                  type: "text",
                  name: "consultationFee",
                  placeholder: "Enter Consultation Fee Amount (in ₹)",
                },
                {
                  label: "Time Slots",
                  type: "text",
                  name: "timeSlots",
                  placeholder: "",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={appointmentDetails[field.name]}
                    onChange={handleAppointmentChange}
                    placeholder={field.placeholder}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium mb-1">Available Days<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="availableDays"
                  value={appointmentDetails.availableDays}
                  onChange={handleAppointmentChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.availableDays && (
                    <p className="text-red-500 text-sm">{errors.availableDays}</p>
                  )}
              </div>
              <div>
                <label className="block font-medium mb-1">Chamber Number<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="chamberNumber"
                  value={appointmentDetails.chamberNumber}
                  onChange={handleAppointmentChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.chamberNumber && (
                    <p className="text-red-500 text-sm">{errors.chamberNumber}</p>
                  )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="mode"
                  value={appointmentDetails.mode}
                  onChange={handleAppointmentChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                >
                  <option value="">Select</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Teleconsultation">Teleconsultation</option>
                  <option value="Both">Both</option>
                </select>
                {errors.mode && (
                  <p className="text-red-500 text-sm">{errors.mode}</p>
                )}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 duration-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAppointmentBack}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 duration-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAppointmentNext}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 duration-500"
                >
                  Next (3/4)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex gap-10 justify-center items-center">
          <img src={SidePic} alt="sidepic" className="w-fit" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold mb-6">Other Details</h2>
            <form className="space-y-4">
              <div key="contactNumber">
                <label className="block font-medium mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={otherDetails.contactNumber}
                  onChange={handleOtherChange}
                  required
                  placeholder="Enter your Contact Number"
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-sm">{errors.contactNumber}</p>
                )}
              </div>

              <div key="email">
                <label className="block font-medium mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={otherDetails["email"]}
                  onChange={handleOtherChange}
                  required
                  placeholder="Enter your Email ID"
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="block font-medium mb-1 ">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type={showPassword ? "text" : "password"}
                    onChange={handleOtherChange}
                    required
                    name="password"
                    value={otherDetails.password}
                    id="password"
                    placeholder="Enter your password"
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40 z-0"
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-[25px] right-1 px-3 py-3 mt-3 text-gray-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible fontSize={24} fill="#000000" />
                    ) : (
                      <AiOutlineEye fontSize={24} fill="#000000" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block font-medium mb-1"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    onChange={handleOtherChange}
                    required
                    name="confirmPassword"
                    value={otherDetails.confirmPassword}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40 z-0"
                  />
                  <span
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute top-[25px] right-1 px-3 py-3 mt-3 text-gray-700 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible fontSize={24} fill="#000000" />
                    ) : (
                      <AiOutlineEye fontSize={24} fill="#000000" />
                    )}
                  </span>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 duration-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOtherBack}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 duration-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 duration-500"
                >
                  Verify (4/4)
                </button>
              </div>
            </form>
            {dialogOpen ? (
              <VerifyEmailandPhone
                open={dialogOpen}
                onClose={handleCloseDialog}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default DoctorSignup;
