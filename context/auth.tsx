import { onAuthStateChanged } from "@firebase/auth";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { createContext, ReactNode, useEffect, useState, useContext } from "react";
import { auth, db } from "../firebase/client";
import { User } from "../types/user";

type UserContextType = User | null | undefined;

const AuthContext = createContext<UserContextType>(undefined);

type AuthProviderType = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderType> = ({ children }) => {
  const [user, setUser] = useState<UserContextType>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, `users/${firebaseUser.uid}`);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const appUser = (await getDoc(ref)).data() as User;
          setUser(appUser);
        } else {
          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName!,
            photoURL: firebaseUser.photoURL!,
            email: firebaseUser.email!,
            createdAt: Date.now(),
          };

          setDoc(ref, appUser).then(() => {
            setUser(appUser);
          });
        }
      } else {
        setUser(null);
      }

      return unsubscribe;
    });
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);