import useGetAndDelete from "@/hooks/useGetAndDelete"
import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
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
import { Button } from "@/components/ui/button";
import usePostAndPut from "@/hooks/usePostAndPut";
import LoadingButtton from "@/components/LoadingButtton";
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
}

const SingleJob = () => {
    const { jobId } = useParams()
    const [singleJob, setSingle] = useState<Job>()
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [status, setStatus] = useState<{ application_filled: boolean, interview_conducted: boolean }>({ application_filled: false, interview_conducted: false })

    const job = useGetAndDelete(axios.get)
    const application = usePostAndPut(axios.post)

    const getJob = async () => {
        const response = await job.callApi(`job/get/${jobId}`, true, false)
        setSingle(response.job)
        setStatus({
            application_filled: response.application_filled,
            interview_conducted: response.interview_conducted
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files?.[0] : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...{}, fields: formData, job_id: singleJob?.id }
        await application.callApi('application/create', payload, true, false, true)
        getJob()
    };

    useEffect(() => {
        getJob()
    }, [])

    if (job.loading) {
        return <Loader />
    }
    else {
        return (
            <>
                {
                    <div className="flex flex-col gap-3">
                        <div
                            className="rounded-2xl border border-gray-200 bg-white p-6 "
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{singleJob?.title}</h2>
                                <p className="text-sm text-gray-500">{singleJob?.time}</p>
                            </div>
                            <p dangerouslySetInnerHTML={{ __html: singleJob?.description as string }} className="text-gray-700 mb-4"></p>

                            {
                                status?.application_filled !== true &&
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>Apply Now</Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-[425px]">
                                        <form onSubmit={(e) => handleSubmit(e)}>
                                            <DialogHeader>
                                                <DialogTitle>Apply for {singleJob?.title}</DialogTitle>
                                                <DialogDescription>
                                                    Fill out the form below to apply.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-4 py-2">
                                                {singleJob?.form_fields.map((field, idx) => (
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
                                                        <LoadingButtton /> :
                                                        <Button type="submit">Submit</Button>
                                                }
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            }
                            {
                                status?.application_filled === true && status?.interview_conducted === false &&
                                <Link to={`/applicant/interview/${jobId}`}>
                                    <Button>
                                        Start Interview
                                    </Button>
                                </Link>
                            }

                            {
                                status?.application_filled === true && status?.interview_conducted === true &&
                                <Button disabled >
                                    Interview Submitted
                                </Button>
                            }

                        </div>
                    </div>
                }
            </>
        )
    }

}

export default SingleJob
