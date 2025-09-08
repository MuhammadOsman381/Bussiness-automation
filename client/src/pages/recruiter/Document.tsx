"use client";
import { useState, type FormEvent, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import usePostAndPut from "@/hooks/usePostAndPut";
import axios from "axios";
import useGetAndDelete from "@/hooks/useGetAndDelete";

type DocumentItem = {
    id: number;
    title: string;
    name: string;
    purpose: string;
    total_files: string;
    get: string; // stored as "text,object"
};

const Document = () => {
    const [title, setTitle] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [purpose, setPurpose] = useState<string>("");
    const [getTypes, setGetTypes] = useState<string>(""); // single string
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [id, setId] = useState<number>(0);

    const postAndPut = usePostAndPut(axios.post);
    const get = useGetAndDelete(axios.get);
    const deletee = useGetAndDelete(axios.delete);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = { title, name, purpose, get: getTypes };

        postAndPut
            .callApi(`document/create-or-edit/${id}`, payload, false, false, false)
            .then(() => {
                getDocuments();
            });

        setTitle("");
        setName("");
        setPurpose("");
        setGetTypes("");
        setId(0);
    };

    const getDocuments = () => {
        get.callApi("document/get", false, false)
            .then((res) => {
                if (res?.documents) {
                    setDocuments(res.documents);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    useEffect(() => {
        getDocuments();
    }, []);

    return (
        <div className="w-full mx-auto space-y-6">
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>Create Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <Input
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Document Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter document name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Requirements
                            </label>
                            <Textarea
                                placeholder="Enter requirements"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Get</label>
                            <Select
                                value={getTypes}
                                onValueChange={(value) => setGetTypes(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit">Submit</Button>
                    </form>
                </CardContent>
            </Card>

            {documents.length > 0 && (
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Documents List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Document Name</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Get</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{doc.title}</TableCell>
                                        <TableCell>{doc.name}</TableCell>
                                        <TableCell className="max-w-xl whitespace-normal break-words">
                                            {doc.purpose}
                                        </TableCell>
                                        <TableCell>{doc.get}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setId(doc.id);
                                                    setTitle(doc.title);
                                                    setName(doc.name);
                                                    setPurpose(doc.purpose);
                                                    setGetTypes(doc.get);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    deletee
                                                        .callApi(`document/delete/${doc.id}`, false, false)
                                                        .then(() => {
                                                            getDocuments();
                                                        });
                                                }}
                                                size="sm"
                                                variant="destructive"
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Document;
