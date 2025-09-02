import useGetAndDelete from "@/hooks/useGetAndDelete"
import axios from "axios"
import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

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

const JobApplicants = () => {
    const { jobId } = useParams()
    const get = useGetAndDelete(axios.get)
    const [applicants, setApplicants] = useState<Applicant[]>([])

    const getApplicants = async () => {
        const response = await get.callApi(`application/get/${jobId}`, false, false)
        if (response?.applications) {
            setApplicants(response.applications)
        }
    }

    useEffect(() => {
        getApplicants()
    }, [])

    return (
        <div className="space-y-4">
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>Applicants List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
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
        </div>
    )
}

export default JobApplicants
