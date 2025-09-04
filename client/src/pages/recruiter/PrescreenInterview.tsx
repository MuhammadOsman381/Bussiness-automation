import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import usePostAndPut from "@/hooks/usePostAndPut";
import axios from "axios";
import useGetAndDelete from "@/hooks/useGetAndDelete";
import { FaRegEdit } from "react-icons/fa";
import { ImBin } from "react-icons/im";

const PrescreenInterview = () => {
    const [question, setQuestion] = useState("");
    const [expectedOutput, setExpectedOutput] = useState("");
    const [entries, setEntries] = useState<{ id: string, question: string; expected_output: string }[]>([]);
    const [editingId, setEditingId] = useState<number>(0);


    const post = usePostAndPut(axios.post)
    const get = useGetAndDelete(axios.get)
    const deleteQuestion = useGetAndDelete(axios.delete)


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ question, expectedOutput, editingId });
        await post.callApi(
            "interview/create",
            { question: question, expectedAnswer: expectedOutput, id: editingId },
            false,
            false,
            false,
        );
        getQuestions();
        setQuestion("");
        setExpectedOutput("");
        setEditingId(0);
    };


    const getQuestions = () => {
        get.callApi('interview/get_questions', false, false).then((res) => {
            if (res?.questions) {
                setEntries(res.questions)
            }
        }).catch((err) => {
            console.error("Error fetching questions:", err);
        });
    }

    useEffect(() => {
        getQuestions()
    }, [])

    return (
        <div className="w-full mx-auto  space-y-3">
            <Card className="shadow-none" >
                <CardHeader>
                    <CardTitle>Prescreen Interview</CardTitle>
                    <CardDescription>Add questions and their expected outputs</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="question">Question</Label>
                            <Input
                                id="question"
                                placeholder="Enter a question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="expectedOutput">Expected Output</Label>
                            <Input
                                id="expectedOutput"
                                placeholder="Enter expected output"
                                value={expectedOutput}
                                onChange={(e) => setExpectedOutput(e.target.value)}
                            />
                        </div>

                        <Button type="submit">
                            {editingId === 0 ? "Add Question" : "Update Question"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {entries.length > 0 && (
                <Card className="shadow-none" >
                    <CardHeader>
                        <CardTitle>Submitted Questions</CardTitle>
                        <CardDescription>List of all added questions</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Expected Output</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{entry.question}</TableCell>
                                        <TableCell>{entry.expected_output}</TableCell>
                                        <TableCell className="flex gap-2 text-2xl" >
                                            <FaRegEdit
                                                className="text-blue-600 cursor-pointer"
                                                onClick={() => {
                                                    setQuestion(entry.question);
                                                    setExpectedOutput(entry.expected_output);
                                                    setEditingId(Number(entry.id));
                                                }}
                                            />
                                            <ImBin
                                                onClick={() => {
                                                    deleteQuestion.callApi(`interview/delete_question/${entry.id}`, false, false).then(() => {
                                                        getQuestions()
                                                    }).catch((err) => {
                                                        console.error("Error deleting question:", err);
                                                    })
                                                }}
                                                className="text-red-600" />
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

export default PrescreenInterview;
