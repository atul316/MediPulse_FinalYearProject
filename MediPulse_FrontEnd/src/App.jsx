import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import PatientSignup from "./components/LoginSignup/PatientSignup";
import PatientLogin from "./components/LoginSignup/PatientLogin";
import DoctorSignup from "./components/LoginSignup/DoctorSignup";
import DoctorLogin from "./components/LoginSignup/DoctorLogin";
import OrganizationSignup from "./components/LoginSignup/OrganizationSignup";
import OrganizationLogin from "./components/LoginSignup/OrganizationLogin";
import ProfileTab from "./components/ProfileTab";
import DoctorDashboard from "./components/pages/DoctorDashboard";
import PatientDashboard from "./components/pages/PatientDashboard";
import OrganizationDashboard from "./components/pages/OrganizationDashboard";
import { setRoleInLocalStorage } from "./Auth/checkRole";
import { getUserFromLocalStorage, setUserInLocalStorage } from "./Auth/setUser";
import Loader from "./components/Common/Loader";
import { server } from "./main";
import { removecookieweb } from "./Auth/RemoveCookie";
import { ToastContainer, toast, Slide } from "react-toastify";
import PaymentGateway from "./components/pages/PaymentGateway";
import OrderSuccess from "./components/pages/OrderSuccess";
import OrderFailed from "./components/pages/OrderFailed";

function App() {
  const [loading, setloading] = useState(false);
  const [user, setuser] = useState([]);

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
          setloading(false);
          setUserInLocalStorage(data.user);
          setuser(data.user);
        } else {
          setRoleInLocalStorage("empty");
          setUserInLocalStorage("empty");
          setloading(false);
          console.log("error");
        }
      } catch (error) {
        setRoleInLocalStorage("");
        setUserInLocalStorage("");
        setloading(false);
      }
    };

    if (localStorage.getItem("authToken_Medipulse")) {
      fetchUserData();
    }
  }, []);

  if (getUserFromLocalStorage() == "empty") {
    removecookieweb();
  }

  return (
    <>
      {loading ? <Loader /> : <></>}
      <>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctordashboard" element={<DoctorDashboard />} />
            <Route path="/patientdashboard" element={<PatientDashboard />} />
            <Route path="/orgdashboard" element={<OrganizationDashboard />} />
            <Route path="/patientsignup" element={<PatientSignup />} />
            <Route path="/patientlogin" element={<PatientLogin />} />
            <Route path="/doctorsignup" element={<DoctorSignup />} />
            <Route path="/doctorlogin" element={<DoctorLogin />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            <Route path="/success" element={<OrderSuccess />} />
            <Route path="/failed" element={<OrderFailed />} />
            <Route
              path="/organizationsignup"
              element={<OrganizationSignup />}
            />
            <Route path="/organizationlogin" element={<OrganizationLogin />} />

            <Route path="/profiletab" element={<ProfileTab />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right" // Still required, but will be overridden
          toastClassName="custom-toast"
          transition={Slide}
          style={{
            top: "50%",
            right: "1rem",
            transform: "translateY(-50%)",
            position: "fixed",
          }}
        />
      </>
    </>
  );
}

export default App;
