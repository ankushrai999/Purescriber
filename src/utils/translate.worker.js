import { pipeline } from '@xenova/transformers';

// Class to manage the translation pipeline using a specific model
class MyTranslationPipeline {
    // Define the task and model for translation
    static task = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    // Singleton instance of the pipeline
    static instance = null;

    // Method to get or create an instance of the translation pipeline
    static async getInstance(progress_callback = null) {
        // Check if the instance already exists
        if (this.instance === null) {
            // Create a new pipeline instance if it doesn't exist
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }

        // Return the existing or newly created instance
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Get the translator instance and provide a progress callback
    let translator = await MyTranslationPipeline.getInstance(x => {
        // Send progress updates back to the main thread
        self.postMessage(x)
    });

    // Log the incoming message data (which contains text to be translated)
    console.log(event.data);

    // Perform the translation using the translator instance
    let output = await translator(event.data.text, {
        tgt_lang: event.data.tgt_lang, // Target language for translation
        src_lang: event.data.src_lang, // Source language for translation

        // Callback function to handle updates during translation
        callback_function: x => {
            // Send updates back to the main thread
            self.postMessage({
                status: 'update',
                // Decode the output tokens into a readable string
                output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
            });
        }
    });

    // Log the final translation output
    console.log('HEHEHHERERE', output);

    // Send the completed translation result back to the main thread
    self.postMessage({
        status: 'complete',
        output
    });
});
