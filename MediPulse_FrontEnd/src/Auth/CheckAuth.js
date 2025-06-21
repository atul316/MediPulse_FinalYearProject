export const checkAuthentication=()=>{
    const token = localStorage.getItem('authToken_Medipulse');

    if(token){
        return true;
    }else{
        return false;
    }

}