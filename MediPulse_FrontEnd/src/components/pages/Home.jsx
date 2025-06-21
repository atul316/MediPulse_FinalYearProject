import React from "react";
import { useState, useEffect } from "react";
import "./../css/styles.css";
import "./../css/swiper.css";
import "./../css/magnific-popup.css";
import "./../css/fontawesome-all.css";
import { Link, useNavigate } from "react-router-dom";
import HeroPic from "./../../assets/hero-pic.jpg";
import AppointmentPic from "./../../assets/appointment-schedular-pic.png";
import LocationService from "./../../assets/location-service.png";
import Availability from "./../../assets/availability.png";
import Filter from "./../../assets/filter.png";
import SecurityPic from "./../../assets/security-pic.png";
import AlertPic from "./../../assets/alert-pic.png";
import { Image } from "lucide-react";
import axios from "axios";
import { server } from "../../main.jsx";
import { setRoleInLocalStorage } from "@/Auth/checkRole";
import { setUserInLocalStorage } from "@/Auth/setUser";
import { checkAuthentication } from "@/Auth/CheckAuth";
import { removecookieweb } from "@/Auth/RemoveCookie";
import {toast} from "react-toastify"
// import Loader from "../Common/Loader.jsx";

const Home = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setloading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [api2Error, setApi2Error] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [user, setuser] = useState([]);
  const [role, setrole] = useState("");
  const [slotstatus, setslotstatus] = useState(false);
  const [userid, setuserid] = useState("");

  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // const [doctors, setDoctors] = useState([]);
  const [availabilityMatrix, setAvailabilityMatrix] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  // const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();
  const handleDashboardRedirect = () => {
    const userDetails = JSON.parse(
      localStorage.getItem("userDetails_Medipulse")
    );
    const role = userDetails?.role;

    if (!role) return toast.error("Role not found. Please log in again.");;

    if (role === "patient") {
      navigate("/patientdashboard");
    } else if (role === "doctor") {
      navigate("/doctordashboard");
    } else if (role === "organization") {
      navigate("/orgdashboard");
    } else {
      toast.error("Unknown role!");
    }
  };

  // Fetch doctors initially
  useEffect(() => {
    axios
      .get(
        "https://medipulse-backend.vercel.app/api/common/get-all-doctor-name"
      )
      .then((res) => setDoctors(res.data.doctors || []))
      .catch((err) => setError("Failed to fetch doctors"));
  }, []);

  // Fetch matrix on doctor change
  useEffect(() => {
    if (!selectedDoctorId) return;
    axios
      .post(
        "https://medipulse-backend.vercel.app/api/doctors/get-my-matrix",
        {
          doctorId: selectedDoctorId,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((res) => {
        setAvailabilityMatrix(res.data.availabilityMatrix || []);
        setAvailableDates(res.data.availabilityMatrix.map((d) => d.date));
      })
      .catch((err) => setError("Failed to fetch availability"));
  }, [selectedDoctorId]);

  // Handle doctor select
  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setAvailableSlots([]);
  };

  // Handle date select
  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);
    const matrixEntry = availabilityMatrix.find((d) => d.date === selected);
    if (matrixEntry) {
      const openSlots = matrixEntry.timeSlots.filter((s) => s.status === 0);
      setAvailableSlots(openSlots);
    } else {
      setAvailableSlots([]);
    }
    setSelectedTimeSlot("");
  };

  // Function to open the dialog with the appropriate menu
  const openDialog = (menu) => {
    setActiveMenu(menu);
    setIsDialogOpen(true);
  };

  // Function to close the dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const [mainPageDetails, setMainPageDetails] = useState({
    doctorSelect: "",
    date: "",
    timeSlot: "",
  });
  const handleMainPageChange = async (e) => {
    const { name, value } = e.target;

    // Reset slot status and messages
    setslotstatus(false);
    setSearchResult(null);
    setApi2Error(null);

    setMainPageDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Fetch availability when doctor is selected
    if (name === "doctorSelect" && value) {
      try {
        const res = await axios.get(
          `https://medipulse-backend.vercel.app/api/doctors/get-my-matrix`,
          {
            doctorId,
          }
        );
        setAvailableDates(res.data.availableDates || []);
        setAvailableTimeSlots(res.data.availableTimeSlots || []);
      } catch (error) {
        console.error("Error fetching availability", error);
        setAvailableDates([]);
        setAvailableTimeSlots([]);
      }

      // Reset other fields when doctor changes
      setMainPageDetails((prev) => ({
        ...prev,
        date: "",
        timeSlot: "",
      }));
    }
  };

  const validateMainPageDetails = () => {
    const newErrors = {};
    if (!mainPageDetails.doctorSelect) {
      newErrors.doctorSelect = "Please select a doctor.";
    }
    if (!mainPageDetails.date) {
      newErrors.date = "Please select a date.";
    }
    if (!mainPageDetails.timeSlot) {
      newErrors.timeSlot = "Please select a time slot.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validateMainPageDetails()) return;

    setloading(true);
    try {
      const response = await axios.post(
        `${server}/common/check-available`,
        {
          doctorId: mainPageDetails.doctorSelect,
          date: mainPageDetails.date,
          timeSlot: mainPageDetails.timeSlot,
        },
        {
          header: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setSearchResult(response.data.message);
      setloading(false);
      setslotstatus(true);
    } catch (error) {
      setApi2Error(
        error.response?.data?.message || "An error occurred while searching."
      );
      setloading(false);
    } finally {
      const mainPageData = { ...mainPageDetails };
      console.log(mainPageData);
      // setMainPageDetails({
      //   doctorSelect: "",
      //   date: "",
      //   timeSlot: "",
      // });
    }
  };

  ////////////////////

  useEffect(() => {
    const fetchUserData = async () => {
      setloading(true);
      try {
        const response = await fetch(`${server}/common/getuserdetails`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setRoleInLocalStorage(data.user.role);
          setUserInLocalStorage(data.user);
          setloading(false);
          setrole(data.user.role);
          setuser(data.user);
        } else {
          setRoleInLocalStorage("");
          setloading(false);
        }
      } catch (error) {
        setRoleInLocalStorage("");
        setloading(false);
      }
    };
    if (localStorage.getItem("authToken_Medipulse")) {
      fetchUserData();
    }
  }, []);

  async function handleLogout() {
    setloading(true);
    try {
      await axios.get(`${server}/common/logout`, {
        withCredentials: true,
      });

      removecookieweb();
      setRoleInLocalStorage(null);
      setUserInLocalStorage(null);
      setloading(false);
      setrole(null);
      setuser(null);
      toast.success("Logout successful!")
    } catch (error) {
      console.error("Error during logout:", error);
      setloading(false);
    }
  }

  //////////////////////

  // Fetch doctors from API

  const applybooking = async () => {
    const userDetails = localStorage.getItem("userDetails_Medipulse");
    if (userDetails) {
      // Parse the JSON string into an object
      const parsedDetails = JSON.parse(userDetails);

      // Extract the _id
      const userId = parsedDetails._id;

      console.log("User ID:", userId);
      setuserid(parsedDetails._id);
      console.log(userid);
      try {
        const response = await axios.post(
          `${server}/common/apply-booking`,
          {
            doctorId: mainPageDetails.doctorSelect,
            patientId: userId,
            date: mainPageDetails.date,
            timeSlot: mainPageDetails.timeSlot,
          },
          {
            header: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setSearchResult(response.data.message);
        setloading(false);
        setslotstatus(true);
      } catch (error) {
        setApi2Error(
          error.response?.data?.message || "An error occurred while searching."
        );
        setloading(false);
      } finally {
        const mainPageData = { ...mainPageDetails };
        console.log(mainPageData);
        setMainPageDetails({
          doctorSelect: "",
          date: "",
          timeSlot: "",
        });
      }
    } else {
      console.log("No user details found in localStorage.");
      return;
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${server}/common/get-all-doctor-name`);
        if (!response.ok) {
          throw new Error("Failed to fetch doctor names");
        }
        const data = await response.json();
        setDoctors(data.doctors || []); // Assume the API returns a `doctors` array
        setloading(false);
      } catch (error) {
        setApiError(error.message);
        setloading(false);
      }
    };

    fetchDoctors();
  }, []);

  const checkmydetails = async () => {
    try {
      const response = await fetch(`${server}/common/getuserdetails`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch doctor names");
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      setApiError(error.message);
      setloading(false);
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar fixed-top bg-white shadow-md">
        <div className="container sm:px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between lg:flex-nowrap">
          <a
            className="text-pink-700 font-bold text-3xl leading-4 no-underline"
            href="/"
          >
            MediPulse
          </a>

          <div className="navbar-collapse lg:flex lg:flex-grow lg:items-center text-xl text-pink-800">
            <ul className="pl-0 mt-3 mb-2 ml-auto flex flex-col list-none lg:mt-0 lg:mb-0 lg:flex-row">
              <li>
                <a className="nav-link page-scroll" href="#">
                  Home
                </a>
              </li>
              <li>
                <a className="nav-link page-scroll" onClick={checkmydetails}>
                  Features
                </a>
              </li>
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  {localStorage.getItem("authToken_Medipulse") ? (
                    <>
                      <li>
                        <button className="nav-link bg-green-400 border-none text-white p-2 rounded-3xl cursor-pointer" onClick={handleDashboardRedirect}>
                          Dashboard
                        </button>
                      </li>
                      <li>
                        <button
                          className="nav-link bg-blue-400 border-none text-white p-2 rounded-3xl cursor-pointer ml-3"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <button
                          className="nav-link bg-transparent border-none text-pink-800 cursor-pointer"
                          onClick={() =>
                            openDialog("Select your role for Login")
                          }
                        >
                          Login
                        </button>
                      </li>
                      <li>
                        <button
                          className="nav-link bg-transparent border-none text-pink-800 cursor-pointer"
                          onClick={() =>
                            openDialog("Select your role for Register")
                          }
                        >
                          Register
                        </button>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {/* Popup Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-80">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {activeMenu}
            </h3>
            <ul className="flex flex-col space-y-4">
              {activeMenu === "Select your role for Login" ? (
                <>
                  <li>
                    <button
                      className="bg-gray-50 shadow-md text-slate-800 text-xl px-4 py-2 rounded w-full duration-200 border border-solid border-slate-300 cursor-pointer hover:scale-110"
                      onClick={() => navigate("/patientlogin")}
                    >
                      Patient Login
                    </button>
                  </li>
                  <li>
                    <button
                      className="bg-gray-50 shadow-md text-slate-800 text-xl px-4 py-2 rounded w-full duration-200 border border-solid border-slate-300 cursor-pointer hover:scale-110"
                      onClick={() => navigate("/doctorlogin")}
                    >
                      Doctor Login
                    </button>
                  </li>
                  <li>
                    <button
                      className="bg-gray-50 shadow-md text-slate-800 text-xl px-4 py-2 rounded w-full duration-200 border border-solid border-slate-300 cursor-pointer hover:scale-110"
                      onClick={() => navigate("/organizationlogin")}
                    >
                      Organization Login
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      className="bg-gray-50 shadow-md text-slate-800 text-xl px-4 py-2 rounded w-full duration-200 border border-solid border-slate-300 cursor-pointer hover:scale-110"
                      onClick={() => navigate("/patientsignup")}
                    >
                      Patient Register
                    </button>
                  </li>
                  <li>
                    <button
                      className="bg-gray-50 shadow-md text-slate-800 text-xl px-4 py-2 rounded w-full duration-200 border border-solid border-slate-300 cursor-pointer hover:scale-110"
                      onClick={() => navigate("/doctorsignup")}
                    >
                      Doctor Register
                    </button>
                  </li>
                  <li>
                    <button
                      className="bg-gray-50 shadow-md text-slate-800 text-xl px-4 py-2 rounded w-full duration-200 border border-solid border-slate-300 cursor-pointer hover:scale-110"
                      onClick={() => navigate("/organizationsignup")}
                    >
                      Organization Register
                    </button>
                  </li>
                </>
              )}
            </ul>
            <button
              className="mt-6 bg-[#594cda] text-white px-4 py-2 rounded-xl hover:bg-white hover:text-[#594cda] w-full border border-solid hover:border hover:border-solid hover:border-[#594cda] duration-200"
              onClick={closeDialog}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* <!-- end of navbar -->
        <!-- end of navigation --> */}
      {/* Header */}
      <header
        id="header"
        className="header py-28 text-center md:pt-36 lg:text-left xl:pt-44 xl:pb-32"
      >
        <div className="container px-4 sm:px-8 lg:grid lg:grid-cols-2 lg:gap-x-8">
          <div className="mb-16 lg:mt-32 xl:mt-10 xl:mr-12">
            <h1 className="h1-large mb-5">
              Appointment{" "}
              <span className="font-extrabold text-pink-800 text-7xl">
                {" "}
                Scheduler
              </span>
            </h1>
            <p className="p-large mb-8">
              Revolutionizing{" "}
              <span className="font-bold text-pink-600">Healthcare</span> with{" "}
              <span className="font-bold text-pink-600">Technology</span>
            </p>
            <Link to={"/"} className="btn-solid-lg">
              Book your appointment now!
            </Link>
          </div>
          <div className="xl:text-right">
            <img className="inline" src={HeroPic} alt="alternative" />
          </div>
        </div>{" "}
        {/* end of container */}
      </header>{" "}
      {/* end of header */}
      {/* end of header */}
      {/* Introduction */}
      <div className="pt-4 pb-14 text-center">
        <div className="container px-4 sm:px-8 xl:px-4 w-[80%] mx-auto">
          <form className="flex items-center justify-between">
            {/* Select Doctor */}
            <div>
              <label className="block font-bold text-xl mb-2">
                Select Doctor <span className="text-red-500">*</span>
              </label>
              <select
                name="doctorSelect"
                value={selectedDoctorId}
                onChange={handleDoctorChange}
                className="block w-full px-28 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg"
              >
                <option value="">Select</option>
                {doctors.map((doc, i) => (
                  <option key={i} value={doc._id}>
                    {doc.firstName} {doc.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Date */}
            <div>
              <label className="block font-bold text-xl mb-1">
                Available Date <span className="text-red-500">*</span>
              </label>
              <select
                name="date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={!selectedDoctorId}
                className="block w-full px-28 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg"
              >
                <option value="">Select</option>
                {availableDates.map((date, i) => (
                  <option key={i} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Time Slot */}
            <div>
              <label className="block font-bold text-xl mb-2">
                Available Time-Slot <span className="text-red-500">*</span>
              </label>
              <select
                name="timeSlot"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                disabled={!selectedDate}
                className="block w-full px-[7rem] py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg"
              >
                <option value="">Select</option>
                {availableSlots.map((slot, i) => (
                  <option key={i} value={slot.slot}>
                    {slot.slot}
                  </option>
                ))}
              </select>
            </div>
          </form>

          {/* Display Search Result or Error, one at a time */}
          {searchResult && !api2Error && (
            <p className="text-green-600 mt-4 text-lg">{searchResult}</p>
          )}
          {api2Error && !searchResult && (
            <p className="text-red-500 mt-4 text-lg">{api2Error}</p>
          )}
        </div>
      </div>
      {/* start  */}
      {slotstatus && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-80">
            <h3 className="text-2xl font-bold  text-green-400 mb-6 text-center">
              🎉 {searchResult} 🎉
            </h3>
            <button
              className="mt-6 bg-[#594cda] text-white px-4 py-2 rounded-xl hover:bg-white hover:text-[#594cda] w-full border border-solid hover:border hover:border-solid hover:border-[#594cda] duration-200"
              onClick={applybooking}
            >
              Book Now
            </button>

            <button
              className="mt-6  bg-red-400 text-white px-4 py-2 rounded-xl hover:bg-white hover:text-[#594cda] w-full border border-solid hover:border hover:border-solid hover:border-[#594cda] duration-200"
              onClick={() => setslotstatus(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* end of introduction */}
      <div class="relative w-full bg-gray-100 py-6">
        <h2 class="text-center text-2xl font-bold mb-4">Best Doctors</h2>

        <div
          id="cardSlider"
          class="flex overflow-x-auto scroll-smooth gap-4 p-4 snap-x snap-mandatory"
        >
          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Supratim Biswas</h3>
            <p class="text-sm text-gray-600">Dermatologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ☆ ☆</span>
              <span class="ml-2 text-gray-500">(30)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Durgapur</li>

              <li>⏳ 5 Years</li>
              <li>🏥 5 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Ankur Bhattacharjee</h3>
            <p class="text-sm text-gray-600">Orthopaedic</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(150)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Asansol</li>
              <li>⏳ 15 Years</li>
              <li>🏥 4 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Manas Bhattacharjee</h3>
            <p class="text-sm text-gray-600">Neurologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(50)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍Bardhaman </li>

              <li>⏳ 15 Years</li>
              <li>🏥 7 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Rishav chaterjee</h3>
            <p class="text-sm text-gray-600">Pediatrician</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(40)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Hooghly</li>
              <li>⏳ 11 Years</li>
              <li>🏥 8 Clinics</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="relative w-full bg-gray-100 py-6">
        <div
          id="cardSlider"
          class="flex overflow-x-auto scroll-smooth gap-4 p-4 snap-x snap-mandatory"
        >
          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Sneha Roy</h3>
            <p class="text-sm text-gray-600">Gynecologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ☆ ☆</span>
              <span class="ml-2 text-gray-500">(100)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Purulia</li>
              <li>⏳ 5 Years</li>
              <li>🏥 3 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Ankit Pal</h3>
            <p class="text-sm text-gray-600">Oncologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(70)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Asansol</li>
              <li>⏳ 11 Years</li>
              <li>🏥 7 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Mrinal Sinha</h3>
            <p class="text-sm text-gray-600">Surgeon</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(50)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Bardhaman</li>
              <li>⏳ 7 Years</li>
              <li>🏥 5 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Pradip Mondal</h3>
            <p class="text-sm text-gray-600">Allergist</p>
            <div class="flex items-center mt-ic2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(23)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Durgapur</li>
              <li>⏳ 11 Years</li>
              <li>🏥 5 Clinics</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="relative w-full bg-gray-100 py-6">
        <div
          id="cardSlider"
          class="flex overflow-x-auto scroll-smooth gap-4 p-4 snap-x snap-mandatory"
        >
          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Pratha Pal</h3>
            <p class="text-sm text-gray-600">Gastroenterologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ☆ ☆</span>
              <span class="ml-2 text-gray-500">(50)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Asansol</li>
              <li>⏳ 5 Years</li>
              <li>🏥 5 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Anil Kumar</h3>
            <p class="text-sm text-gray-600">Endocrinologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(500)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Dhanbad</li>
              <li>⏳ 11 Years</li>
              <li>🏥 8 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Kriti Malhotra</h3>
            <p class="text-sm text-gray-600">Hematologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(300)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Asansol</li>
              <li>⏳ 11 Years</li>
              <li>🏥 5 Clinics</li>
            </ul>
          </div>

          <div class="min-w-[300px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
              alt="Doctor Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Dr. Shyam Das</h3>
            <p class="text-sm text-gray-600">Endocrinologist</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(350)</span>
            </div>
            <ul class="text-sm text-gray-600 mt-4">
              <li>📍 Suri</li>
              <li>⏳ 11 Years</li>
              <li>🏥 5 Clinics</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="relative w-full bg-gray-100 py-6">
        <h2 class="text-center text-2xl font-bold mb-4">
          Nearby Organizations
        </h2>

        <div
          id="organizationSlider"
          class="flex overflow-x-auto scroll-smooth gap-4 p-4 snap-x snap-mandatory"
        >
          <div class="min-w-[250px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef"
              alt="Organization Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Wellness Hospital</h3>
            <p class="text-sm text-gray-600">📍 Asansol</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ☆</span>
              <span class="ml-2 text-gray-500">(120 Reviews)</span>
            </div>
          </div>

          <div class="min-w-[250px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://cdn.pixabay.com/photo/2016/11/08/05/29/surgery-1807541_1280.jpg"
              alt="Organization Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Health First Clinic</h3>
            <p class="text-sm text-gray-600">📍 Durgapur</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ★</span>
              <span class="ml-2 text-gray-500">(200 Reviews)</span>
            </div>
          </div>

          <div class="min-w-[250px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src="https://cdn.pixabay.com/photo/2024/07/08/16/28/ai-generated-8881542_1280.jpg"
              alt="Organization Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">Care and Cure Diagnostics</h3>
            <p class="text-sm text-gray-600">📍 Bardhaman</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ☆ ☆</span>
              <span class="ml-2 text-gray-500">(50 Reviews)</span>
            </div>
          </div>

          <div class="min-w-[250px] bg-white rounded-lg shadow-lg p-4 snap-start">
            <img
              src=" https://cdn.pixabay.com/photo/2014/12/10/20/48/laboratory-563423_960_720.jpg"
              alt="Organization Image"
              class="w-full h-48 rounded-lg"
            ></img>
            <h3 class="mt-4 text-lg font-bold">City Health Center</h3>
            <p class="text-sm text-gray-600">📍 Chittaranjan</p>
            <div class="flex items-center mt-2">
              <span class="text-yellow-500">★ ★ ★ ★ ☆</span>
              <span class="ml-2 text-gray-500">(75 Reviews)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 py-8 px-4">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold">
            Consult top doctors online for any health concern
          </h2>
          <p class="text-sm text-gray-600">
            Private online consultations with verified doctors in all
            specialties
          </p>
        </div>

        <div class="flex justify-center gap-6 flex-wrap">
          <div class="flex flex-col items-center w-[90px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNmFq1XKlpGbSSvPGRuEehkSPE0R8zkQ6cA&s"
              alt="Period doubts or Pregnancy"
              class="rounded-full bg-gray-200"
            ></img>
            <p class="text-sm text-center mt-2">Gynecologists</p>
          </div>

          <div class="flex flex-col items-center w-[100px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG-wCAAg1tvTqGtTrPfjanaxDIApQ5tQ_P2A&s"
              alt="Acne, pimple or skin issues"
              class="rounded-full bg-gray-200"
            ></img>
            <p class="text-sm text-center mt-2">Dermatologists</p>
          </div>

          <div class="flex flex-col items-center w-[110px]">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT94mk5h7_rw2rG3kYFZWOZOi4wwUl0npVy_g&s"
              class="rounded-full bg-gray-200"
            ></img>
            <p class="text-sm text-center mt-2">Neurologists</p>
          </div>

          <div class="flex flex-col items-center w-[110px]">
            <img
              src="data:image/jpeg;base64,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"
              alt="Cold, cough or fever"
              class="rounded-full bg-gray-200"
            ></img>
            <p class="text-sm text-center mt-2">Orthopedic Doctors</p>
          </div>

          <div class="flex flex-col items-center w-[110px]">
            <img
              src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFRUVFhUXFRUVFRUVFRUVFRUXFhUVFRUYHSggGB0lHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHR0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0rLS0tLSstLf/AABEIALcBEwMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAACBQEGB//EAD4QAAIBAgMFBQcBBwMEAwAAAAECAAMRBCExBRJBUXETImGBkQYyQqGxwdFSFCNicpLw8YLC4QdTstIVM0P/xAAZAQACAwEAAAAAAAAAAAAAAAABAgADBAX/xAApEQACAgICAQMDBAMAAAAAAAAAAQIRAyESMQQTMkEiUWEUcZGxBVLw/9oADAMBAAIRAxEAPwD1qrCKs6qwirN7ZjIqwirOqsIqxWxkjirCKssqwgWK2NRULLhZdVl1WK2GioWXCwiUydBGUogC5zMVyGSFVWHaiOefLWEpcT5fmeY9t9oMppYakd2riG3d/wD7dMe+/W33gW3RJVFWL+3W0Kb4dsPQ36tVmCkUlLWswLBiOVswL2yvFcD7WtQKI+Ar0aZ7t/eBI1KggE9NZ6HYGxqFFCKF1FgGJ1c/qJ5n/EY2lhz2edmTRgfeF/iU8xwj8o+0r9ObfK6Y3SenXprUQghgGRx6gj8QWIxYQWf3tAv6jbh4TzfsJjL1cXRFiiVAykaXa4ew4Aspa3DeM9PjMKHGYzHHjaLXGVMdSco2uz5t7WLiC/a1GNwe6FPcVRmFC/U8Y3RxYZFq5AMM7n3SNQTPSbb2d2tFhfdIGtri4niEwrLhW3hftC2nAW3ARyzBPpN2GfJUczPi4ScvuO1MM2IqiihsLbzMNAg1N/l5zR2Hj6+CPYYoE0P/AM6ubdmL2G+eC9dOmhdgVirrvfFYNy3jrb/VPRsgcPvgFbWIOluIiZ5bprRb4+PXJPY/QW5vw+t4017ZC/ymd7P4UU6CINAMhra5vbPle3lNOYZdnSj0eP8AbPYzOBi6BNPE0he4t30Gqtb3gPHhfwmh7P7QXFYdKwyLAh1/S65Mvr8rTbr0gwsRcTw/sO3Y4nF4M/DU7RPEE7rf7I6dx/YqkuM1+f7PVlZUrHGpwfZZ2i8h3EUKShWMskoVjWLQsVlCsZKwbLGTBQsywbLGisGywpgoVZYNljLLBssdMWhbdnYTdkhsBVVhVE4ohVWBsKR1VhVWRRCKsVsYirCKs6qwiiI2FI4qw1GlfoJKVO5joUAWiNjpFaZyB0ygi1mHi1j/AE/8TtGpnuHUaeI5ytYZg/xD8QDBCllM8V7X7IrVMbhqyEbirY7xsMmG8o8SrZdDPa4k2Rj4GJ7Uw+/TFtRn6WP2ki62CUVJUxyiuV7WnWphlIIyMWwRIQEEsCL2OvkY0ri1xpAMY3s9hUTtStNVuw7wABbUm545lj1YzZtFtmj90D+q59SbfK0bpjKAhjbdXdo1T/AxHpPndPGb9BVGq5Hyn0j2poM+FrBBdtw2HG3xW8rz5PSQrbx1nR8NWmzk/wCRk4tL7nqMEe6J6qkd6mgGtQj01b8ec8tgR3R0nrfZyixUO2guqdL5n1y8pPK6ss8PujXpJYWl5J2c46ZyeB29TNDa1CtotcdnfgWI3QPXd9Z74zx3/U7DMcKtZD3qFRXHhwv62lmL3V9ynP7L+2/4PWobgHnOIM7xfZOKFWktRdHVXHRwGt842Bn1iPRanaso1O8BUpWjkqwykTA0Z5WUZYyyQbLHTEaFmWDZYywg2WMmBoVZYNljLLBsIyYotuyQu7JGADUQyiVUQqiBhOqIVROKIVREYUjqrCKs4oh6K5xWxkHpLYfWDd7dOM6z26fSc8YhYCxGW644XB6H/m0K/wAPiR+YG3dK8OB8D+Jak9xT6E+mX3hAWx/uN4i3rlLJpY8rSYkXAHjBO9mUdfpAQW2bUKuaLcCSviNT9b+cLtJyEIX3nIRerG0DtTD3IqA7pBGfK2h+fpeDw20EZ71WRGXugFgAW4lCcm+o4yENRAAAmlgAOgykxGLp0t3tKiJvsFTfYLvMdFW+p8BFa2NzIpqajackH8zn6C58J53aPsmuIxCYjFVX7o3QidxBnkoOZUHO9ve8JEiNnsGM+Y+1OzRRqlQO6TvL/KeHkbjyn0epUnm/a7DdpTWpxQ5/ytl9bepmnxZ8Z/hmTzcanj/KMfAL3QBqbAdTkPmZ9AwyBVVRoAB6Tw2wO9XVeCKXPX3UHzJ8p7Ht4/lu5UDw1UbHby0USrM3bW1WpmkiGxd1F8j3eIz8pljjcnSNU8ihHkzbeKbWwYrUalI/GjL5kZfO0aBkJiLQ7Vo8f/0vxhbCmi3v0HamQdd2+8v1I/0z2Anz/YTrh9rVkpsGpYhd4EG4D5sASNLWqCfQFN85ZlX1X99lHjv6OP8ArotOGdvOGVl5R1i7CNmBdYUwNCzLBsIwwgmEcQXYQTCMsIJhGTAwFpJfdkjCg1EKolFEKogZEXUQqiVUQqiKx0WURimuUEi3jFrRGxkBYZ+Em7bMekI4lVy6QDFXphgbZXBB8L8YrgmPcB1CC/Xj9I/bO8zsMb1DbQZehMK6AF21iGp0nemm+4ViiXsGYAlVJ4XNp5X2d2xja4DV8OqOL90ipTBHAgkNfplPbMtxEay2IMiI1sEi1agIqBUUjRGJP9RA+Qv4xmlhwqhB7o0Gv1l1adDcZCFslygK7gggymJq5xOtXjRiK5EasVyOY58RKOO0BQC+8CLdRFa+I8f7vM6pjTTO8CQPA5qeY8JfGD+CmU18lfZumydszAhu0KacKfd+u9Nta8wFxmWuuZ6mX/bhfXl9JZOLk7ZVBqKpHokrzF28xbE4YcAwJPD3x+Jehioy1S5TwcE+St97RYfRK/3JmXqQ4/t/Z6GlUldpMezNovRqxxGBFjMrVM2J2YeAVN7tgAHLd4BbsWIIJ3vhvkTztPQ05k/sBSrdMgdeXpNOmLQMK0E4zt4MnOWWKEssqwlrzjCQgBhBsIdxBsIyFYuwg2EOwgmjisARJLyQgArDIIJRDLIwIIsKog1jFMWzP+YrHQxTWwnKkC+IkpVQcolDhRIBOaS4gIVp6dJlbMa7Of439N9rTQxVTdR25An5TI9m6m9T3ubN/wCRjpabFfZurpEsXG0MUxsC7Cyu/kBO1HsIvTbjKV6kdIRyA4qtnEcTWkxNWIYmrL4xKJSCY91CIwqBiwN1tmljlczzu0MdYWvqZoYbHrSq03cArezAi43SSCSOQvfygKtRhi6VEIl+2qjlvj92VBJNiO8QOsui+PZU05dFPZ6s1WvYKWVVbtCBfcDIwBz8dJ66o9FwQ71d4p2Y3t03/iIsBf8AEXwuykwidjSZAWJao7sAzEklVy+FQbDzPGN//DF91zUWw5G+fIGZMueMpWujTiwSjHZgbQBpV9wiykKUI+JbAEjxuDG8LigYX2r2XWdaDUk3yjsG3Tc7rbpBsbE2K8Ocw8EXGTKykagqRb1l0JqcEyuUHGR63D1po0as87ha01aNT7SqSLIs2FeTeitOpCK8qotsK7Z9YfhEMRUAYdPvHEe4EVoKCCckUzpgCcYQLCHg6iyIDQuwgmhmgmliFBTslp2EUXSGWBSGSFkQzQpE5wxUDUwbVgvdAJ6c4A02bMgDrmfnlEosGgQeUo6eHmJXsB+heuh9bS3eGmY5HXyPHz9YCBkYESwi5twyOnnyhUJ0MFBA7SoGpTampsXst+QJFz6XnRhxTIVdAFA6AAfaN0BnBV/f9JL+AUciWMNzG3MUxAyhQH0Kb1otiamUs7xPEvNEUUSYpiakRxLd3eOl7a6nprbxhcQ+V4maJrutOkCXY6fCoF7kngALf5l10iqrZg7axVhcngfqZ6zZOHFOnSxdYWqlFSnvWFi1Kkrub/Fdd3w700qOwMLh7FlFWqAe84uqnUbiHLzNz0mT7ZbTLBURt1FZkuAN5ioW5HHUnSZM3kqf0x/k2eP4+7Y1tTZX7UEdKg7RRZlDA7y8CLHUfTpNS1WigVQWCUy5GfeYsFFj4AE+c8LsM1Kb336luRZrHqL2nrsZtkUgGAXtdxVLlRvbozte2eflOdkyNOrs6novSR3ZGOxGJ3qZQqne/eHKxsd0A/zWmZg8XYODig+6PdBqEZOoIuMuNteM2sBtinXcA3yJ3WUkC1xqPKebbYDYdqpeoDvhmXdViD+9U2voD4R8OVNtPRny4nfRoYV+I/xNelV06D6Tz2CqTYpHiPDK+eY4c5tU7Mc8dGtSqQyPnM6nUjNB849FZ3adULUpXOoYfT8zTpNlwiu08B21E299LMnO41HmPtKYGuGVc+AidosRpq06TBtUCi95YP8AOIMFnCRKWJ42lS1uBMlEK1FgHhu13soF4yFYOdkkjCCyQytbOASMUEJOXDP5G3ztCyIIKm7lx+ZPKGpnPPM/IQdPD2OWbcTwHT8wwAGQI8YjLC5MlryqkS4tFCL4qiSptrbIjW4zE5hcTvKCQQeIMblBSG8D6w3oAzh1y6xOs/7xvL6CPqZj1m/et1ix7Cxi8XxekKpgcUco67FfRkVhFKtiNbc/CdxZN/8AmJV9OHqP74TXFGWTFtpEA93Th05Td9m8J2NBqze9VNgcjamMwPM5noOU85XAJz0vnxyvPTbIxVJ6Qw3aWcbu6GG7vBkU5Z2J1ylPktqFItwJcrMTaG02arqToBnmWPuj++AmdtJxTRbAl7uCdbZJe2U19sYRadQFVF0GTG9yTa5tMLGlmUMdSz/RJzJzR2MELMmjiWDXvGtphqtiDmOEdos37M1PLc7VWtYXvusNdeAi60pjy5UnaOvgw8ls0cBiFQ09yiaZFNN7vFg78WsdCeU9aKr1sK273HKKwHoSPS4855rDNmgsCN1dftPQbPZKCPVJsgGmuZIsBbxlXq8pWY/JxcUjy+EflpwmtTf/AG/SY+FE01P+36TrY5Wc7PCh5Ksbwb3MyQ8f2a1zN0ejnS7PW4HT0mbtHZpRjUpC4ObINRzK8+k0cD9pfG1d0DxNpnt3ot+DKoUTkW8l/MeTKCasB1MIo5epyjsiCEePpIqdfOdUS0QIKqgPDz4xesto24ilYnQ8IUBoDOysksKxZTGsK9j1yiamFUxmgIZqYokbqcTb8zikDIZ8z+o8+ksKiBbHK+Z5+MoMRT+G7fSVloVATD07dYqtQt0jLCwtAyFxUEsGEBeSnlBQRqm9pm1qZDsxGRJIMfUywkWiCKawVU3vHqmHB0y+kTKWveHkkSmzzO0dYkLX7xI6C80NrKQZlnM55zdDcTDLTK11W5sTa/KCxC7rhgbFRTKnkQqkGMulmYEEEE3z8c+EviqQJ0+FOP8AAvhKcpfiNvGgYiktZfiGY5NxHrPP4jD2QAj4m9LJmPT5xnZuO7ByLE02tvLe9jYd5fH6+k28Xg1ZQw7wNyCDlmBOJni4tr4OxgyVR5Hs7U2HDfX6NBFMgeZI9LfmbtfA902Fu8vj8LRN8Gd0fzN9EnPyKztYPIS/78HcKl2T+VZq7YW2GK/qK+gYH8Tmz8JmuXwiV20wZynwolj/ADF0J9LD5w4o/WY8+XlJfgxKCxzh/T9JKVEZw5XUcDu/IHj5zr4Uc3yJWL701Nj6zMqJaa2xFznSXtOXL3Hq8EfpL4xN5T4Zjyg8Lr5QtZuA1Pymb5LzNoYcsd45AZDx8Y4tLmbyypLQtkokl52DdoCHSYlWncQ5tlF0e4jRQG9HbySpMksKxRDDKYshhlMZihioOsF2W6bjLLMcDCKYSwOsVjphMPiRbl94YVRAdmCAOAyH2gmUrnrEoc0hnOhIhRrGHGIJHL7wUQYawlab38YrUqWgcftAUMO9Y57ikjhc6KPM2EDCtscx2IYKd0Xtw4nwHjE6OIDAMpuCL+UJTayqCbndFzzNtZjUcSKFSqrnuEh04WLE746Xsf8AUZlnLZrxwtaGdr0AVvPPpTznqK1TfW4B9DMb9mO9ofQzoeNP6NnO8mFTFjR7x6xmrh8/9K/+IjAoG/un0MdFDwOg4HkI2Ri41Rjvg7/L6RnCF6QAFipZrqdNFzHIzWGF8IUYMEDz+052XZuhKhMVKbLn3cxkeh4iVahTsO+up49I/wDsAtbx/Mq2AFvM/b8TBLEjQslCNauEsKebEDO2Q8fEzJp4UgNfl/uWehfCDLwtBfs1r5cOXiJbjgkyPJowxhpypR+30mo+HPI+kBVon9J4cDym/DEyZZ2ZZSbmxKcy3ot+lvQzY2cxRLlSPIzXkfGBlguU6Nhau7xEvTr3P0mNWxi5WzvoBmb8chCBmt3lKjxIv8jlOd6zs6LwqjcnLzN2Tj95mpObuliD+pDoeo0Plzmi0vi72Z5RcXTOxWq2UYd7C8SdoyFYHE1d2w5ylrC06xBN/T8yjGWRRXJnLySl5I4oophUMWVoVWjtCpjKmFUxZWhFaK0MNo87v8IBWlznEaGTLVqigZaxUVSDrOYgWP0ggCeEiQwy1e+RnjP+q23BRo0MPa/asWcA57iDX+pl/pns6GFJzIynk/a3YNDF1LuCCgCKynMAEm3I5kwcU9E5OO0XwO3e0FKujbyOguLEEMvdfLqDD4/aNKojBlBvlYi95l4DYPY0tymzMFLNZvEC9rDwnGo7wzHQzn5k4SaOpgcckVL5GcJtHEU1tTey8jmT1PGMUtvV/iYen/MQNAgWDW9IOjh3Lbtt8nl+BK/UmW8MT7SNHaHtNiKahl3Dnpukn5NG8D7TVWAuFvxFj/7TlDYRP/2WUfpW1/M6Cb+ztj0KditME827x+enlNEYZX30ZZzwLpWV2BtFqwffW26QARcA63Guot85q3F/78ZOErbPylnp6Mzmm9Ki+U5lJaS0reIPIDjHKoWVSxGg148p56rt187BcuFj+Z6e0S2jsqlWzZbN+sZN58/OJLC/gtx5YL3I8pV9p6o0VOhVvs0cpbYq1Ke8FRCL3GbX9SLfOLbR2G1LvAbwHxajz5TGr1AbjdIPMHL5aSq5x0zWoYp7ih+ptrFk2Q07fyH/ANo/gjia3dq1gqnhTG7frcm88/gcPVGa1LjkbNbz1mtg0rXvvA25XtJzm/kjx410kelwWFWktlzPM5k9TA4rGC9hn/fCZLYuqDY8f7yEyfaPFYxe7hqDMxHvm26vQXzPiY0IynpIqm1DcmOnbK0tqYelvXar3GAzsCjW3uXeCT37NPiHs97E4gYmni8S5Lo61bXuxdSGAY6ajOfbibi/Ai/lNscfBUYp5ObsDUiVa5NvWExFXlAXjxVlbdHWMExkZoNjLUVHbzkHvSRgCitCK0WVoVWjtCDKmFVoqrQqtFaGTGVaFDRVWhFaK0MNK0OlYcokrS4aI0MmMYyuVplhrw6nKeZVeYmztBroLcD+YHC4biwyMkdDPZMHRva0Dj9mo1QD3ctVsM+ZHGbGHpqB3RB1Vu190ZdYskpaY0ZOO0zEXYQUgly3Qbv3M1cJSVRZVA6fc8YWo2dpRTEjjjHpDTySl2yEd6OUdInfONUjHYiCk2nVa8reUB73l94oRgicBlN7nJeQhe8hMpeQmQhxmmPi9mUDc7gU81y+Wk06rTMxNSTin2FScemZFXCbjAZG/HT1gKrFO8DaaZYG1wPMeMTxFFCpuoi/p4Fn6nIaHs4UrBic6i635HQqIziqRU8xPN7NBpVVdMjcDjmDqCOIntsTTFRctRHSUdLoqlJy2zGLTWwLE0wCdL+gMzGQg2MboVLJYakn0jPYt0XrPn0gWacLQbNHSK27Os0EzSM0EzR0hWy29OQe9JCATVoRWnZI4oRWhFaSSKwhVaEVpJIoxdWhA0kkUIaibkDxhaz21U5G2REkkR9lkeitN8sgfMiU/aiOHznJIAlWbOcBkkkIF3ZdTJJAQvvSXz8pJJAnd6dBkkgIdvOEySQEA1zlMrEmSSMgMzi5va+Wcv2N1vx/zJJHFKJTzHW89F2hBuJJIERnK9QNqufMZesAzSSRkqFbBs0GWkkjig2aDZpJIyFKb0kkkID/2Q=="
              class="rounded-full bg-gray-200"
            ></img>
            <p class="text-sm text-center mt-2">Cardiologists</p>
          </div>

          <div class="flex flex-col items-center w-[120px]">
            <img
              src="data:image/jpeg;base64,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"
              class="rounded-full bg-gray-200"
            ></img>
            <p class="text-sm text-center mt-2">Pediatricians</p>
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-6 flex-wrap">
        <div class="flex flex-col items-center w-[85px]">
          <img
            src="data:image/jpeg;base64,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"
            alt="Period doubts or Pregnancy"
            class="rounded-full bg-gray-200"
          ></img>
          <p class="text-sm text-center mt-2">Surgeons</p>
        </div>

        <div class="flex flex-col items-center w-[100px]">
          <img
            src="data:image/jpeg;base64,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"
            alt="Acne, pimple or skin issues"
            class="rounded-full bg-gray-200"
          ></img>
          <p class="text-sm text-center mt-2">Gastroenterologist</p>
        </div>

        <div class="flex flex-col items-center w-[110px]">
          <img
            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8QEA8QDxAPDw8PDw0PDQ0NEBANDQ0NFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGi0dHR0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLSstLS0tLS0tLS0tKy0tLS0tLS0tLf/AABEIAKIBNwMBEQACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBQECBAAGB//EADwQAAIBAwIEAwUFBgUFAAAAAAECAAMEEQUhEjFBURNhkQYiMnGBQqGxwfAUM1JicoIVNGPR4QcjRFOS/8QAGwEAAgMBAQEAAAAAAAAAAAAAAAECAwQFBgf/xAAuEQACAgICAQQCAAUEAwAAAAAAAQIDBBESITEFE0FRFCIyYXGR8BVSodFCseH/2gAMAwEAAhEDEQA/APoYgBYQAsIATACYAdACYAbLBOsaAYRkTowOgBBMAOzACMwAqwgIEDgxgWeAzJV5xkWGpGA0EzEM4mAEcUALKYAdUEAANARSAwiGABVMALxAQYAQIwCiIZ0QFTARUwAkQGZNSqYWACVEyYIGMaKRiMgkCRYQAsIATACYATACYAM7JcLGhM0xiOjA6AFGjEcDACDBARxQ0MG8YiVOREBmuBGgZ1AwYI0GIZEYHARAXUQAkiIALCMAZgBymABlMACAwAmICpjAIh2iY0SYgIgBUwERAYj1q6IKjzEAL21PYGMDWogIXCQJFxACwgBMAJgB0ALKNxABxRGAJIiy8YHQAiAEGMAcYE5gIBUuaa83UeXEM+kkoyfhEJXQj5aMlXV6IOMsfMKcffLFRNmeWdSn5/4Oo6rRz8ePmrD8onRZ9DjmUv8A8gtS5pt8NRD8nUmQ4SXlF6thLxJf3K0HGdiD8jmJoaafg1iRJgK17TTmwz2X3j/xLI1yl4RRZk1w8swVdeRT7yMF7ggt/wDP/MuWLJ+GY36nXF/sml/nwNLa4SoqujBlbkw5TNKLi9M6EJxnFSi9phhETB1BAARgBEALoYAFBgBaAHRASkALmAyIgIgIriAxTqloHYQAPRTAAgBaAC4SIywgBYQAmAHQAmABLcZYQAcrJEWdGBEAOgBmuL2nT+Jhn+Ebt6dJZGuUvCKbL64fxMX19VJ/drj+Ztz6S+NH+4x2Z3+xGBwzbsxb5naXpRXhGCU5ze5M5aY7QbFGIOrRgpDcAXgSeytwBtRj5C4IqaWN1JU9CpKn1EPPkXcO4vRnfWKw913LKNsE8JP16/WCogu0hvMtktSbKjUwQSCBjGBtmKacTThQqubUpafwDqNVqrkAHyjrtin2XZHpFk4/pJP+T6G/sOKirXR1KhXRlB2ByDkj0Ey5bUpJo0en02U18JrWj1CTIbznEABMIAUMAJUwAKpgBYQAuIgJEALQGdEBBgBWMRmuF3zEMoIAVgAuEiMsIASIATACYAdADVYrlo0A0kiJ0AIgIUXd4WJAJC9hsT5kzVCtI5t2Q5dLpC58dpoRhkCFYcuR7GTcWUqxPr5LeKB1kdD5FDcDvHxBWA6l2BzMagN2gP8AFKf8Q9RJe0yr8mP2FS9U9RE4NFkbUyt1UXh2hHe+yNjTXQjquCTnB+fOaEZZb0BdQAxVVDAZH8wHMfOSKlpPaC6LfHj4Oh3U8sjy8piyIcO/s9Z6NlyyIOEntxPRVr3w1DgFmB91VPCXI6Z6Tm5N8aq3N/B3oVe4+Iy0r2mtq7LTJajWY4WlWGC5wThWGzcjtnO3KZKMyu7qL7+jPfg20rb7X2OjNZkBMIAUgBEALqYAEBgBYQAtmIC4gMmICDAChjEDqiIYEiAFSIALRIjJgBMAJgB0AJgAw05esaEbZIRaAGe+bFNz5Y9Tj85Otbkiq56rYgYzajjtgiJJFbB1KQYYIBHn+Ik1LRROtS8oXXGlufgrOo7MA+PrLVavlFDxX8SYBdCc/FcVP7Aq/jmDuX0JYr+WaqegUvtmpU/rdvwGBIO+XwWrEj8mO70C36UwD3UkH1jja2OVCXgXnRyhzSquv8rHjU+u/wB8tU/szypf+df/AD/gBWN4ucqrj+RsH0P+8NJhtr7/AM/p/wBGX9vI2qU6iHqShK+oyIaLOW/P+f3DUr5GIVHBYkBUU8RY9AF/2j568kPY5eEak0q7okVnoVOFssXIJIHQFRun1xObkWqcun4PVej0+zBuS02ab7V6KlQ9Twzwk0wyth88yDjf6Tz/AKrGyzUIfHZ6bES7kxr7A0krVat437q2VqdNyMDxWXNR9/4U2/vMp9LxJ1blPyyv1PJjKKrh/VhaWrV3uGNN2VWLM1M4ZRg8IXh6EEhWxg/9skczOycbQ3Gv0gzLVBThYIKgyyM+DxL3BXhYnyGeWcPYtG+hXSooemyup5MhDD5bdYxFjACVMALqYAEBgBaABEiYExDIMAKGMRDiIEAYQGVMAFYkRkwAmAHQA6AEiADa0XCiSQmHEYi4gAv1ip7gUc2OT8h/ziXUrvZky5fpx+xMUM1pnMaKMpHOSRW9oggwDTJCw2JRZIA7xbJJIulQCRaZNNIwXtQZ2k4JkJtGMMJb2UtorUxJIg0jMyCS2yHFGC/s6bY4lU788DMjLtFlH6zWhppHtNVoMqOWq0RgNxtxVqY/iUncjyP0mKdG+0duvJ+Ge2uLWhcUuGolOtRcAhXUOhB3BAP4zHKKfTOhCyUXyi9CB/ZN6KVEsLh6VKoeJ7K4LVbVm23VwfEp8hyY8uUhx14LHdze59/zFL161m2bigaOcDx3Jr2pYAqjeKi7EZ+2Fzk5Od49/YuO/wCF7Lavold6ata8N3QccIrUGSqG8QnjZh1ARVpAqSeGs2RtmGyP9T0HsdpoCvUIIG1KnnIJReRPfJJYH/VI6QYmbPaXUaNjQa4rFuAPTThQBnZmbGFBIztk/IGLlryOMHJ6Rn0bXbW7GbeslQ4yafw1V+aHcfPGJJST8BOuUfKGYMZAKpgBbMACUzEwLxDKsYwKQEcYACaIYJoALBIjJgBMAOgB0AJTmPnABzS5CTIsuDACwMAFF7Uy7eRx9BNMF+qObfLc2ZGeXJFDBvvJIra2ZKlOoN1II7cpYpRfkyTrsh3HtfQNrkj4gR9MiPgJXfa0Zauq0x9tfUSSrZF3R+zPU12iOdRR9RH7bF76fgz1NWpt8JL+VMFz90ahoTs38GStq6r8SVV82pVFHqRGHbB09bpNycHyB5Q0D68hVvkPWHgktPwwV1c55GQky6uGnswkhsg568JzjHdT5Z/XOR10Xctvs+q6HTK21urcxRpgjlj3RtjpObY9yZ26lqC39DBZAsLfnz8xABJcezFAMatq1Sxrnc1LMhEc/wCpRPuP9RIuJNTfz2VXVNQtv8zQW8pD/wAixHDXA7vbsdz/AEN9JHTH+r8dHzj/AKre0a3z0KNsz+DQ4qlTjR6TNct7uCrgH3VyP7zK5s2Y8OPb+TwtOq6EHcMpyHUlWU9wekr2b/bTR7v2U9vrlHSnXb9opHAZqhArU12BYN9rHPf1k42tPTM12FFrcemfXVM0nJLiABKZiAKYDBsYCKwAkQAG8QwDQAWiRGTADoAdADoAXoDLCADheUmRJzGBOYAJ9VQq/F9l+R/mA3H5zVS9rX0czLi4z5fDMYlxmTJxEJgjmMTK4ktlfEDXsaNT95Tpv5uqsfvEfJoPbTK0tJt1+Gmi/JQIe4xexE206KgbASDk2WRrjHwK9SAHQSyDKrEhFdWNGp8dNG/qUGXbM+tdroWXGi0h8JdP6HZR6Zj0gTl/X+qTMr6c6/BXqf3cLfiJHiWKTXWkXt0qKcs2SCDsoGSO/eVyRpraXk+qezOpNc0A9THGrFHI64wQfI4M59sOMtHZps5x2NxKi4vADoADaACzV9EtboYr0lc4wKmOGqvycb/TlE4pk4WSh3Fngtd/6bPu1pUFQf8Apr4V/ow2P1xK3V9GlZb+RRonsBdtWUVqfg0wwLuzITw9QuCSfwkfa2+yz8vS6Z9hXYADkNgOwl5zwqmABEMADMYhgzARWAFhAClSIZnYQAWiRGTADoAdADoAaLNd8xoDe1STIFDWj0GzhWhoNlbhRUQqevI9m6GSi+L2V2wVkXFiZFON9iCQR2ImzZx0mumSw84Jg0/gAaw67efST4/RU7NPUuihqDvDQbI8QQ0HIg14+IuZX9sxDiHuCrUbniMkloi5bF5qSxMrabA1XzHsXEA52ibJJPZWjbu7BUBZidlUZJlTlryaY176Xk+kezGmtbUOB8cbMXYDcLkABc9dhMFs1KXR2KK3CGn5G4lRcWzAZ2YAVaAAiYwKmAEZiAkGAF1MACK0ADExAUJgB0ALCAFXiGBaACqRGTACYAdACIAa7YYElFCZcmWECOEwAkUjACwoNDYaFuoA0335OOL68j+vOaanuOvo5mXDjPl9mdmzLNFCeyjUwY09CcU1pmStY9VLKfuMuVn2jJPGcXuD0ZP2e5XlwOOxJQ4+eDJbgyHC1eTJXF8xPBRpoMnBep0/tBhuKHxkwa6Tet8Vemg7JTZyPqWH4SLmhqt/zK3WjVlX/MHPc01jUkwcXEVPo9Yne6qY7KlNfykkhOa+v/f/AGTT0NR8Vas39/D+EeiLf0l/YzXel9Eq1kOefiMdv1iRa7L63+vSWz6vohzb0GKIjPSps4RQgJKg5wOXfE5dn8TR36e64vWto3ZkC0kGAE5iGTmAFGMABsYwK5gIjMAIBiGXUwAuDAA4baIDoDJgIkQA5oDAvEAqkRkwAmAHYgBwEAN6UTiWIiwq0Y9i0EWnFsAipDYy/DEAo9p0HDTP2gTjzHX8pox97ZhzmklsS0GzNTOanpmgkCRLNoGaslojyOFaHEOaKmtDiRcgb18RqInIw6hcjhkktFcpbE/iy1MrcSq1d4OQ1WxrpGitVcPVBWnz4Tsz+XkPOZbrkul5Oji4r8y6R7ZeQA2A2AHICYTrFgYAcTAERmAyS0QFC0YAmaAiOKMCOKICOKAF1aIYQNAAtNogCZgB2YASIASYDBPEgFciMkQAmAHQAlOYgA4pYwJMWgmRFsNHcQhsOLJDdobDWi6CACf2lXIQ9iRNWK/KOZ6kv4H/ADPOI3CxH6xNbXSf2c2L8xflFq1eCQ+QA1v11ktEXIqLkb77jmOoj4tEfdT8Aqt4IaDbZgq34zjP0G5kXJInGmUjRUsmKhi2ckZAHIHzmZ5PekjfD0/rbY6s9EtwoLKXOPtscegxISumzTHDqXxs0LbU0PuIi/0qAZByb8svjXCPhaNNIyJM2o0g2SSZbihtD4sjihtBxZBaG0LTKPWA6xckCTAtcr3hyQ+DKNcL3hzQcWcKkkRJ4owO4ogLBoDCK8QBabwAMGiAnMALAwAsYDA1DEArzK9kiDUETmkNRbO8Ud5H3EPgzvGEPcQe2yVrDvJc0HBmmpe8K5mW/J4LZtoxuRj/AMYPacx+ps3fhRBvrjSP+pyJrAiadM1nxGK4xibsTN916M2Vg+3HZ6GkZ1Tjsxa3Q46eB3mjHmoy2zFnUu2rSPPVtPc4YbMNj2I6ialaluPwYHiTk1Nefn+ZlrWbdfu/2kXekXV+nyk+yq2gHX75ltz4o6VHpC+QdW3HLaYJeq68HTj6PX5aM7aep58u2SRIL1NvvZc/TK/oE+noOglkPUNlU/TI/CGbACn9FE0VT5dmC2vh0MbSpsJcyktUMQzkaDBBK9zwjM5eXk+2dfGx1IyHUpy/9SZu/EiUbVcRr1MksJMinqYbM2Y+bzKL8LihNquqsDgHEd+RL4I0Y8PkWPqzj7Uy+9P7NPsV/RnbXXBG8trts2Vzphrwer0i9NRQfKdiuX67ZxbY/tpDHxISvigjjyZK1ZD8mJP8SRbxI1kRYvxZI1W4zLFNPwVyrcfJsW3hshoKKcNgVIhsWioMkIJAAFQxDEVetgTLZLRfXDYpudRIM59l+jp1Y60ZH1Nh1lPvsv8Ax4meprDd5KNsmJ0RNWk6qXO811SbMl9aXge1qmUPyyZky02masXQt45597OnxBVI0WRDaGcVfSdX01/uZ8/uo97QO09MjycvJdxkYj2Ra2Z6lIQcmSjFCjUMCcvLyHFHWxq0KnqmcWeVKR0YwSMtSpMzsL4xMtS6xJRsLlVsxm/ywHczTTJuSCcEos3311haS9SeI/IT02L4PLZvlsaWNXYTaznGqo0QwYfeRfgcfJW/b3Z531J9M9HhroWMZ5/Z0UjHWYyCfZfBFLV+c7OAuijM8C7VWOZtuRz62KKrypIsbMb5JHzl0PJVM937NnCDPadFy4wOdGHKQ1qsZw8m9pnXrgkgfiEdZk/Il9lvBAnuD3jWTL7JKpP4GWlXfedfDvcvJz8yhLtHoKNTInWT2cSS0y5aMiAqNAZUNJoiwyHaJgippZiGeW1BSAZjvRrx32eYrucmcifk7cPBiuKhiSG2LK1Uy+ESqTGvsqjO4UZ3M20x7MORLSPoV5a4pEDniSyqdweiOHclNbEFKk3aeaeNLZ6B2RYR6Jh+PIirEadHsz4nF0nSwaJRltmXNvjw0e0obCegR5qXkITARnqtIy8FkPIj1IziZp2cYUPOGzoIy1hKtdl0RbdDaW1o0J9C+2/eCdLGj+xRkS/VjlrbjrITy4QBPSUReto8plzjvTPRUKKqBL+MjI5RQR3XvG4MSnFvQGrgcpHfwS+Qd1us8/6hFvo9DhtaMTUzOM6Wb1IyVqZkFRLZfGSBW1M5nZwamvJjzbFoHqVAETbkR6OZVPsUPQHaZtM0cybWzBblLIJ8iE5fqepsKfCBibbuoGTH7mHqneebyntnaj4AuZibZYjLUMUWXxNOnPgztYT6MmYuj01pW2nfr8HmrfJr8SWFQCq0SBlFqSxEGa7dsyLJGxFiA81qFHIMouXRfS9MQNojuSROa8dyZ1Y5MUjNdezVX9CL8WSH+TBiWvodRTuJJQaG7Ivwer9idMCZc8+S/nOhjR0tnNypd6PZVqa8O80tbMcZaEXhLxmZZYqbNizGlrYC9wJVPF0XV5eytC9CYzFHUAm3Mc2ephuU2QlsxTho3GvJ7K9GSvcyEn0WwXYsuanFOPlR5HYo8GJqc5UqGa1IzVaUh+PIujMwXNGX147LHakgFpZ+9mdLHo0YcnI60Mavu8Pzno8bSieRz+U5dBlrmRss0+iynFbjtssGJlErpfRpjiRT2FLymNj32WyqWjSuCBMV8eUjVRNxQQUARKZURNCyGZq1rLK8eIp5TRjrUws31UqJhuyXIxlePaW+ypspjbpdhF0zO+Jf+NEPyCyWAU8pH8WKH7++tmqngTBnJqJrwl2XIzPMzhKTOymDdZU6mSTM704RpZapFrccM62JW0ZsmaaNq34XrO/VHo4FsNsKmrDvLeBV7bDC/DdZHiRlFoKtSMqGNm8g2TSYxRhAQlrbmQkSixnZWwwNoRihubNFa3XtJaQuTPP6vapg8pRbFF9U2W0lQFGBFU9Ct7YS9uDnhGZZK9R8lUaXIyeAecccuIpYzM1xQ7xTyYslXQ0xbfU9pklLkzdBaRo0kkTq0UfqcbLylBjvxxjnLnQZF6hH7MVeuO8Tx+iyGfFvpmYVQZzrsY7OPldGgHaZvx0afyWBqrmR/HRYskwXCSaoSB5DZo0fg5NNNcNGW6TY01GhS4c7Z6TXXsx8dvsSjAl3E1LSWilSuB1kJRRJA6FyGbGZksXfQ5eBvQUnE5WRNpltSTQxRdpleQT4lKiycMrQnDYKlbox3nSpv5IyXV6AajaIgyuOc62Mts5GZb7cSi1MCbOBzY5U2ZriuRDiixZFhge7OeU5uZTyR3MLIfybrWrkTi/jdna/JWg7CVvHLI5By08xxoQpZASrbDhmqMOJknc5M85eE8fCJa8rggjU5B7exY77yh5/8yfsaGlhZnO8nXmbKrauhq1uAJsjapGF1tMHQrcJ5yTg2TURjTvI0tFckZX+IfOQkKI+s+QkkJlb2rgGMR5LV7snMz3M0UrsZ6LUBprK65dErV2aLmmCQZz8yf0XU+Abic73JfZekKr2riTrsk2WcUI7i74iB5zq0RcmjNZJRTN9tkDM9Tjx60eH9Wte20RWuZtjWjy08p+ELa1wwPM85KUVonjXT5rs2WbEzh5PTPomFvitjm3pZmQ6GzctnkRaDkYb6zABiaJxkJccJ2ltJOQSrXJ7zfFFLMNasYxJi+7rNM9jL4oHpdUl5hnLsnKPR7fT+QnJyZE61pDIDac1sn8mW6bAkGy2KFjXvDOxh+EZ8hGe+1DiUfMT1GLE8n6lN+BZc6nwjnNE5aI4VMZ+QFK+Z5Up7OoseJLk9ZCxbRfXBRG+k0WblME4GjmORprzNKtlkbUQ1oyxcND5pgLurhZCYQW2IbZeOqTORlTaZ061qJ6i1oACZORVJl2TElGxxF5Md1c4nRxcnvsrlUtGGjdLxT0MJqSMc46N6vkbSLZnkOP2Y55dZVIURnQ2EkhMDebgxiPNalbMc4Ey3Js0UvTBab4ibEHEzLaRolqTHIJM52TyZOGkgdXPaYeMvoujoU36E9DL6YS34JSa0LLeyYtkgzv4sTmZEumNatEhDgHOJ6Ghro8Z6rGTi9IVVEb+FvQzockeS9qe+0zI9Jiw908x0MjOS4s24tcvcj0/I9saGOk4N/bPoeJ1EdWlLEzpGxsZKu0lojsT6y+AZGRZB9nm6QLHkZKnyaX4DvR2m9MqaMdSj5R7BRMV3b7cpnsNMEC021biG3Wc6wbPaWFMgCcbI2TXg3EzDsDDenYyPyXRPP3U7WGZ8jwZfCdtgOc9HRNJHm8upyfRcezVSoN8j5Syy1MeLS4AG9na9M7biQjJG9Amt6g+IQnYSR7T2aojhB6zK3si2emCDEQbMd2gkZIlFnnNTpZziZLjXU+zDp9qQ3KcLKT2dNSXEf0hgTKUS8lasBxFF7TzNOO+yb8ArGwJM9BRN6MFrQ/paaQJpWzK2OEgytB0jQA60YjDUA7SEiSBqo7CUssTNKiZZpFsSjiVaRNMy1VHYS2CWxSbB01GeQ9JvqMlgcqOwm2DOXekCdB2HpLtsyOMfozsg7D0ETbLK4rfg10FHYTHI6tfg10hIFpp6QAW36jHKJkoi+ig7D0hEtDOo7D0mhMRnZB2HpDYIFVpr2HoJXItTZa2prnkPQTNMTbG9JR2E59yRYmyzCZGkSTMtwoxyESSLU2LKqDsPQTo46KLmGtkGRsPQTpI58kPKCjA2EYIrcqMchAYhvKa5Ow9BBkkMNIG0igY5HKMiYbuRkSQuqAdpmsNMCKSjPITlXpbNkW9GsCYZJC2CqiLSJxMFYCX0rsnLwb9LAnco8HOtHiDaa0ZWf/Z"
            class="rounded-full bg-gray-200"
          ></img>
          <p class="text-sm text-center mt-2">Hematologists</p>
        </div>

        <div class="flex flex-col items-center w-[95px]">
          <img
            src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtPAmJ0AxEvNmJ3XZPGQtY_l_ks2_cNb5i_g&s"
            class="rounded-full bg-gray-200"
          ></img>
          <p class="text-sm text-center mt-2">Allergists</p>
        </div>

        <div class="flex flex-col items-center w-[85px]">
          <img
            src=" https://media.istockphoto.com/id/1198780608/photo/human-thyroid-anatomy.jpg?s=612x612&w=0&k=20&c=A96BQGdc57yAqHZI3cS2xrHJTPcUBvXsXQqdNSWh8jA="
            class="rounded-full bg-gray-200"
          ></img>
          <p class="text-sm text-center mt-2">Endocrinologist</p>
        </div>

        <div class="flex flex-col items-center w-[95px]">
          <img
            src=" https://vishwarajhospital.com/wp-content/uploads/2023/07/Urological-Onco-BLog.jpg"
            class="rounded-full bg-gray-200"
          ></img>
          <p class="text-sm text-center mt-2">Oncologists</p>
        </div>
      </div>
      <div id="features" className="cards-1">
        <div className="container px-4 sm:px-8 xl:px-4">
          {/* Card */}
          <div className="card">
            <div className="card-image">
              <img src={AppointmentPic} alt="alternative" />
            </div>
            <div className="card-body">
              <h5 className="card-title">Appointment Scheduling</h5>
              <p className="mb-4">
                Filterable doctor lists, real-time booking, and instant SMS
                confirmations.
              </p>
            </div>
          </div>
          {/* end of card */}
          {/* Card */}
          <div className="card">
            <div className="card-image">
              <img src={LocationService} alt="alternative" />
            </div>
            <div className="card-body">
              <h5 className="card-title">Location-Based Services</h5>
              <p className="mb-4">
                Easily find nearby hospitals, or healthcare providers, or use
                geolocation to book services.
              </p>
            </div>
          </div>
          {/* end of card */}
          {/* Card */}
          <div className="card">
            <div className="card-image">
              <img src={Availability} alt="alternative" />
            </div>
            <div className="card-body">
              <h5 className="card-title">Availability Management</h5>
              <p className="mb-4">
                Doctors can easily update their availability and manage their
                schedules.
              </p>
            </div>
          </div>
          {/* end of card */}
          {/* Card */}
          <div className="card">
            <div className="card-image">
              <img src={Filter} alt="alternative" />
            </div>
            <div className="card-body">
              <h5 className="card-title">Search and Filters</h5>
              <p className="mb-4">
                Find doctors, services, or information quickly with powerful
                search and filtering options.
              </p>
            </div>
          </div>
          {/* end of card */}
          {/* Card */}
          <div className="card">
            <div className="card-image">
              <img src={SecurityPic} alt="alternative" />
            </div>
            <div className="card-body">
              <h5 className="card-title">Secure Data Encryption</h5>
              <p className="mb-4">
                All sensitive patient data and communications are encrypted to
                ensure privacy and security.
              </p>
            </div>
          </div>
          {/* end of card */}
          {/* Card */}
          <div className="card">
            <div className="card-image">
              <img src={AlertPic} alt="alternative" />
            </div>
            <div className="card-body">
              <h5 className="card-title">SMS and Email Alerts</h5>
              <p className="mb-4">
                Automated alerts for appointments, prescriptions, and updates
                send to both in SMS and Email
              </p>
            </div>
          </div>
          {/* end of card */}
        </div>{" "}
        {/* end of container */}
      </div>{" "}
      {/* end of cards-1 */}
      {/* end of features */}
    </>
  );
};

export default Home;
