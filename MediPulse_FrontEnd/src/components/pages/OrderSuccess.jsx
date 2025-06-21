import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate()
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1 style={{ color: "green" }}>✅ Payment Successful!</h1>
      <p>Thank you for your order. Your payment has been processed.</p>
      <button className='mt-4' onClick={()=>navigate("/patientdashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default PaymentSuccess;
