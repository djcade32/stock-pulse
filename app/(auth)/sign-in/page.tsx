import SignInPage from "@/appPages/auth/SignInPage";
import { track } from "@/lib/analytics";

export default function Page() {
  track("viewed_sign_in_page");

  return <SignInPage />;
}
