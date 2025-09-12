"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import axios from "axios";
import usePostAndPut from "@/hooks/usePostAndPut";
import LoadingButtton from "@/components/LoadingButtton";

type DocumentItem = {
    id: number;
    title: string;
    name: string;
    purpose: string;
    get: string;
    file?: File | null; 
};

const Documents = () => {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const get = useGetAndDelete(axios.get);
    const post = usePostAndPut(axios.post);
    const postDocument = usePostAndPut(axios.post);

    const getDocuments = () => {
        get.callApi("document/get", false, false)
            .then((res) => {
                if (res?.documents) {
                    setDocuments(
                        res.documents.map((doc: any) => ({
                            ...doc,
                            file: null,
                        }))
                    );
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    useEffect(() => {
        getDocuments();
    }, []);

    const handleFileChange = (id: number, file: File | null) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === id ? { ...doc, file } : doc
            )
        );
    };

    const handleSubmit = async () => {
        try {
            const data: {
                id: number;
                text: string;
                name: string;
                purpose: string;
                get: string;
                file_path: string;
            }[] = [];

            for (const doc of documents) {
                let extractedTexts: string = "";
                let filePath: string = "";

                if (doc.file) {
                    const formData = new FormData();
                    formData.append("file", doc.file);
                    formData.append("folder_name", doc.title.toLowerCase().replace(/\s+/g, "_"));
                    formData.append("get", doc.get);
                    const res = await postDocument.callApi(
                        "document/upload-file",
                        formData,
                        false,
                        true,
                        false
                    );

                    if (res?.data) {
                        extractedTexts = res.data.text;
                        filePath = res.data.file_path;
                    }
                }

                data.push({
                    id: doc.id,
                    name: doc.name,
                    purpose: doc.purpose,
                    get: doc.get,
                    text: extractedTexts,
                    file_path: filePath
                });
            }

            console.log("response:", data);

            await post.callApi("checklist/check-documents", { documents: data }, true, false, true);
        } catch (err) {
            console.error("Error submitting documents:", err);
        }
    };

    return (
        <div className="">
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>Submit the required documents</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {Object.entries(
                        documents.reduce((acc: Record<string, typeof documents>, doc) => {
                            if (!acc[doc.title]) acc[doc.title] = [];
                            acc[doc.title].push(doc);
                            return acc;
                        }, {})
                    ).map(([title, docs]) => (
                        <div key={title} className="space-y-4 border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

                            {docs.map((doc) => (
                                <div key={doc.id} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {doc.name}
                                    </label>

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            handleFileChange(
                                                doc.id,
                                                e.target.files?.[0] || null
                                            )
                                        }
                                        className="border p-2 rounded w-full"
                                    />
                                    {doc.file && (
                                        <p className="text-xs text-green-600">
                                            {doc.file.name}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </CardContent>

                <CardFooter>
                    {documents.length > 0 &&
                        (post.loading || postDocument.loading ? (
                            <LoadingButtton />
                        ) : (
                            <Button onClick={handleSubmit}>Submit</Button>
                        ))}
                </CardFooter>
            </Card>
        </div>
    );
};

export default Documents;
