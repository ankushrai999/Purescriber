import React from 'react'
import { LANGUAGES } from '../utils/presets' // Import the list of available languages

export default function Translation(props) {
    // Destructuring props to access the required values
    const { textElement, toLanguage, translating, setToLanguage, generateTranslation } = props

    return (
        <>
            {/* Display the textElement only if it exists and translation is not in progress */}
            {(textElement && !translating) && (
                <p>{textElement}</p>
            )}

            {/* Translation options form - shown only when translation is not in progress */}
            {!translating && (
                <div className='flex flex-col gap-1 mb-4'>
                    {/* Label for the language dropdown */}
                    <p className='text-xs sm:text-sm font-medium text-slate-500 mr-auto'>To language</p>
                    
                    {/* Language selection dropdown and translate button */}
                    <div className='flex items-stretch gap-2 sm:gap-4'>
                        {/* Dropdown for selecting the target language */}
                        <select 
                            value={toLanguage} 
                            className='flex-1 outline-none w-full focus:outline-none bg-white duration-200 p-2  rounded'
                            onChange={(e) => setToLanguage(e.target.value)} // Update selected language
                        >
                            {/* Default option */}
                            <option value={'Select language'}>Select language</option>
                            
                            {/* Dynamically generate options for each language */}
                            {Object.entries(LANGUAGES).map(([key, value]) => {
                                return (
                                    <option key={key} value={value}>{key}</option>
                                )
                            })}
                        </select>

                        {/* Button to trigger the translation process */}
                        <button 
                            onClick={generateTranslation} 
                            className='specialBtn px-3 py-2 rounded-lg text-red-600 hover:text-blue-600 duration-200'
                        >
                            Translate
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
