import React, { useState, useEffect, useRef } from 'react'
import Transcription from './Transcription'
import Translation from './Translation'

export default function Information(props) {
    const { output, finished } = props
    const [tab, setTab] = useState('transcription')  // State to track current tab (transcription/translation)
    const [translation, setTranslation] = useState(null)  // State to hold translation data
    const [toLanguage, setToLanguage] = useState('Select language')  // State for target language
    const [translating, setTranslating] = useState(null)  // State to show whether translation is in progress
    console.log(output)  // Logs the output data for debugging

    const worker = useRef()  // Use ref to store the worker instance

    useEffect(() => {
        // Create a new worker if not already created
        if (!worker.current) {
            worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
                type: 'module'
            })
        }

        // Handler function to process messages from the worker
        const onMessageReceived = async (e) => {
            switch (e.data.status) {
                case 'initiate':
                    console.log('DOWNLOADING')  // Worker has started the translation process
                    break;
                case 'progress':
                    console.log('LOADING')  // Translation is in progress
                    break;
                case 'update':
                    setTranslation(e.data.output)  // Update the translation data when available
                    console.log(e.data.output)
                    break;
                case 'complete':
                    setTranslating(false)  // Translation is complete, update the state
                    console.log("DONE")
                    break;
            }
        }

        // Add an event listener to handle messages from the worker
        worker.current.addEventListener('message', onMessageReceived)

        // Cleanup the event listener when the component unmounts
        return () => worker.current.removeEventListener('message', onMessageReceived)
    })

    // Decide what text to show based on the selected tab (transcription/translation)
    const textElement = tab === 'transcription' ? output.map(val => val.text) : translation || ''

    // Function to copy the transcription/translation text to the clipboard
    function handleCopy() {
        navigator.clipboard.writeText(textElement)
    }

    // Function to download the transcription/translation as a .txt file
    function handleDownload() {
        const element = document.createElement("a")
        const file = new Blob([textElement], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `Freescribe_${new Date().toString()}.txt`  // Give the file a unique name based on the current date
        document.body.appendChild(element)
        element.click()
    }

    // Function to trigger translation using the web worker
    function generateTranslation() {
        if (translating || toLanguage === 'Select language') {
            return  // Don't initiate translation if it's already in progress or no language is selected
        }

        setTranslating(true)  // Set the translating state to true

        // Send the transcription data and language details to the worker for translation
        worker.current.postMessage({
            text: output.map(val => val.text),  // Text to translate
            src_lang: 'eng_Latn',  // Source language
            tgt_lang: toLanguage  // Target language selected by the user
        })
    }

    return (
        <main className='flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>
            {/* Main title */}
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>
                Your <span className='text-purple-600 bold'>Transcription</span>
            </h1>

            {/* Tabs for selecting Transcription or Translation */}
            <div className='grid grid-cols-2 sm:mx-auto bg-white rounded overflow-hidden items-center p-1 purpleShadow border-[2px] border-solid border-purple-400'>
                {/* Transcription tab */}
                <button onClick={() => setTab('transcription')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'transcription' ? ' bg-purple-400 text-white' : ' text-purple-500 hover:text-purple-600')}>
                    Transcription
                </button>
                {/* Translation tab */}
                <button onClick={() => setTab('translation')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'translation' ? ' bg-purple-400 text-white' : ' text-purple-500 hover:text-purple-600')}>
                    Translation
                </button>
            </div>

            {/* Content area for transcription or translation based on selected tab */}
            <div className='my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {/* Show loading spinner if translation is in progress or output is not finished */}
                {(!finished || translating) && (
                    <div className='grid place-items-center'>
                        <i className="fa-solid fa-spinner animate-spin"></i>  {/* Spinner icon */}
                    </div>
                )}
                {/* Show transcription if the transcription tab is active */}
                {tab === 'transcription' ? (
                    <Transcription {...props} textElement={textElement} />
                ) : (
                    <Translation
                        {...props}
                        toLanguage={toLanguage}
                        translating={translating}
                        textElement={textElement}
                        setTranslating={setTranslating}
                        setTranslation={setTranslation}
                        setToLanguage={setToLanguage}
                        generateTranslation={generateTranslation}  // Function to start translation
                    />
                )}
            </div>

            {/* Buttons for copying and downloading the transcription/translation */}
            <div className='flex items-center gap-4 mx-auto'>
                {/* Copy button */}
                <button onClick={handleCopy} title="Copy" className='bg-white hover:text-blue-500 duration-200 text-purple-600 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-copy"></i>  {/* Copy icon */}
                </button>
                {/* Download button */}
                <button onClick={handleDownload} title="Download" className='bg-white hover:text-blue-600 duration-200 text--300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-download"></i>  {/* Download icon */}
                </button>
            </div>
        </main>
    )
}
