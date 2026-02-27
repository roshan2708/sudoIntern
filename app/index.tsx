import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store';

export default function Index() {
    const firebaseUser = useAuthStore((s) => s.firebaseUser);

    if (firebaseUser) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}
