import React, { useRef, useEffect } from 'react' // Importing necessary React hooks: useRef and useEffect

// Functional component to display a file, especially audio, with options to reset and submit.
export default function FileDisplay(props) {
    // Destructuring props to extract required values: handleAudioReset, file, audioStream, and handleFormSubmission
    const { handleAudioReset, file, audioStream, handleFormSubmission } = props

    // Creating a reference to the <audio> element, allowing us to interact with it directly
    const audioRef = useRef()

    // useEffect hook to handle changes in either 'file' or 'audioStream'
    useEffect(() => {
        
        if (!file && !audioStream) { return }

        if (file) {
            console.log('HERE FILE', file) // Logs the file information for debugging
            audioRef.current.src = URL.createObjectURL(file) // Create a blob URL for the file and set as audio source
        } 
        else {
            console.log('EHER AUDIO', audioStream) // Logs the audioStream information for debugging
            audioRef.current.src = URL.createObjectURL(audioStream) // Create a blob URL for the audioStream and set as audio source
        }
    }, [audioStream, file]) // This effect runs when either 'audioStream' or 'file' changes

    // Returning the JSX for rendering the component
    return (
        <main className='flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 w-full max-w-prose mx-auto'>
            {/* Heading for the file display */}
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl'>
                Your <span className='text-purple-600 bold'>File</span>
            </h1>

            {/* Displaying file name or custom text if no file is present */}
            <div className='flex flex-col text-left my-4'>
                <h3 className='text-red-500 font-semibold'>Name</h3>
                <p className='truncate'>{file ? file?.name : 'Custom audio'}</p> {/* Conditional rendering for file name */}
            </div>

            {/* Audio player for playing the file/audioStream */}
            <div className='flex flex-col mb-2'>
                <audio ref={audioRef} className='w-full' controls>
                    Your browser does not support the audio element. {/* Fallback text for browsers without audio support */}
                </audio>
            </div>

            {/* Buttons for resetting the audio and submitting the form */}
            <div className='flex items-center justify-between gap-4'>
                {/* Reset button that triggers the handleAudioReset function */}
                <button onClick={handleAudioReset} className='text-red-600 bold hover:text-purple-600 duration-200'>
                    Reset
                </button>

                {/* Submit button that triggers the handleFormSubmission function */}
                <button onClick={handleFormSubmission} className='specialBtn px-3 p-2 rounded-lg text-purple-800 flex items-center gap-2 font-medium hover:text-blue-600 duration-200'>
                    <p>Transcribe</p>
                    <i className="fa-solid fa-pen-nib"></i> {/* Icon for the button */}
                </button>
            </div>
        </main>
    )
}
