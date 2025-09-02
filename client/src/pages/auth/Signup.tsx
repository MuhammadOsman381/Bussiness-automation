import NavBar from "@/components/NavBar";
import { SignupForm } from "@/components/signup-form";

const Signup = () => {
  return (
    <div>
      <div className="w-full h-screen">
        <NavBar />
        <div className="h-[90vh] p-5 flex items-center justify-center">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default Signup;
