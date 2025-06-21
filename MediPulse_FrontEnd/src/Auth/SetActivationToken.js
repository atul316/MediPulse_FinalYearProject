export const setActivationToken=(token)=> {
    localStorage.setItem('activation-token',token);
  }

  export const getActivationToken =()=> {
    const token = localStorage.getItem('activation-token');
    
    if (!token) {
      return null; 
    }
  
    return token;
  }