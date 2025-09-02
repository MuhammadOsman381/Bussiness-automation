import SpinLoader from "./SpinLoader"
import { Button } from "./ui/button"

const LoadingButtton = () => {
    return (
        <Button disabled type="submit" >
            <div>
                Please wait
            </div>
            <SpinLoader />
        </Button>
    )
}

export default LoadingButtton