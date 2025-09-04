import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import usePostAndPut from "@/hooks/usePostAndPut";
import axios from "axios";
import * as React from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"
import Loader from "@/components/Loader";

type Applicant = {
    id: number
    created_at: string
    fields: Record<string, any>
    user: {
        id: number
        name: string
        email: string
    }
    job: {
        id: number
        title: string
    }
}

interface Interview {
    id: number
    name: string
    email: string
    job: string
    status: string
}

interface InterviewHandsOff {
    jobId: string,
    name: string,
    email: string,
    meetingUrl: string,
    startAt: string
}

interface Job {
    id: string
    title: string
    description: string
    time: string
    form_fields: {
        name: string
        type: string
    }[]
}

const Journey = () => {
    const steps = ["Leads Captured", "AI Prescreen", "Interview Handoff", "Dynamic checklists & portal", "Document Processing"];
    const [currentStep, setCurrentStep] = React.useState(0);
    const [aiPreScreenData, setAiPreScreenData] = React.useState<Interview[]>([]);
    const [aiPrescreenFilter, setAiPrescreenFilter] = React.useState("Pass")
    const [applicants, setApplicants] = React.useState<Applicant[]>([])
    const [intrviewHandsOffData, setIntrviewHandsOffData] = React.useState<InterviewHandsOff[]>([])
    const [jobsData, setJobsData] = React.useState<Job[]>([])
    const [jobId, setJobId] = React.useState('')
    const [checkList, setCheckList] = React.useState<{ list: string, isChecked: boolean }[]>([])

    const get = useGetAndDelete(axios.get)
    const getInterviewers = useGetAndDelete(axios.get)
    const filter = useGetAndDelete(axios.get)
    const bookedSlots = useGetAndDelete(axios.get)
    const jobs = useGetAndDelete(axios.get)
    const list = usePostAndPut(axios.post)
    const saveList = usePostAndPut(axios.put)

    const getApplicants = async () => {
        if (!jobId) return
        const response = await get.callApi(`application/get/${jobId}`, false, false)
        if (response?.applications) {
            setApplicants(response.applications)
        }
        else {
            setApplicants([])
        }
    }

    const getAIPreScreenInterview = async () => {
        const response = await getInterviewers.callApi(`interview/get-users`, false, false)
        setAiPreScreenData(response.users)
    }

    const filterAIPreScreenInterview = async () => {
        const response = await filter.callApi(`interview/get-filtered-users/${aiPrescreenFilter}`, false, false)
        setAiPreScreenData(response.users)
    }

    const getBookedSlots = async () => {
        const response = await bookedSlots.callApi('interview/booked-slots', false, false)
        const formattedResponse = response?.response?.data?.bookings?.map((items: any) => {
            return {
                jobId: items.metadata.job_id,
                name: items.user.name,
                email: items.user.email,
                meetingUrl: items.metadata.videoCallUrl,
                startAt: items.startTime,
            }
        }) || []
        setIntrviewHandsOffData(formattedResponse)
    }


    const getJobs = async () => {
        const response = await jobs.callApi("job/get", false, false);
        setJobsData(response.jobs);
        if (response.jobs && response.jobs.length > 0) {
            const firstJob = response.jobs[0];
            setJobId(firstJob.id);
        }
    };

    const generateCheckList = async () => {
        const response = await list.callApi(`checklist/generate-list/`, {}, false, false, false)
        setCheckList(response.data.list.map((item: { list: string, isChecked: boolean }) => ({
            list: item.list,
            isChecked: item.isChecked,
        })))
    }

    const handleCheck = (index: number) => {
        const updatedList = [...checkList];
        updatedList[index].isChecked = !updatedList[index].isChecked;
        setCheckList(updatedList);
    };

    const saveCheckList = async () => {
        await saveList.callApi(`checklist/save/${jobId}`, { checkList: checkList }, false, false, true)
        generateCheckList()
    }

    React.useEffect(() => {
        getJobs()
    }, [])

    React.useEffect(() => {
        getApplicants();
        getBookedSlots();
        generateCheckList();
    }, []);

    React.useEffect(() => {
        filterAIPreScreenInterview()
    }, [aiPrescreenFilter])

    if (get.loading || getInterviewers.loading || filter.loading || bookedSlots.loading || jobs.loading) {
        return <Loader />
    }
    else {
        return (
            <div className=" w-full mx-auto  space-y-4">

                {/* <div className="h-auto w-full " >
                    <div className="h-auto border rounded-xl px-4 py-3" >
                        <h1 className="text-lg font-semibold" >
                            Filter journey by job
                        </h1>
                        <div className="flex gap-2">
                            <Select
                                value={jobId || ''} // Make sure `jobId` has a valid value or fallback to empty string
                                onValueChange={(value) => setJobId(value)}
                                disabled={!jobsData.length} // Disable the select if there are no jobs
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a job" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {jobsData.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.title}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                </div> */}

                <div className="w-full flex lg:flex-row flex-col items-center justify-between lg:gap-0 gap-3   relative">
                    {steps.map((step, index) => (
                        <div key={index} className="flex-1 flex items-center justify-center relative">
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute z-0
                                            lg:top-1/2 lg:left-1/2 lg:w-full lg:h-1 lg:-translate-y-1/2 lg:translate-x-0
                                            top-full left-1/2 w-1 h-16 -translate-y-3 -translate-x-1/2
                                            ${index < currentStep ? "bg-gradient-to-tr from-[#484f98] to-[#1a237e]" : "bg-zinc-300"}`
                                    }
                                />
                            )}
                            <div
                                className={`z-10 w-50 h-10 flex items-center ml-5 text-sm p-3 justify-center rounded-xl text-white font-semibold cursor-pointer
                                ${index <= currentStep ? "bg-gradient-to-tr from-[#484f98] to-[#1a237e]" : "bg-zinc-300"}
                  `}
                                onClick={() => setCurrentStep(index)}
                            >
                                {step}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full" >

                    {
                        currentStep == 0 &&
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Applicants List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Submitted at</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applicants?.length > 0 ? (
                                            applicants?.map((applicant) => (
                                                <TableRow key={applicant.id}>
                                                    <TableCell>{applicant.user.id}</TableCell>
                                                    <TableCell>{applicant.user.name}</TableCell>
                                                    <TableCell>{applicant.user.email}</TableCell>
                                                    <TableCell>{new Date(applicant.created_at).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button size="sm">View Details</Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Application Details</DialogTitle>
                                                                </DialogHeader>

                                                                <div className="space-y-3">
                                                                    {Object.entries(applicant?.fields || {}).map(
                                                                        ([key, value], idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className="flex justify-between text-sm bg-zinc-100 p-2 rounded-md pb-1"
                                                                            >
                                                                                <span className="font-medium">{key}</span>
                                                                                <span className="text-gray-600">
                                                                                    {String(value)}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="ml-2"
                                                            onClick={() => {
                                                                const details = `
                                                            Applicant ID: ${applicant.id}
                                                            Submitted: ${new Date(applicant.created_at).toLocaleString()}
    
                                                            --- User Info ---
                                                            Name: ${applicant.user.name}
                                                            Email: ${applicant.user.email}
    
                                                            --- Application Data ---
                                                            ${Object.entries(applicant.fields || {}).map(([key, value]) => `${key}: ${value}`).join("\n")}`.trim();
                                                                navigator.clipboard
                                                                    .writeText(details)
                                                                    .then(() => {
                                                                        toast.success("Applicant details copied to clipboard!");
                                                                    })
                                                                    .catch(() => {
                                                                        toast.error("Failed to copy details.");
                                                                    });
                                                            }}
                                                        >
                                                            Copy
                                                        </Button>

                                                    </TableCell>

                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-gray-500">
                                                    No applicants found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    }

                    {
                        currentStep == 1 &&
                        <div className="w-full space-y-2" >
                            <div className="h-auto border rounded-xl px-4 py-3" >
                                <h1 className="text-lg font-semibold" >
                                    Filters
                                </h1>
                                <div className="flex gap-2" >
                                    <Select
                                        defaultValue={aiPrescreenFilter}
                                        onValueChange={(value) => setAiPrescreenFilter(value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="filter users" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="Pass">Passed</SelectItem>
                                                <SelectItem value="Fail">Failed</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={
                                        () => {
                                            // setAiPrescreenFilter('')
                                            getAIPreScreenInterview()
                                        }

                                    } >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                            <Card className="shadow-none">
                                <CardHeader>
                                    <CardTitle>User who cleared prescreen interview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aiPreScreenData?.length > 0 ? (
                                                aiPreScreenData?.map((applicant) => (
                                                    <TableRow key={applicant.id}>
                                                        <TableCell>{applicant.name}</TableCell>
                                                        <TableCell>{applicant.email}</TableCell>
                                                        <TableCell>{applicant.status}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                                        No applicants found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    }


                    {
                        currentStep == 2 &&
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle>Booked slots for interview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Meeting URL</TableHead>
                                            <TableHead>Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {intrviewHandsOffData?.length > 0 ? (
                                            intrviewHandsOffData?.map((interviewHandOff, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{interviewHandOff.name}</TableCell>
                                                    <TableCell>{interviewHandOff.email}</TableCell>
                                                    <TableCell>{interviewHandOff.meetingUrl}</TableCell>
                                                    <TableCell>{new Date(interviewHandOff.startAt).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-gray-500">
                                                    No applicants found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    }


                    {
                        currentStep == 3 &&
                        <Card className="shadow-none" >
                            <CardHeader>
                                <CardTitle>Dynamic check list</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead >Items</TableHead>
                                            <TableHead>Check</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {checkList?.map((item, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.list}</TableCell>
                                                <TableCell><Checkbox
                                                    checked={item.isChecked}
                                                    onCheckedChange={() => handleCheck(index)}
                                                /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={saveCheckList} >
                                    Save
                                </Button>
                            </CardFooter>
                        </Card>
                    }

                    {
                        currentStep == 4 &&
                        <div>
                            Document Processing
                        </div>
                    }
                </div>
            </div>
        );
    }

};

export default Journey;
