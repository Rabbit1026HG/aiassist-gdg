import { LandingPage } from "@/components/landing-page"

export default function Home() {
  // In a real app, you would check if the user has a valid session
  // const isAuthenticated = checkAuth();
  // if (isAuthenticated) {
  //   redirect("/dashboard");
  // }

  return <LandingPage />
}
