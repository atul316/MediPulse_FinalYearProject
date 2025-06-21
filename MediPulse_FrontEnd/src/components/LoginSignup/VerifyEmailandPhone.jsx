import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./../ui/alert-dialog";
import { Button } from "./../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getActivationToken } from "../../Auth/SetActivationToken";
import { server } from "../../main";
import { setcookieweb } from "@/Auth/SetCookie";
import axios from "axios";

function VerifyEmailandPhone({ open, onClose }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for Email OTP
  const [emailOtp, setEmailOtp] = useState(["", "", "", ""]);
  const emailInputRefs = useRef([]);

  // State for Phone OTP
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", ""]);
  const phoneInputRefs = useRef([]);

  const [error, setError] = useState({ email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [token, settoken] = useState("");

  

  // Handle changes for Email OTP input
  const handleEmailOtpChange = (index, value) => {
    if (value === "" || /^\d$/.test(value)) {
      const newOtp = [...emailOtp];
      newOtp[index] = value;
      setEmailOtp(newOtp);

      if (value && index < emailOtp.length - 1) {
        emailInputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle changes for Phone OTP input
  const handlePhoneOtpChange = (index, value) => {
    if (value === "" || /^\d$/.test(value)) {
      const newOtp = [...phoneOtp];
      newOtp[index] = value;
      setPhoneOtp(newOtp);

      if (value && index < phoneOtp.length - 1) {
        phoneInputRefs.current[index + 1].focus();
      }
    }
  };
  function extractErrorMessage(html) {
    const regex = /Error: (.+?)<br>/;
    const match = html.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    return 'Unknown error';
}
  // Handle backspace navigation for Email OTP
  const handleEmailKeyDown = (index, e) => {
    if (e.key === "Backspace" && emailOtp[index] === "" && index > 0) {
      emailInputRefs.current[index - 1].focus();
    }
  };

  // Handle backspace navigation for Phone OTP
  const handlePhoneKeyDown = (index, e) => {
    if (e.key === "Backspace" && phoneOtp[index] === "" && index > 0) {
      phoneInputRefs.current[index - 1].focus();
    }
  };

  // Validate OTPs
  const validateOtps = () => {
    let newErrors = {};

    if (!/^\d{4}$/.test(emailOtp.join(""))) {
      newErrors.email = "Email OTP must be a 4-digit number";
    }

    if (!/^\d{4}$/.test(phoneOtp.join(""))) {
      newErrors.phone = "Phone OTP must be a 4-digit number";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const onSubmit = async (event) => {
    event.preventDefault();

    if (!validateOtps()) return;

    setLoading(true);
    const emailOtpValue = emailOtp.join("");
    const phoneOtpValue = phoneOtp.join("");

    console.log("Email OTP:", emailOtpValue);
    console.log("Phone OTP:", phoneOtpValue);

    // Placeholder for actual API call
    // try {
    //   // Simulating an API call with a timeout

      
    //   await new Promise((resolve) => setTimeout(resolve, 2000));

    //   toast({
    //     variant: "success",
    //     title: "Verification Successful!",
    //     description: "Both email and phone numbers have been verified.",
    //   });

    //   navigate("/");
    // } catch (error) {
    //   setError({ email: "Failed to verify OTPs. Please try again." });
    // } finally {
    //   setLoading(false);
    // }
    const gettoken= getActivationToken();
    try {
      const { data } = await axios.post(`${server}/doctors/active-doctor`, {
        token: gettoken,
        emailOtp: emailOtpValue,
        phoneOtp:phoneOtpValue
      }, {
        header: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      console.log(data)
      setLoading(false);
    
      setcookieweb();
      navigate("/");

    } catch (error) {
      console.log(error.response.data.message)
      setError(error.response.data.message)
      setLoading(false);
      if(error.response.data.message){

        console.log(error.response.data.message)
        setError(error.response.data.message)

      }else if (error.response && error.response.data) {
        // Extract the plain text from the HTML error response
        const htmlString = error.response.data;
        const errorMessage = extractErrorMessage(htmlString);
        console.log(errorMessage);
        setError(errorMessage)
      } 
      else{
        console.log("unexpected error")
      }

    }

  };

  return (
    <AlertDialog open={open} onClose={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>OTP Verification</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the OTPs sent to your email and phone number.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Email OTP Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Email OTP</h3>
          <div className="flex gap-4">
            {emailOtp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleEmailOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleEmailKeyDown(index, e)}
                ref={(el) => (emailInputRefs.current[index] = el)}
                maxLength={1}
                className="h-16 w-16 text-center border border-gray-400 rounded-xl text-lg outline-none focus:ring-2 ring-blue-500"
              />
            ))}
          </div>
          {error.email && <p className="text-red-500 text-sm mt-2">{error.email}</p>}
        </div>

        {/* Phone OTP Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Phone OTP</h3>
          <div className="flex gap-4">
            {phoneOtp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handlePhoneOtpChange(index, e.target.value)}
                onKeyDown={(e) => handlePhoneKeyDown(index, e)}
                ref={(el) => (phoneInputRefs.current[index] = el)}
                maxLength={1}
                className="h-16 w-16 text-center border border-gray-400 rounded-xl text-lg outline-none focus:ring-2 ring-blue-500"
              />
            ))}
          </div>
          {error.phone && <p className="text-red-500 text-sm mt-2">{error.phone}</p>}
        </div>

        <AlertDialogFooter>
          <Button onClick={onClose} variant="destructive">
            Cancel
          </Button>
          {loading ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <AlertDialogAction onClick={onSubmit}>Submit</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default VerifyEmailandPhone;
