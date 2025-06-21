export const setRoleInLocalStorage = (role) => {
    localStorage.setItem('role_Medipulse', role);
  };
  
  export const getRoleFromLocalStorage = () => {
    return localStorage.getItem('role_Medipulse');
  };