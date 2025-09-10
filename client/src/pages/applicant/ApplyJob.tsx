import { Button } from "@/components/ui/button";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usePostAndPut from "@/hooks/usePostAndPut";
import LoadingButtton from "@/components/LoadingButtton";
import { Link } from "react-router-dom";
import Loader from "@/components/Loader";

interface Job {
  id: number
  title: string;
  description: string;
  time: string;
  form_fields: {
    name: string;
    type: string;
  }[];
  status: string
}

const ApplyJob = () => {
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const jobs = useGetAndDelete(axios.get);
  const application = usePostAndPut(axios.post)

  const getJobs = async () => {
    const response = await jobs.callApi("job/get-all", true, false);
    setJobsData(response.jobs);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, job: Job) => {
    e.preventDefault();
    const payload = { ...{}, fields: formData, job_id: job.id }
    await application.callApi('application/create', payload, true, false, true)
    await getJobs()
  };

  useEffect(() => {
    getJobs();
  }, []);


  if (jobs.loading) {
    return <Loader />
  }
  else {
    return (
      <div className="flex flex-col gap-3">
        {jobsData.map((job, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-6 "
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-sm text-gray-500">{job.time}</p>
            </div>
            <p dangerouslySetInnerHTML={{ __html: job.description }} className="text-gray-700 mb-4"></p>

            {
              job.status == "available" &&
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Apply Now</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={(e) => handleSubmit(e, job)}>
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Fill out the form below to apply.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                      {job.form_fields.map((field, idx) => (
                        <div key={idx} className="grid gap-2">
                          <Label htmlFor={field.name}>{field.name}</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            onChange={handleChange}
                          />
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      {
                        application.loading ?
                          <LoadingButtton />
                          : <Button type="submit">Submit</Button>
                      }
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            }

            {
              job.status == "application submitted" &&
              <Link to={`/applicant/interview/${job.id}`}>
                <Button>
                  Start Interview
                </Button>
              </Link>
            }
            {

              job.status == "interview cleared" &&
              <Button disabled >
                Interview Submitted
              </Button>
            }
          </div>
        ))}
      </div>
    );
  }

};

export default ApplyJob;
