import { Redirect } from 'expo-router';

export default function RootIndex() {
  // Temporarily redirect to welcome screen (will show transaction receipt)
  return <Redirect href="/welcome" />;
}