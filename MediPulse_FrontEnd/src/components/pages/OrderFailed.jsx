import React from "react";

const PaymentFailed = () => {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1 style={{ color: "red" }}>❌ Payment Failed</h1>
      <p>Something went wrong or you cancelled the payment.</p>
      <button className='mt-4' onClick={()=>navigate("/patientdashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default PaymentFailed;
