import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[#0000005f] bg-opacity-75   ">
      <div className="border-t-4 border-blue-500 rounded-full animate-spin h-16 w-16"></div>
    </div>
  );
};

export default Loader;