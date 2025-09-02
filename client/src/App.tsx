import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./pages/Layout";
import CreateJob from "./pages/recruiter/CreateJob";
import ApplyJob from "./pages/applicant/ApplyJob";
import RouteProtector from "./helpers/RouteProtector";
import Jobs from "./pages/recruiter/Jobs";
import Dashboard from "./pages/recruiter/Dashboard";
import JobApplicants from "./pages/recruiter/JobApplicants";
import Journey from "./pages/recruiter/Journey";
import SingleJob from "./pages/applicant/SingleJob";
import SignupTest from "./pages/auth/SignupTest";
import Interview from "./pages/applicant/Interview";
import LoginTest from "./pages/auth/LoginTest";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to="/login" />
          }
        />
        <Route
          path="/login"
          element={
            <RouteProtector isAuthRequired={false}>
              <LoginTest />
            </RouteProtector>
          }
        />
        <Route
          path="/signup"
          element={
            <RouteProtector isAuthRequired={false}>
              <SignupTest />
            </RouteProtector>
          }
        />
        <Route
          path="/applicant"
          element={
            <RouteProtector isAuthRequired={true}>
              <Layout />
            </RouteProtector>
          }
        >
          <Route path="jobs" element={<ApplyJob />} />
          <Route path="job/:jobId" element={<SingleJob />} />
          <Route path="interview/:jobId" element={<Interview />} />
        </Route>
        <Route
          path="/recruiter"
          element={
            <RouteProtector isAuthRequired={true}>
              <Layout />
            </RouteProtector>
          }
        >
          <Route path="create-jobs" element={<CreateJob />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applicants/:jobId" element={<JobApplicants />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="journey" element={<Journey />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;
