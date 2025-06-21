import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SidePic from "./../../assets/bg-sidebar-desktop.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { checkAuthentication } from "@/Auth/CheckAuth";
import { server } from "@/main";
import { setcookieweb } from "@/Auth/SetCookie";
import Loader from "../Common/Loader";
import axios from "axios";
import {toast} from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

const OrganizationLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setloading] = useState();

  // State for Login Details Form
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if(checkAuthentication()){
      navigate("/")
    }
  }, []);




  // Handle changes for Login Details
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  // Validation for Login Details
  const validateLoginDetails = () => {
    let newErrors = {};
    Object.keys(loginDetails).forEach((key) => {
      if (!loginDetails[key]) {
        newErrors[key] = "This field is required";
      }
    });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(loginDetails.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setLoginDetails({
      email: "",
      password: "",
    });
    navigate("/");
  };

  // Handle Login Button
  const handleLogin = async() => {
    if (validateLoginDetails()) {
      const completeData = {
        ...loginDetails,
      };
      console.log("Complete Data:", completeData);
      setLoginDetails({
        email: "",
        password: "",
      });
       // fetch api
       const apiUrl = `${server}/doctors/login`;
       const requestBody = {
         email: loginDetails.email,
         password: loginDetails.password,
       };
 
 
       setloading(true);
       
 
     try {
       
       const response = await axios.post(apiUrl, requestBody, {
         header: {
           "Content-Type": "application/json",
         },
         withCredentials: true,
       });
       console.log('response:', response.data);
 
       toast.success(response.data.message)
       setloading(false);
       setcookieweb();
      
         navigate("/");
       
     } catch (error) {
       setloading(false);
       toast.error(error.response.data.message)
 
     }
     
     
    }
  };

  return (
    <>
    {
      loading?<Loader/>:(<></>)
    }
    
    <div className="w-[60%] mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md  ">
      <div className="flex gap-10 justify-center items-center">
        <img src={SidePic} alt="sidepic" className="w-fit" />
        <div className="flex flex-col w-full">
          <h2 className="text-xl font-bold mb-20">Doctor Login</h2>
          <form className="space-y-4">
            {[
              {
                label: "Email ID",
                type: "text",
                name: "email",
                placeholder: "Enter your Email ID",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block font-medium mb-4">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={loginDetails[field.name]}
                  onChange={handleLoginChange}
                  placeholder={field.placeholder}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-sm">{errors[field.name]}</p>
                )}
              </div>
            ))}
            <div className="relative">
              <label htmlFor="password" className="block font-medium mb-1 ">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={handleLoginChange}
                  required
                  name="password"
                  value={loginDetails.password}
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
                onClick={handleLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 duration-500"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrganizationLogin;
