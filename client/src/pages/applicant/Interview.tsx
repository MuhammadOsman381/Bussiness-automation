import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import usePostAndPut from "@/hooks/usePostAndPut"
import { Button } from "@/components/ui/button"
import { FiSend } from "react-icons/fi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Loader from "@/components/Loader"
import LoadingButtton from "@/components/LoadingButtton"

const Interview = () => {
  const { jobId } = useParams()
  const [questions, setQuestions] = useState<{ question: string; explanation: string }[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [qaList, setQaList] = useState<any>([])
  const [showDialog, setShowDialog] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false) // 👈 NEW

  const navigate = useNavigate()

  const interview = usePostAndPut(axios.post)
  const postInterview = usePostAndPut(axios.post)

  const generateQuestions = async () => {
    const response = await interview.callApi(
      `interview/generate/${jobId}`,
      {},
      true,
      false,
      false
    )
    setQuestions(response?.data?.questions?.questions || null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAnswer.trim() || questions?.length === 0) return

    const currentQuestion = questions[0]
    setQaList((prev: any) => [
      ...prev,
      { question: currentQuestion?.question, answer: currentAnswer },
    ])
    setCurrentAnswer("")
    setIsGenerating(true)
    setTimeout(() => {
      setQuestions((prev) => prev.slice(1))
      setIsGenerating(false)
    }, 3000)
  }

  
  useEffect(() => {
    if (questions?.length === 0 && qaList?.length > 0 && !isGenerating) {
      setShowDialog(true)
    }
  }, [questions, qaList, isGenerating])

  useEffect(() => {
    generateQuestions()
  }, [jobId])

  return (
    <>
      {interview.loading ? (
        <div className="w-full flex items-center justify-center">
          <Loader />
        </div>
      ) : questions !== null ? (
        <div className="flex items-center justify-center w-full  min-h-[89vh]">

          <form onSubmit={handleSubmit} className="h-full max-w-5xl w-full flex flex-col">
            <div className="w-full mx-auto rounded-lg bg-white h-full flex flex-col flex-1 p-4">

              <div className="scrollbar-hide  flex-1 overflow-y-auto max-h-[74vh] space-y-4 p-2">

                {qaList?.map((qa: any, index: any) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <div className="self-start rounded-r-lg rounded-t-lg bg-zinc-100 p-3 max-w-[70%]">
                      {qa.question}
                    </div>
                    <div className="self-end bg-gradient-to-tr from-[#484f98] to-[#1a237e] text-white rounded-l-lg rounded-t-lg p-3 max-w-[70%]">
                      {qa.answer}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="self-start flex items-center gap-2 bg-gray-200 p-3 rounded-lg max-w-[70%] text-gray-500 italic">
                    <span>please wait</span>
                    <svg
                      className="animate-spin h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                  </div>
                )}

                {!isGenerating && questions?.length > 0 && (
                  <div className="self-start bg-zinc-100 p-3 rounded-r-lg rounded-t-lg max-w-[70%]">
                    {questions[0].question}
                  </div>
                )}
              </div>
            </div>


            {questions?.length > 0 && (
              <div className="w-full mx-auto mt-4">
                <div className="flex gap-2 items-center border border-gray-300 p-2 rounded-full bg-white">
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Answer the question here..."
                    className="flex-1 border-none rounded px-3 py-2 focus:outline-none bg-transparent"
                  />
                  <Button
                    type="submit"
                    disabled={currentAnswer === "" || isGenerating}
                    className="rounded-full"
                    size="icon"
                  >
                    <FiSend size={24} />
                  </Button>
                </div>
              </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Prescreen Interview</DialogTitle>
                  <DialogDescription>
                    You’ve answered all questions. Do you want to submit your answers?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  {postInterview.loading ? (
                    <LoadingButtton />
                  ) : (
                    <Button
                      onClick={async () => {
                        await postInterview.callApi(
                          `interview/check-answers/${jobId}`,
                          { qaList: qaList },
                          true,
                          false,
                          true
                        )
                        navigate("/applicant/jobs")
                        setShowDialog(false)
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
        </div>
      ) : (
        <div className="text-lg font-semibold text-black">
          The interview cannot be conducted at this moment.
        </div>
      )}
    </>
  )
}

export default Interview
