import React from 'react'

export default function Transcribing(props) {
    const { downloading } = props  // Prop to track if the downloading process is active

    return (
        <div className='flex items-center flex-1 flex-col justify-center gap-10 md:gap-14 text-center pb-24 p-4'>
            {/* Container for the title and the status message */}
            <div className='flex flex-col gap-2 sm:gap-4'>
                {/* Main heading */}
                <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl'>
                    <span className='text-purple-600 bold'>Transcribing</span>
                </h1>
                {/* Display different messages based on the downloading status */}
                <p>
                    {!downloading ? 'warming up cylinders' : 'core cylinders engaged'}
                </p>
            </div>

            {/* Progress indicators (three loading bars) */}
            <div className='flex flex-col gap-2 sm:gap-3 max-w-[400px] mx-auto w-full'>
                {/* Create three loading bars using the map function */}
                {[0, 1, 2].map(val => {
                    return (
                        // Each loading bar is a div with a unique key, and the class 'loading' + index for animation
                        <div key={val} className={'rounded-full h-2 sm:h-3 bg-red-500 loading ' + `loading${val}`}></div>
                    )
                })}
            </div>
        </div>
    )
}
