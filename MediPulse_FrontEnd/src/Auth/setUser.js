export const setUserInLocalStorage=(userDetails)=> {
    localStorage.setItem('userDetails_Medipulse',  JSON.stringify(userDetails));
  }

  export const getUserFromLocalStorage =()=> {
    const userDetails = localStorage.getItem('userDetails_Medipulse');
    
    if (!userDetails) {
      return null; 
    }
  
    return JSON.parse(userDetails);
  }
  