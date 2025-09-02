import { LoginForm } from "@/components/login-form";
import NavBar from "@/components/NavBar";

const Login = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 border flex items-center justify-center" >
      <div  className="max-w-4xl h-auto" >
        <LoginForm />
      </div>
      </div>
    </div>
  );
};

export default Login;
