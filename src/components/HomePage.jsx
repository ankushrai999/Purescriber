import React, { useState, useEffect, useRef } from 'react' 


export default function HomePage(props) {
    const { setAudioStream, setFile } = props // Destructuring props to get setAudioStream and setFile functions

    // useState hook to manage the recording status (either 'inactive' or 'recording')
    const [recordingStatus, setRecordingStatus] = useState('inactive')

    // useState hook to store chunks of audio data during recording
    const [audioChunks, setAudioChunks] = useState([])

    // useState hook to track the duration of the recording
    const [duration, setDuration] = useState(0)

    // useRef to store the MediaRecorder instance, allowing interaction with it
    const mediaRecorder = useRef(null)

    // Defining the MIME type for the audio recording format
    const mimeType = 'audio/webm'

    // Function to start recording audio
    async function startRecording() {
        let tempStream
        console.log('Start recording') // Log to indicate recording has started

        try {
            // Access the microphone using navigator.mediaDevices.getUserMedia API
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false // We only need the audio stream
            })
            tempStream = streamData // Storing the stream data locally
        } catch (err) {
            console.log(err.message) // Log any errors encountered
            return // Exit the function in case of error
        }

        setRecordingStatus('recording') // Update the recording status to 'recording'

        // Create a new MediaRecorder instance using the obtained stream
        const media = new MediaRecorder(tempStream, { type: mimeType })
        mediaRecorder.current = media // Store the MediaRecorder instance in the ref

        mediaRecorder.current.start() // Start recording
        let localAudioChunks = [] // Temporary array to store audio chunks

        // Event listener for when there is available data (audio) during recording
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') { return } // Ignore if no data
            if (event.data.size === 0) { return } // Ignore empty data
            localAudioChunks.push(event.data) // Push the available data to the array
        }

        // Set the audio chunks in the state
        setAudioChunks(localAudioChunks)
    }

    // Function to stop recording audio
    async function stopRecording() {
        setRecordingStatus('inactive') // Update the recording status to 'inactive'
        console.log('Stop recording') // Log to indicate recording has stopped

        mediaRecorder.current.stop() // Stop the media recording

        // When the recording stops, create a Blob from the audio chunks and update the audio stream
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType }) // Create a Blob from the recorded chunks
            setAudioStream(audioBlob) // Pass the audio blob to the parent component
            setAudioChunks([]) // Clear the audio chunks state
            setDuration(0) // Reset the duration timer
        }
    }

    // useEffect hook to manage the timer for recording duration
    useEffect(() => {
        // If the recording status is inactive, exit early
        if (recordingStatus === 'inactive') { return }

        // Set up an interval that increments the duration by 1 second every 1000ms (1 second)
        const interval = setInterval(() => {
            setDuration(curr => curr + 1) // Increment the duration
        }, 1000)

        // Cleanup function to clear the interval when the component unmounts or status changes
        return () => clearInterval(interval)
    })

    // JSX for rendering the homepage component
    return (
        <main className='flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20'>
            {/* Heading section */}
            <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>
                Pure<span className='text-purple-600 bold'>Scriber</span>
            </h1>

            {/* Subheading to describe the process */}
            <h3 className='font-medium md:text-lg'>
                Record <span className='text-red-400'>&rarr;</span> Transcribe <span className='text-red-400'>&rarr;</span> Translate
            </h3>

            {/* Record/Stop button based on the current recording status */}
            <button 
                onClick={recordingStatus === 'recording' ? stopRecording : startRecording} 
                className='flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'>
                <p className='text-red-600'>
                    {recordingStatus === 'inactive' ? 'Record' : `Stop recording`} {/* Display appropriate text based on status */}
                </p>
                <div className='flex items-center gap-2'>
                    {/* Microphone icon that turns red when recording */}
                    <i className={"fa-solid duration-200 fa-microphone " + (recordingStatus === 'recording' ? ' text-rose-600' : "")}></i>
                </div>
            </button>

            {/* File upload option for mp3 or wave files */}
            <p className='text-base'>
                Or <label className='text-red-600 cursor-pointer hover:text-purpel-600 duration-200'>
                    upload <input 
                        onChange={(e) => {
                            const tempFile = e.target.files[0] // Get the uploaded file
                            setFile(tempFile) // Pass the file to the parent component
                        }} 
                        className='hidden' 
                        type='file' 
                        accept='.mp3,.wave' 
                    />
                </label> a mp3 file
            </p>

            {/* Footer text */}
            <p className='text-slate-500 bold'>Free now free forever</p>
        </main>
    )
}
