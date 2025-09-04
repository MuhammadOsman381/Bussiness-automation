"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import usePostAndPut from "@/hooks/usePostAndPut";
import axios from "axios";
import LoadingButtton from "@/components/LoadingButtton";
import { useNavigate } from "react-router-dom";

const CreateJob = () => {
  const defaultJobData = {
    id: 0,
    title: "",
    description: "",
    time: "",
  };

  const defaultFormFields = [
    { name: "Full Name", type: "text" },
    { name: "Email", type: "email" },
    { name: "Phone Number", type: "text" },
  ];

  const [jobData, setJobData] = useState(defaultJobData);
  const [fields, setFields] = useState<{ name: string; type: string }[]>(defaultFormFields);

  const job = usePostAndPut(axios.post)
  const navigate  = useNavigate()

  const addField = () => {
    setFields([...fields, { name: "", type: "text" }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: string) => {
    const updated = [...fields];
    updated[index][key as keyof (typeof updated)[0]] = value;
    setFields(updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setJobData((prev) => ({ ...prev, [id]: value }));
  };


  const handleSubmit = async () => {
    const payload = { ...jobData, fields };
    console.log(payload)
    await job.callApi(
      "job/create-or-edit",
      payload,
      true,
      false,
      true
    );
    setJobData(defaultJobData);
    setFields(defaultFormFields);
    navigate('/recruiter/jobs')
  };


  return (
    <>
      <div className="w-full mx-auto  space-y-3">
        <Card className="w-full  shadow-none">
          <CardHeader>
            <CardTitle>Create job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 mb-5">
              <Label>Job Title</Label>
              <Input
                id="title"
                value={jobData.title}
                placeholder="job title..."
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2 mb-5">
              <Label>Job Description</Label>



              <CKEditor
                editor={ClassicEditor as any}
                data={jobData.description}
                onChange={(event, editor) => {
                  const content = editor.getData();
                  setJobData((prev) => ({ ...prev, description: content }));
                }}
                onReady={(editor) => {
                  console.log("Editor is ready!", editor);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={jobData.time}
                onValueChange={(value) =>
                  setJobData((prev) => ({ ...prev, time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-xl border space-y-3" >
              <div className="text-md font-semibold" >Application Form Data</div>
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="grid lg:grid-cols-3 grid-cols-2 gap-4 items-end"
                >
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Write field name here..."
                      value={field.name}
                      onChange={(e) => updateField(index, "name", e.target.value)}
                    />
                  </div>

                  <div className="space-x-1 flex flex-row items-end justify-start gap-2">
                    <div className="space-y-2" >
                      <Label>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addField}>
                <Plus />
              </Button>
            </div>

            <CardFooter className="p-0 " >
              {
                job.loading ?
                  <LoadingButtton /> :
                  <Button onClick={handleSubmit}>Submit</Button>
              }
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreateJob;
