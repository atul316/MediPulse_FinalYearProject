import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SidePic from "./../../assets/bg-sidebar-desktop.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import VerifyEmailandPhone from "./VerifyEmailandPhone";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { server } from "@/main";
import { toast } from "react-toastify";

const OrganizationSignup = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Convert data from country-state-city to match react-select's format
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.value).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : [];

  const cityOptions = selectedState
    ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(
        (city) => ({
          value: city.name,
          label: city.name,
        })
      )
    : [];

  // Handle changes for Country, State, and City
  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setSelectedState(null); // Reset state when country changes
    setSelectedCity(null); // Reset city when country changes
    handleAddressChange({
      target: { name: "country", value: selectedOption.label },
    });
  };

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption);
    setSelectedCity(null); // Reset city when state changes
    handleAddressChange({
      target: { name: "state", value: selectedOption.label },
    });
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    handleAddressChange({
      target: { name: "city", value: selectedOption.label },
    });
  };

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
    name: "",
    uniqueId: "",
    accessCode: "",
  });

  // State for Address Details Form (Step 2)
  const [addressDetails, setAddressDetails] = useState({
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "",
  });

  // State for Organization Details Form (Step 3)
  const [organizationDetails, setOrganizationDetails] = useState({
    type: "",
    departments: [],
    visitingHours: "",
    beds: "",
    pharmacy: "",
    helpline: "",
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
    const savedAddressDetails = localStorage.getItem("addressDetails");
    const savedOrganizationDetails = localStorage.getItem(
      "organizationDetails"
    );
    const savedOtherDetails = localStorage.getItem("otherDetails");

    if (savedBasicDetails) setBasicDetails(JSON.parse(savedBasicDetails));
    if (savedAddressDetails) setAddressDetails(JSON.parse(savedAddressDetails));
    if (savedOrganizationDetails)
      setOrganizationDetails(JSON.parse(savedOrganizationDetails));
    if (savedOtherDetails) setOtherDetails(JSON.parse(savedOtherDetails));
  }, []);

  // Handle changes for Basic Details
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails({ ...basicDetails, [name]: value });
  };

  // Handle changes for Address Details
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressDetails({ ...addressDetails, [name]: value });
  };

  // Handle changes for Other Details
  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    setOtherDetails({ ...otherDetails, [name]: value });
  };

  // Handle changes for Organization Details
  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;
    setOrganizationDetails({ ...organizationDetails, [name]: value });
  };

  // Handle Pharmacy Selection
  const handlePharmacyChange = (selectedOptions) => {
    const selectedOption = selectedOptions.map((option) => option.value);
    setOrganizationDetails((prev) => ({
      ...prev,
      pharmacy: selectedOption,
    }));
  };
  // Handle Department Selection
  const handleDepartmentChange = (selectedOptions) => {
    const selectedDepartments = selectedOptions.map((option) => option.value);
    setOrganizationDetails((prev) => ({
      ...prev,
      departments: selectedDepartments,
    }));
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
    if (basicDetails.name.length < 3) {
      newErrors.name = "Full Name should be at least 3 letters";
    }
    if (!photo) {
      newErrors.photo = "Photo is required.";
    }
    if (location.length < 1) {
      newErrors.location = "Location is required.";
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

  // Validation for Step 3 (Organization Details)
  const validateOrganizationDetails = () => {
    let newErrors = {};
    Object.keys(organizationDetails).forEach((key) => {
      if (!organizationDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });
    if (organizationDetails.departments.length < 1) {
      newErrors.departments = "This field is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 2 (Address Details)
  const validateAddressDetails = () => {
    let newErrors = {};
    Object.keys(addressDetails).forEach((key) => {
      if (!addressDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    localStorage.removeItem("basicDetails");
    localStorage.removeItem("addressDetails");
    localStorage.removeItem("organizationDetails");
    localStorage.removeItem("otherDetails");
    localStorage.removeItem("photo"); // Clear the photo from local storage
    setPhoto(null); // Clear the state

    setBasicDetails({
      name: "",
      uniqueId: "",
      accessCode: "",
    });

    setAddressDetails({
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      country: "",
    });

    setOrganizationDetails({
      type: "",
      departments: [],
      visitingHours: "",
      beds: "",
      pharmacy: "",
      helpline: "",
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

  const handleAddressNext = () => {
    if (validateAddressDetails()) {
      localStorage.setItem("addressDetails", JSON.stringify(addressDetails));
      setErrors({});
      setStep(3);
    }
  };
  const handleOrganizationNext = () => {
    if (validateOrganizationDetails()) {
      localStorage.setItem(
        "organizationDetails",
        JSON.stringify(organizationDetails)
      );
      setErrors({});
      setStep(4);
    }
  };

  // Handle Back Button
  const handleOtherBack = () => {
    setStep(3);
  };
  const handleOrganizationBack = () => {
    setStep(2);
  };
  const handleAddressBack = () => {
    setStep(1);
  };

  // Concatenate location details
  const getLocation = () =>
    `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.district}, ${addressDetails.state}, ${addressDetails.pincode}, ${addressDetails.country}`;

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit Form Data
  const handleSubmit = async () => {
    if (
      !(
        validateBasicDetails &&
        validateAddressDetails &&
        validateOrganizationDetails &&
        validateOtherDetails
      )
    )
      return;

    const location = getLocation();
    const formData = new FormData();

    formData.append("name", basicDetails.name);
    formData.append("uniqueId", basicDetails.uniqueId);
    formData.append("accessCode", basicDetails.accessCode);
    formData.append("location", location);
    formData.append("email", otherDetails.email);
    formData.append("password", otherDetails.password);
    formData.append("phone", otherDetails.contactNumber);
    formData.append("image", photo);
    formData.append("type", organizationDetails.type);
    formData.append("beds", organizationDetails.beds);
    formData.append("departments", organizationDetails.departments);
    formData.append("pharmacy", organizationDetails.pharmacy);
    formData.append("visitingHours", organizationDetails.visitingHours);
    formData.append("helpline", organizationDetails.helpline);

    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/org/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLoading(false);
      toast.success("Organization Registered Successfully!");
      console.log(response.data);
    } catch (error) {
      setLoading(false);
      setApiError(
        error.response?.data?.message || "Something went wrong. Try again."
      );
      toast.error("Something went wrong!")
    } finally {
      if (validateOtherDetails()) {
        const completeData = {
          ...basicDetails,
          ...addressDetails,
          ...organizationDetails,
          ...otherDetails,
          photo,
        };
        console.log("Complete Data:", completeData);

        // Clear local storage
        localStorage.removeItem("basicDetails");
        localStorage.removeItem("addressDetails");
        localStorage.removeItem("organizationDetails");
        localStorage.removeItem("otherDetails");
        localStorage.removeItem("photo"); // Clear the photo from local storage
        setPhoto(null); // Clear the state
      }
    }
  };

  const [specialistRoles, setSpecialistRoles] = useState([]); // To store departments

  // Fetch specialist roles for departments
  useEffect(() => {
    const fetchSpecialistRoles = async () => {
      try {
        const response = await axios.get(
          `${server}/common/get-all-specialist-role`
        );
        // Transform roles into options format required by react-select
        const roleOptions = response.data.specialists.map((role) => ({
          value: role,
          label: role,
        }));
        setSpecialistRoles(roleOptions);
      } catch (error) {
        console.error("Failed to fetch specialist roles:", error);
      }
    };

    fetchSpecialistRoles();
  }, []);

  return (
    <div className="w-[60%] mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md  ">
      {step === 1 && (
        <div className="flex gap-10 justify-center items-center">
          <img src={SidePic} alt="sidepic" className="w-fit" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold mb-3">Basic Details</h2>
            <form className="space-y-4">
              {[
                {
                  label: "Organization Name",
                  type: "text",
                  name: "name",
                  placeholder: "Enter your Organization Name",
                },
                {
                  label: "Organization Unique ID",
                  type: "text",
                  name: "uniqueId",
                  placeholder: "Enter your Organization Unique ID",
                },
                {
                  label: "Access Code",
                  type: "text",
                  name: "accessCode",
                  placeholder: "Enter your Organization Access Code",
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
            <h2 className="text-xl font-bold mb-3">Address Details</h2>
            <form className="space-y-4">
              {[
                {
                  label: "Street / Area",
                  name: "street",
                  placeholder: "Enter street name",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={addressDetails[field.name]}
                    onChange={handleAddressChange}
                    placeholder={field.placeholder}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              {/* Country Dropdown */}
              <div>
                <label className="block font-medium mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <Select
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                  className="text-gray-700"
                />
                {errors.country && (
                  <p className="text-red-500 text-sm">{errors.country}</p>
                )}
              </div>

              {/* State Dropdown */}
              <div>
                <label className="block font-medium mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  options={stateOptions}
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Select State"
                  isDisabled={!selectedCountry}
                  className="text-gray-700"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm">{errors.state}</p>
                )}
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block font-medium mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <Select
                  options={cityOptions}
                  value={selectedCity}
                  onChange={handleCityChange}
                  placeholder="Select City"
                  isDisabled={!selectedState}
                  className="text-gray-700"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city}</p>
                )}
              </div>

              {[
                {
                  label: "District",
                  name: "district",
                  placeholder: "Enter district name",
                },
                {
                  label: "Pin Code",
                  name: "pincode",
                  placeholder: "Enter pin-code",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={addressDetails[field.name]}
                    onChange={handleAddressChange}
                    placeholder={field.placeholder}
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
                  onClick={handleAddressBack}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 duration-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAddressNext}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 duration-500"
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
            <h2 className="text-xl font-bold mb-3">Organization Details</h2>
            <form className="space-y-4">
              {[{ label: "Organization Type", name: "type" }].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={organizationDetails[field.name]}
                    onChange={handleOrganizationChange}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium mb-1">
                  Organization Departments{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  isMulti
                  name="departments"
                  options={specialistRoles}
                  classNamePrefix="select"
                  placeholder="Select Departments"
                  onChange={handleDepartmentChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors.departments && (
                  <p className="text-red-500 text-sm">{errors.departments}</p>
                )}
              </div>

              {[
                { label: "Visiting Hours", name: "visitingHours" },
                { label: "No. of Beds", name: "beds" },
                { label: "Organization Helpline No.", name: "helpline" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={organizationDetails[field.name]}
                    onChange={handleOrganizationChange}
                    className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium mb-1">
                  Have Pharmacy <span className="text-red-500">*</span>
                </label>
                <select
                  name="pharmacy"
                  value={basicDetails.pharmacy}
                  onChange={handlePharmacyChange}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                >
                  <option value="">Select</option>
                  <option value="True">Yes</option>
                  <option value="False">No</option>
                </select>
                {errors.pharmacy && (
                  <p className="text-red-500 text-sm">{errors.pharmacy}</p>
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
                  onClick={handleOrganizationBack}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 duration-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleOrganizationNext}
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
                  placeholder="Enter Organization Contact Number"
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
                  placeholder="Enter Organization Email ID"
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
                    placeholder="Create your password"
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
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 duration-500"
                >
                  {loading ? "Verifying..." : "Verify (4/4)"}
                </button>
                {apiError && <p className="text-red-500 mt-4">{apiError}</p>}
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
  );
};

export default OrganizationSignup;
