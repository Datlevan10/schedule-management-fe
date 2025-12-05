import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AdminIndex() {
  useEffect(() => {
    // Redirect to dashboard when accessing /admin
    router.replace('/admin/dashboard');
  }, []);

  return null;
}