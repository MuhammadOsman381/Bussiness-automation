"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import usePostAndPut from "@/hooks/usePostAndPut";
import Helpers from "@/helpers/Helpers";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
    user: {
        id: string;
        name: string;
        email: string;
        contact_no: string;
    };
    available_documents: string;
    total_documents: string;
    interview: {
        status: string;
        qa: { question: string, applicant_answer: string }[]
    };
    documents: {
        file_path: string;
    }[];
}

const Candidates = () => {
    const getUsers = useGetAndDelete(axios.get);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openImage, setOpenImage] = useState<string | null>(null)
    const post = usePostAndPut(axios.post);

    const fetchCounts = async () => {
        try {
            setLoading(true);
            const [userRes] = await Promise.all([
                getUsers.callApi("auth/get", false, true),
            ]);
            console.log(userRes)
            setUsers(Array.isArray(userRes?.users) ? userRes.users : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    const passOrFail = async (user: any, status: string) => {
        const payload = {
            name: user.name,
            email: user.email,
            contact_no: user.contact_no,
        };
        await post.callApi(
            `interview/pass-or-fail/${status}`,
            payload,
            false,
            false,
            true
        );
    };


    if (loading) return <Loader />;


    if (selectedUser) {
        return (
            <div className="h-full flex flex-col  items-start  justify-start">
                <Button variant="secondary" onClick={() => setSelectedUser(null)} className=" mb-2">
                    Back to Candidates
                </Button>

                <Card className="w-full h-auto flex flex-row items-center justify-center shadow-none mb-3">
                    <CardContent className="flex flex-row items-center justify-between w-full">
                        <div>
                            <h2 className="text-2xl font-bold">{selectedUser.user.name}</h2>
                            <p className="text-gray-600">{selectedUser.user.email}</p>
                            <p className="text-gray-600">{selectedUser.user.contact_no}</p>
                        </div>

                        <div className="flex flex-col  items-center">
                            <RadialBarChart
                                width={100}
                                height={100}
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="100%"
                                barSize={30}
                                data={
                                    [
                                        {
                                            name: "Score",
                                            value: selectedUser.interview.status || 0,
                                            fill: "#4F46E5",
                                        },
                                    ]
                                }
                                startAngle={90}
                                endAngle={-270}
                            >
                                <PolarAngleAxis
                                    type="number"
                                    domain={[0, 100]}
                                    angleAxisId={0}
                                    tick={false}
                                />
                                <RadialBar
                                    background
                                    dataKey="value"
                                    cornerRadius={50}
                                />
                            </RadialBarChart>
                            <div>
                                {selectedUser.interview.status || 0}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="docs" className="w-full">
                    <TabsList className="w-full flex">
                        <TabsTrigger value="docs" className="flex-1">Documents</TabsTrigger>
                        <TabsTrigger value="interview" className="flex-1">Interview Q/A</TabsTrigger>
                    </TabsList>

                    <TabsContent value="docs">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                            {selectedUser?.documents?.length > 0 ? (
                                selectedUser?.documents?.map((doc, i) => (
                                    <Card key={i} className="shadow-none">
                                        <div className="text-lg font-semibold px-5">
                                            {doc.file_path.split("/")[0]}
                                        </div>
                                        <CardContent>
                                            <img
                                                src={Helpers.imageUrl + doc.file_path}
                                                alt={`Document ${i + 1}`}
                                                className="w-full h-72 object-contain rounded-md cursor-pointer"
                                                onClick={() => setOpenImage(Helpers.imageUrl + doc.file_path)}
                                            />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="ml-2 ">No documents available</p>
                            )}
                            <Dialog open={!!openImage} onOpenChange={() => setOpenImage(null)}>
                                <DialogContent className="max-w-full shadow-none ">
                                    {openImage && (
                                        <img
                                            src={openImage}
                                            alt="Full View"
                                            className="w-full h-[50vh] object-contain"
                                        />
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    </TabsContent>
                    <TabsContent value="interview">
                        <div className="p-6 border rounded-2xl shadow-none bg-white">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Interview Q&A
                            </h2>
                            <div className="space-y-6">
                                {
                                    selectedUser?.interview?.qa?.length > 0 ?
                                        selectedUser?.interview?.qa?.map((item, index) => (
                                            <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                                                <p className="text-sm font-medium text-gray-600">Question:</p>
                                                <p className="text-base font-semibold text-gray-900 mb-2">
                                                    {item.question}
                                                </p>

                                                <p className="text-sm font-medium text-gray-600">Answer:</p>
                                                <p className="text-base text-gray-800">
                                                    {item.applicant_answer || (
                                                        <span className="italic text-gray-400">No answer provided</span>
                                                    )}
                                                </p>
                                            </div>
                                        )) :
                                        <div>
                                            No interview questions available
                                        </div>
                                }
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    return (
        <div>
            <div className="w-full h-20">
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>List of candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="shadow-none">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Contact No</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((items, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{items.user.name}</TableCell>
                                        <TableCell>{items.user.email}</TableCell>
                                        <TableCell>{items.user.contact_no}</TableCell>
                                        <TableCell>{items?.interview?.status || 0}%</TableCell>
                                        <TableCell>
                                            {items?.available_documents}/{items?.total_documents}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                disabled={post.loading}
                                                onClick={() => passOrFail(items.user, "fail")}
                                                size="sm"
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                disabled={post.loading}
                                                onClick={() => passOrFail(items.user, "pass")}
                                                size="sm"
                                                variant="destructive"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedUser(items)}
                                            >
                                                View Profile
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Candidates;
