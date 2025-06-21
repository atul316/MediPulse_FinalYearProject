

// const MultiSelect = (props) => {
//   return (
//     <>
//       <Select
//         isMulti
//         options={props.medications
//           .filter((med) => !props.selectedMeds.includes(med.name))
//           .map((med) => ({ label: med.name, value: med.name }))}
//         value={props.selectedMeds.map((med) => ({ label: med, value: med }))}
//         onChange={(selected) =>
//           props.setSelectedMeds(selected.map((option) => option.value))
//         }
//         placeholder="Search and select medicines..."
//       />
//     </>
//   );
// };


import React,{useState} from "react";
import Select from "react-select";

const MultiSelect = ({ options, value, onChange }) => {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase()) &&
      !value.some((v) => v._id === opt._id)
  );

  const handleAdd = (med) => {
    onChange([...value, med]); // Add full object
    setSearch("");
  };

  const handleRemove = (id) => {
    onChange(value.filter((v) => v._id !== id)); // Remove by _id
  };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search medicine..."
      />
      {filteredOptions.length > 0 && (
        <ul className="border bg-white max-h-40 overflow-y-auto">
          {filteredOptions.map((med) => (
            <li
              key={med._id}
              onClick={() => handleAdd(med)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {med.name}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap mt-2 gap-2">
        {value.map((med) => (
          <span key={med._id} className="bg-gray-100 px-2 py-1 rounded flex items-center">
            {med.name}
            <button onClick={() => handleRemove(med._id)} className="ml-1 text-red-500">
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
export default MultiSelect;