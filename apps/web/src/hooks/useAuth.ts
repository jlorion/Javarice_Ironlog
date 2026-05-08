import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
    const { currentUser, role, setRole } = useAuthContext();
    return { currentUser, role, setRole };
}
