import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import MultiSelect from "../ui/MultiSelect.jsx"; // custom multi-select component (you can use a package or implement)

const PrescriptionDialog = ({ open, onClose, onGenerate }) => {
  const [disease, setDisease] = useState("");
  const [remarks, setRemarks] = useState("");
  const [medications, setMedications] = useState([]);
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      axios
        .get("https://medicine-store-backend-three.vercel.app/medicines")
        .then((res) => {
          setMedications(res.data || []);
        })
        .catch((err) => console.error("Failed to load medications", err));
    }
  }, [open]);

  const handleSubmit = () => {
    setLoading(true);
    onGenerate({
      disease,
      medication: selectedMeds,
      remarks,
    });
    setDisease("");
    setRemarks("");
    setSelectedMeds([]);
    onClose();
    setLoading(false);
  };

  const handleChange = (selectedItems) => {
    setSelectedMeds(selectedItems); // each item: { _id, name }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Prescription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Patient Disease</Label>
            <Input
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              placeholder="e.g. Asthma"
            />
          </div>

          <div>
            <Label>Medications</Label>
            <MultiSelect
              className="border border-black"
              medications={medications}
              selectedMeds={selectedMeds}
              setSelectedMeds={setSelectedMeds}
              options={medications}
              value={selectedMeds}
              onChange={handleChange}
              placeholder="Search and select medicines..."
            />
          </div>

          <div>
            <Label>Additional Remarks</Label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button  onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Generate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDialog;
