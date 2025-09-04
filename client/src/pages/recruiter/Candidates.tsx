import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import useGetAndDelete from "@/hooks/useGetAndDelete"
import axios from "axios"
import { useEffect, useState } from "react"
import Loader from "@/components/Loader"
import { Button } from '@/components/ui/button';
import usePostAndPut from "@/hooks/usePostAndPut"

interface User {
    user: {
        name: string,
        email: string,
        contact_no: string,
    },
    available_documents: string,
    total_documents: string,
    interview: {
        status: string
    }
}

const Candidates = () => {
    const getUsers = useGetAndDelete(axios.get)
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])

    const post = usePostAndPut(axios.post)

    const fetchCounts = async () => {
        try {
            setLoading(true)
            const [userRes] = await Promise.all([
                getUsers.callApi("auth/get", false, true)
            ])
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

    const passOrFail = async (user: any, status: string) => {
        const payload = {
            name: user.name,
            email: user.email,
            contact_no: user.contact_no
        }
        await post.callApi(`interview/pass-or-fail/${status}`, payload, false, false, true);
    }

    if (loading) {
        return <Loader />
    }
    else {
        return (
            <div>
                <div className="w-full h-20" >
                    <Card className="shodow-none" >
                        <CardHeader>
                            <CardTitle>List of candidates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table className="shodow-none" >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead >Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Contact No</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Documents</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        users.map((items) => (
                                            <TableRow>
                                                <TableCell >{items.user.name}</TableCell>
                                                <TableCell >{items.user.email}</TableCell>
                                                <TableCell >{items.user.contact_no}</TableCell>
                                                <TableCell >{items?.interview?.status}%</TableCell>
                                                <TableCell >{items?.available_documents}/{items?.total_documents}</TableCell>
                                                <TableCell className="flex gap-2" >
                                                    <Button
                                                        disabled={post.loading}
                                                        onClick={
                                                            () => {
                                                                passOrFail(items.user, "fail")
                                                            }
                                                        } size='sm' >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        disabled={post.loading}
                                                        onClick={
                                                            () => {
                                                                passOrFail(items.user, "pass")
                                                            }
                                                        }
                                                        size='sm' variant="destructive" >
                                                        Accept
                                                    </Button>
                                                </TableCell>

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

export default Candidates
