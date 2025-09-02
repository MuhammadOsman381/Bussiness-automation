"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import useGetAndDelete from "@/hooks/useGetAndDelete"
import { BriefcaseBusiness, Users } from "lucide-react"
import { FaWpforms } from "react-icons/fa6";
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
import Loader from "@/components/Loader"

const Dashboard = () => {
    const getJob = useGetAndDelete(axios.get)
    const getApplicants = useGetAndDelete(axios.get)
    const getUsers = useGetAndDelete(axios.get)

    const [loading, setLoading] = useState(true)
    const [totalJobs, setTotalJobs] = useState(0)
    const [totalApplicants, setTotalApplicants] = useState(0)
    const [users, setUsers] = useState<{ name: string, email: string }[]>([])

    const fetchCounts = async () => {
        try {
            setLoading(true)
            const [jobsRes, appsRes, userRes] = await Promise.all([
                getJob.callApi("job/get", false, false),
                getApplicants.callApi("application/get", false, false),
                getUsers.callApi("auth/get", false, true)
            ])
            setTotalJobs(Array.isArray(jobsRes?.jobs) ? jobsRes.jobs.length : 0)
            setTotalApplicants(
                Array.isArray(appsRes?.applications) ? appsRes.applications.length : 0
            )
            setUsers(
                Array.isArray(userRes?.users) ? userRes.users : []
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCounts()
    }, [])



    if(loading){
        return <Loader />
    }
    else{
        return (
            <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-3">
                    <Card className="shadow-none">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                            <div className="rounded-xl p-2 ">
                                <BriefcaseBusiness className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {loading ? "—" : totalJobs}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total jobs currently listed
                            </p>
                        </CardContent>
                    </Card>
    
                    <Card className="shadow-none">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                            <div className="rounded-xl p-2  ">
                                <FaWpforms className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {loading ? "—" : totalApplicants}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all jobs
                            </p>
                        </CardContent>
                    </Card>
    
                    <Card className="shadow-none">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                            <div className="rounded-xl p-2 ">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {loading ? "—" : users.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all jobs
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full h-20" >
                    <Card className="shodow-none" >
                        <CardHeader>
                            <CardTitle>List of registered users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="shodow-none" >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead >Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        {/* <TableHead>Applied Jobs</TableHead> */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        users.map((items) => (
                                            <TableRow>
                                                <TableCell >{items.name}</TableCell>
                                                <TableCell >{items.email}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }


}

export default Dashboard
