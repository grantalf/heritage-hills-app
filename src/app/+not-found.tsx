import { Redirect } from 'expo-router';

/** Any address the app does not know goes to Home instead of an error page. */
export default function NotFound() {
  return <Redirect href="/" />;
}
