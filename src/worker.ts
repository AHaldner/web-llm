import {
    pipeline,
    TextStreamer,
    type TextGenerationPipeline,
    type ProgressCallback,
    env,
} from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

class TextGeneratorPipeline {
    static model = 'onnx-community/granite-4.0-350m-ONNX';
    static instance: TextGenerationPipeline | null = null;

    static async getInstance(progress_callback?: ProgressCallback) {
        if (this.instance === null) {
            this.instance = await (
                pipeline as (
                    task: 'text-generation',
                    model: string,
                    options: {
                        device: string;
                        dtype: string;
                        progress_callback?: ProgressCallback;
                    },
                ) => Promise<TextGenerationPipeline>
            )('text-generation', this.model, {
                device: 'webgpu',
                dtype: 'fp16',
                progress_callback,
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, text } = event.data;

    if (type !== 'generate') return;

    try {
        const generator = await TextGeneratorPipeline.getInstance(
            (progress) => {
                self.postMessage({ type: 'progress', progress });
            },
        );

        const messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: text },
        ];

        const streamer = new TextStreamer(generator.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: (tokenText: string) => {
                self.postMessage({ type: 'update', text: tokenText });
            },
        });

        const output = await generator(messages, {
            max_new_tokens: 512,
            do_sample: false,
            streamer,
        });

        self.postMessage({ type: 'complete', output });
    } catch (error: any) {
        self.postMessage({ type: 'error', error: error.message });
    }
});
