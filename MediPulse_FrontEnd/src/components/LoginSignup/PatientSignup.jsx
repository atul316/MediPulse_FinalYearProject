import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SidePic from "./../../assets/bg-sidebar-desktop.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import VerifyEmailandPhone from "./PatientVerifyEmailandPhone";
import axios from "axios";
import { server } from "@/main";
import Loader from "../Common/Loader";
import { setActivationToken } from "@/Auth/SetActivationToken";
import { toast } from "react-toastify";

const PatientSignup = () => {
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
      setDialogOpen(true);
    }
  };

  // State for Basic Details Form (Step 1)
  const [basicDetails, setBasicDetails] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    idProofNumber: "",
    address: "",
  });

  // State for Other Details Form (Step 3)
  const [otherDetails, setOtherDetails] = useState({
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  // State for Medical Details Form (Step 2)
  const [medicalDetails, setMedicalDetails] = useState({
    preferredDoctor: "",
    existingConditions: "",
    currentMedications: "",
    allergies: "",
    pastSurgeries: "",
  });

  const [errors, setErrors] = useState({});

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedBasicDetails = localStorage.getItem("basicDetails");
    const savedMedicalDetails = localStorage.getItem("medicalDetails");
    const savedOtherDetails = localStorage.getItem("otherDetails");

    if (savedBasicDetails) setBasicDetails(JSON.parse(savedBasicDetails));
    if (savedMedicalDetails) setMedicalDetails(JSON.parse(savedMedicalDetails));
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 3 (Other Details)
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

  // Validation for Step 2 (Medical Details)
  const validateMedicalDetails = () => {
    let newErrors = {};
    if (!medicalDetails.preferredDoctor) {
      newErrors.preferredDoctor = "This field is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    localStorage.removeItem("basicDetails");
    localStorage.removeItem("otherDetails");
    localStorage.removeItem("medicalDetails");

    setBasicDetails({
      fullName: "",
      dateOfBirth: "",
      gender: "",
      idProofNumber: "",
      address: "",
    });

    setOtherDetails({
      email: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
    });

    setMedicalDetails({
      preferredDoctor: "",
      existingConditions: "",
      currentMedications: "",
      allergies: "",
      pastSurgeries: "",
    });

    navigate("/");
  };

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

  // Handle Back Button
  const handleOtherBack = () => {
    setStep(2);
  };
  const handleMedicalBack = () => {
    setStep(1);
  };

  // Handle Submit Button
  const handleSubmit = async () => {
    if (validateOtherDetails()) {
      const completeData = {
        ...basicDetails,
        ...medicalDetails,
        ...otherDetails,
      };
      console.log("Complete Data:", completeData);

      const patientData = {
        // Basic Details
        firstName: basicDetails.fullName.split(" ")[0] || "", // Extract first name
        lastName: basicDetails.fullName.split(" ")[1] || "", // Extract last name
        dob: basicDetails.dateOfBirth, // Format: "YYYY-MM-DD"
        gender: basicDetails.gender, // Example: "Male" or "Female"
        address: basicDetails.address, // String

        // Medical Details
        medicalConditions: [medicalDetails.existingConditions], // Array of strings
        currentMedications: [medicalDetails.currentMedications], // Array of strings
        allergies: [medicalDetails.allergies], // Array of strings
        pastSurgeries: [medicalDetails.pastSurgeries], // Array of strings
        preferredDoctor: medicalDetails.preferredDoctor,

        // Other Details
        email: otherDetails.email, // String
        contactNumber: otherDetails.contactNumber, // String
        password: otherDetails.password, // String
        photoId: "photo_id", // Default placeholder
        role: "patient", // Static value
      };
      setloading(true);

      try {
        const response = await axios.post(
          `${server}/patient/register`,
          patientData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        console.log("Registration successful:", response.data);
        toast.success("Registration successful");
        setActivationToken(response.data.token);
        console.log(response.data.token);
        setloading(false);
        setDialogOpen(true);
      } catch (error) {
        console.error(
          "Error during registration:",
          error.response?.data || error.message
        );
        toast.error(
          "Error during registration:"
        );
        setloading(false);
      }

      // Clear local storage
      localStorage.removeItem("basicDetails");
      localStorage.removeItem("medicalDetails");
      localStorage.removeItem("otherDetails");

      // alert("Registration successful!");

      // Reset form states
      // setBasicDetails({
      //   fullName: "",
      //   dateOfBirth: "",
      //   gender: "",
      //   idProofNumber: "",
      //   address: "",
      // });

      // setMedicalDetails({
      //   preferredDoctor: "",
      //   existingConditions: "",
      //   currentMedications: "",
      //   allergies: "",
      //   pastSurgeries: "",
      // });

      // setOtherDetails({
      //   email: "",
      //   contactNumber: "",
      //   password: "",
      //   confirmPassword: "",
      // });
      // navigate("/");
      setloading(false);
    }
  };

  return (
    <>
      <>{loading ? <Loader/> : <></>}</>
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
                    label: "ID Proof Number",
                    type: "text",
                    name: "idProofNumber",
                    placeholder: "Aadhaar No., PAN No., etc.",
                  },
                  {
                    label: "Address",
                    type: "text",
                    name: "address",
                    placeholder: "Enter your Full Address",
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
                      <p className="text-red-500 text-sm">
                        {errors[field.name]}
                      </p>
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
                    Next (1/3)
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
                    Preferred Doctor/Specialty{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="preferredDoctor"
                    value={medicalDetails.preferredDoctor}
                    onChange={handleMedicalChange}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors.preferredDoctor && (
                    <p className="text-red-500 text-sm">
                      {errors.preferredDoctor}
                    </p>
                  )}
                </div>

                {[
                  {
                    label: "Existing Medical Conditions",
                    name: "existingConditions",
                  },
                  { label: "Current Medications", name: "currentMedications" },
                  { label: "Allergies", name: "allergies" },
                  {
                    label: "Past Surgeries or Hospitalizations",
                    name: "pastSurgeries",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block font-medium mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={medicalDetails[field.name]}
                      onChange={handleMedicalChange}
                      className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
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
                    Next (2/3)
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
                    <p className="text-red-500 text-sm">
                      {errors.contactNumber}
                    </p>
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
                    Verify (3/3)
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

export default PatientSignup;
