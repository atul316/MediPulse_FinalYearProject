import { server } from "../main";
import { setRoleInLocalStorage } from "./checkRole";
import { setUserInLocalStorage } from "./setUser";


export const fetchUserData = async () => {
    try {
      const response = await fetch(`${server}/common/getuserdetails`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setRoleInLocalStorage(data.user.role)
        setUserInLocalStorage(data.user);


      } else {
        setRoleInLocalStorage("")

      }
    } catch (error) {
      setRoleInLocalStorage("")
    }
  };