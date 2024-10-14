import { pipeline } from '@xenova/transformers'; // Importing the pipeline function from the transformers library
import { MessageTypes } from './presets'; // Importing message types for communication

// Class to manage the transcription pipeline for automatic speech recognition
class MyTranscriptionPipeline {
    // Define the task type and model to use for transcription
    static task = 'automatic-speech-recognition';
    static model = 'openai/whisper-tiny.en';
    // Singleton instance of the pipeline
    static instance = null;

    // Method to get or create an instance of the transcription pipeline
    static async getInstance(progress_callback = null) {
        // Check if an instance already exists
        if (this.instance === null) {
            // Create a new pipeline instance if it doesn't exist
            this.instance = await pipeline(this.task, null, { progress_callback });
        }

        // Return the existing or newly created instance
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, audio } = event.data; // Destructure the message data
    // Check if the message is a request for inference
    if (type === MessageTypes.INFERENCE_REQUEST) {
        await transcribe(audio); // Call the transcribe function with the audio data
    }
});

// Function to handle audio transcription
async function transcribe(audio) {
    sendLoadingMessage('loading'); // Notify that loading has started

    let pipeline; // Variable to hold the transcription pipeline

    try {
        // Get the transcription pipeline instance and set up progress callback
        pipeline = await MyTranscriptionPipeline.getInstance(load_model_callback);
    } catch (err) {
        console.log(err.message); // Log any error that occurs
    }

    sendLoadingMessage('success'); // Notify that loading was successful

    const stride_length_s = 5; // Define the stride length in seconds

    // Create a new generation tracker to manage the transcription process
    const generationTracker = new GenerationTracker(pipeline, stride_length_s);
    await pipeline(audio, {
        top_k: 0, // Set the top-k parameter for sampling
        do_sample: false, // Disable sampling
        chunk_length: 30, // Set the length of each chunk
        stride_length: stride_length_s, // Set the stride length for processing
        return_timestamps: true, // Request timestamps for the transcription
        callback_function: generationTracker.callbackFunction.bind(generationTracker), // Bind the callback function for output
        chunk_callback: generationTracker.chunkCallback.bind(generationTracker) // Bind the chunk callback function
    });
    generationTracker.sendFinalResult(); // Send the final result when done
}

// Callback function for loading model progress
async function load_model_callback(data) {
    const { status } = data; // Destructure the status from data
    // Check if the status is progress
    if (status === 'progress') {
        const { file, progress, loaded, total } = data; // Destructure relevant fields from data
        sendDownloadingMessage(file, progress, loaded, total); // Notify about downloading progress
    }
}

// Function to send loading status messages to the main thread
function sendLoadingMessage(status) {
    self.postMessage({
        type: MessageTypes.LOADING,
        status
    });
}

// Function to send downloading progress messages to the main thread
async function sendDownloadingMessage(file, progress, loaded, total) {
    self.postMessage({
        type: MessageTypes.DOWNLOADING,
        file,
        progress,
        loaded,
        total
    });
}

// Class to track the generation of transcriptions
class GenerationTracker {
    constructor(pipeline, stride_length_s) {
        this.pipeline = pipeline; // Store the pipeline instance
        this.stride_length_s = stride_length_s; // Store the stride length
        this.chunks = []; // Array to hold chunks of audio
        // Calculate time precision based on the processor configuration
        this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions;
        this.processed_chunks = []; // Array to hold processed chunks
        this.callbackFunctionCounter = 0; // Counter for callback function calls
    }

    // Method to send the final result message
    sendFinalResult() {
        self.postMessage({ type: MessageTypes.INFERENCE_DONE });
    }

    // Callback function for processing transcription beams
    callbackFunction(beams) {
        this.callbackFunctionCounter += 1; // Increment the counter
        // Only process every 10th call to reduce frequency
        if (this.callbackFunctionCounter % 10 !== 0) {
            return;
        }

        const bestBeam = beams[0]; // Get the best beam from the output
        let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
            skip_special_tokens: true // Decode without special tokens
        });

        const result = {
            text,
            start: this.getLastChunkTimestamp(), // Get the timestamp for the start of the last chunk
            end: undefined // End timestamp is undefined initially
        };

        createPartialResultMessage(result); // Create a partial result message
    }

    // Callback function for processing audio chunks
    chunkCallback(data) {
        this.chunks.push(data); // Add the new chunk to the chunks array
        const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(
            this.chunks, // Decode the accumulated chunks
            {
                time_precision: this.time_precision,
                return_timestamps: true,
                force_full_sequence: false // Do not force full sequence decoding
            }
        );

        // Process each chunk and store results
        this.processed_chunks = chunks.map((chunk, index) => {
            return this.processChunk(chunk, index); // Process the individual chunk
        });

        // Create a result message with the processed chunks
        createResultMessage(
            this.processed_chunks, false, this.getLastChunkTimestamp()
        );
    }

    // Get the timestamp for the last processed chunk
    getLastChunkTimestamp() {
        if (this.processed_chunks.length === 0) {
            return 0; // Return 0 if there are no processed chunks
        }
    }

    // Process a chunk to extract relevant information
    processChunk(chunk, index) {
        const { text, timestamp } = chunk; // Destructure the chunk data
        const [start, end] = timestamp; // Destructure start and end timestamps

        return {
            index,
            text: `${text.trim()}`, // Trim the text and prepare the result
            start: Math.round(start), // Round the start timestamp
            end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s) // Round end timestamp or calculate based on start
        };
    }
}

// Function to create and send a result message for completed transcriptions
function createResultMessage(results, isDone, completedUntilTimestamp) {
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimestamp
    });
}

// Function to create and send a partial result message during transcription
function createPartialResultMessage(result) {
    self.postMessage({
        type: MessageTypes.RESULT_PARTIAL,
        result
    });
}
