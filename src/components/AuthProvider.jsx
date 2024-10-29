import { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { json } from 'react-router-dom';
export const AuthContext = createContext();

//Provide context
export function AuthProvider({ children }) {
  const [user, setUser] = useState(()=>{
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  console.log(user);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); 
    
      } else {
        setUser(null); 
        localStorage.removeItem('user');
      }
    });

    return ()=> unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
