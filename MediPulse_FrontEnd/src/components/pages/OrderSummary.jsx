import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { redirectToCheckout } from "../pages/PaymentGateway.jsx";
import { toast } from "react-toastify";

const OrderSummary = ({ open, onClose, prescription }) => {
  const [quantities, setQuantities] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (prescription) {
      const initialQuantities = {};
      prescription.medication.forEach((med) => {
        initialQuantities[med._id] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [prescription]);

  useEffect(() => {
    if (!prescription) return;
    const totalAmount = prescription.medication.reduce((acc, med) => {
      const qty = quantities[med._id] || 1;
      return acc + qty * Math.round(med.price * 83);
    }, 0);
    setTotal(totalAmount);
  }, [quantities, prescription]);

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const handlePlaceOrder = async () => {
  try {
    console.log("Prescription object:", prescription);

    const userId = prescription.patientId;
    if (!userId) throw new Error("User ID not found in prescription");

    const medicineIds = prescription.medication.flatMap((med) =>
      Array(quantities[med._id] || 1).fill(med._id)
    );

    const orderPayload = {
      customer: userId,
      medicineIds,
      totalAmount: total,
      orderStatus: "confirmed",
      paymentStatus: "paid",
      shippingAddress: "123 Main St, Asansol, West Bengal",
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log("Sending orderPayload to backend:", orderPayload);

    const res = await fetch("https://medicine-store-backend-three.vercel.app/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Backend returned error:", result);
      throw new Error(result.message || "Order API failed");
    }

    // Continue to Stripe after successful order placement
    await redirectToCheckout(total);
    
  } catch (error) {
    console.error("Error placing order:", error);
    toast.error("Failed to place order: " + error.message);
  }
};


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6 bg-white shadow-xl sm:p-8 rounded-xl">
        <DialogHeader>
          <DialogTitle className="mb-6 text-2xl font-bold text-gray-800">
            Order Summary
          </DialogTitle>
        </DialogHeader>

        {prescription && (
          <div className="grid gap-6 max-h-[60vh] overflow-y-auto pr-2">
            {prescription.medication.map((med) => (
              <div
                key={med._id}
                className="flex flex-col items-center justify-between gap-6 p-4 bg-white border border-gray-200 shadow-sm sm:flex-row rounded-xl"
              >
                <div className="flex items-center flex-1 gap-4">
                  <img
                    src={med.imageUrl}
                    alt={med.name}
                    className="object-cover w-24 h-24 border rounded"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {med.name}
                    </h3>
                    <p className="text-sm text-gray-500">{med.description}</p>
                    <p className="mt-1 text-sm">
                      <strong>Category:</strong> {med.category}
                    </p>
                    <p className="text-sm">
                      <strong>Price:</strong> ₹{Math.round(med.price * 83)}
                    </p>
                    <p className="text-sm font-medium text-green-700">
                      <strong>Total:</strong> ₹
                      {(quantities[med._id] || 1) *
                        Math.round(med.price * 83)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    onClick={() => handleQuantityChange(med._id, -1)}
                    className="w-8 h-8 text-black bg-gray-200 border border-gray-300 hover:bg-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-lg font-bold text-center text-black">
                    {quantities[med._id] || 1}
                  </span>
                  <Button
                    size="icon"
                    onClick={() => handleQuantityChange(med._id, 1)}
                    className="w-8 h-8 text-black bg-gray-200 border border-gray-300 hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-5 mt-6 text-xl font-bold border-t">
          <span className="text-gray-700">Total</span>
          <span className="text-2xl text-green-600">₹{total}</span>
        </div>

        <DialogFooter className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            className="w-full font-semibold text-white bg-green-600 hover:bg-green-700 sm:w-auto"
            onClick={handlePlaceOrder}
          >
            Pay Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSummary;
