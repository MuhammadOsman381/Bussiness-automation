import { Button } from "@/components/ui/button"
import useGetAndDelete from "@/hooks/useGetAndDelete"
import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import usePostAndPut from "@/hooks/usePostAndPut"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import 'ckeditor5/ckeditor5.css';
import { toast } from "sonner"
import Loader from "@/components/Loader"


interface Job {
    id: number
    title: string
    description: string
    time: string
    form_fields: {
        name: string
        type: string
    }[]
}

const Jobs = () => {

    const [jobsData, setJobsData] = useState<Job[]>([])
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [formFields, setFormFields] = useState<{ name: string; type: string }[]>([])
    const [open, setOpen] = useState(false)

    const jobs = useGetAndDelete(axios.get)
    const job = usePostAndPut(axios.post);
    const deleteJob = useGetAndDelete(axios.delete)

    const getJobs = async () => {
        const response = await jobs.callApi("job/get", false, false)
        setJobsData(response.jobs)
    }

    const addField = () => {
        setFormFields([...formFields, { name: "", type: "text" }])
    }

    const removeField = (index: number) => {
        setFormFields(formFields.filter((_, i) => i !== index))
    }

    const updateField = (index: number, key: "name" | "type", value: string) => {
        const updated = [...formFields]
        updated[index][key] = value
        setFormFields(updated)
    }

    const handleEdit = (job: Job) => {
        setFormFields(job.form_fields || [])
        setSelectedJob(job)
        setOpen(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedJob) return
        const { name, value } = e.target
        setSelectedJob((prev) =>
            prev ? { ...prev, [name]: value } : prev
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedJob) return
        const { ...rest } = selectedJob;
        const payload = {
            ...rest,
            fields: formFields,
        };
        await job.callApi(
            "job/create-or-edit",
            payload,
            true,
            false,
            true
        );
        getJobs()
        setSelectedJob(null);
        setFormFields([]);
        setOpen(false)
    }


    useEffect(() => {
        getJobs()
    }, [])



    if(jobs.loading){
        return <Loader />
    }
    else{
        return (
            <div className="w-full">
                <div className="flex flex-col  gap-3">
                    {jobsData.map((job, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-gray-200 bg-white p-6"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                                <p className="text-sm text-gray-500">{job.time}</p>
                            </div>
                            <p dangerouslySetInnerHTML={{ __html: job.description }} className="text-gray-700 mb-4 ">
                            </p>
                            <div className="flex flex-wrap gap-2" >
    
                                <Link to={`/recruiter/applicants/${job.id}`}>
                                    <Button className="cursor-pointer" variant="default">
                                        Applicants
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => handleEdit(job)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    className="cursor-pointer"
                                    onClick={async () => {
                                        await deleteJob.callApi(`job/delete/${job.id}`, false, false)
                                        await getJobs()
                                    }} variant="destructive">
                                    Delete
                                </Button>
                                <Button
                                    className="cursor-pointer"
                                    onClick={async () => {
                                        const url = `${window.location.origin}/applicant/job/${job.id}`.trim();
                                        navigator.clipboard
                                            .writeText(url)
                                            .then(() => {
                                                toast.success("Job url copied to clipboard!");
                                            })
                                            .catch(() => {
                                                toast.error("Failed to copy job url.");
                                            });
                                    }}
                                    variant="secondary">
                                    Copy Url
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
    
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Job</DialogTitle>
                                <DialogDescription>
                                    Update the details of this job posting.
                                </DialogDescription>
                            </DialogHeader>
    
                            {selectedJob && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={selectedJob.title}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="grid gap-2  ">
                                        <Label htmlFor="description">Description</Label>
                                        <CKEditor
                                            editor={ClassicEditor as any}
                                            data={selectedJob.description}
                                            onChange={(event, editor) => {
                                                const content = editor.getData();
                                                setSelectedJob((prev) =>
                                                    prev ? { ...prev, description: content } : prev
                                                )
                                            }}
                                            onReady={(editor) => {
                                                console.log("Editor is ready!", editor);
                                            }}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="time">Time</Label>
                                        <Input
                                            id="time"
                                            name="time"
                                            value={selectedJob.time}
                                            onChange={handleChange}
                                        />
                                    </div>
    
                                    <div className="grid gap-2">
                                        <Label>Custom Fields</Label>
                                        {formFields.map((field, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    value={field.name}
                                                    onChange={(e) => updateField(index, "name", e.target.value)}
                                                    placeholder={`Custom field ${index + 1}`}
                                                />
                                                <Select
                                                    value={field.type}
                                                    onValueChange={(value) => updateField(index, "type", value)}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Text</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="email">Email</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeField(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" onClick={addField}>
                                            +
                                        </Button>
                                    </div>
                                </div>
                            )}
    
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

}

export default Jobs
