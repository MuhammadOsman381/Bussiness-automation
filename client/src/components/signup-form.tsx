import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import usePostAndPut from "@/hooks/usePostAndPut";
import axios from "axios";
import LoadingButtton from "./LoadingButtton";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const defaultUserData = {
    name: "",
    email: "",
    password: "",
  };

  const [userData, setUserData] = useState(defaultUserData);

  const { callApi, loading } = usePostAndPut(axios.post);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await callApi("auth/signup", userData, false, false, true);
    if (localStorage.getItem('after_login') !== null || '') {
      navigate(`/login?${localStorage.getItem('after_login')}`)
    }
    else {
      navigate('/login')
    }

  };

  return (
    <div className={cn("flex flex-col gap-6 min-w-sm", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your credientials below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe..."
                  required
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex flex-col gap-3">
                {loading ? (
                  <LoadingButtton />
                ) : (
                  <Button type="submit" className="w-full">
                    Signup
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              if you have an account?{" "}
              <Link
                to={`/login${localStorage.getItem("after_login") ? `?${localStorage.getItem("after_login")}` : ''}`}
                className="underline underline-offset-4"
              >
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div >
  );
}
