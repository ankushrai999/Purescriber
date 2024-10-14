import React from 'react'

// This component is responsible for displaying the transcribed text
export default function Transcription(props) {
    // Destructure the textElement from props, which contains the transcription text
    const { textElement } = props

    return (
        // Display the transcription text within a <div> element
        <div>{textElement}</div>
    )
}
