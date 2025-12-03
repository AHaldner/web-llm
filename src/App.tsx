import { createSignal, onMount, onCleanup, type Component } from 'solid-js';

const App: Component = () => {
    const [status, setStatus] = createSignal<string>('ready');
    const [progress, setProgress] = createSignal<number>(0);
    const [inputText, setInputText] = createSignal('Describe the future of AI');
    const [generatedText, setGeneratedText] = createSignal('');

    let worker: Worker | undefined;

    onMount(() => {
        worker = new Worker(new URL('./worker.ts', import.meta.url), {
            type: 'module',
        });

        worker.addEventListener('message', (event) => {
            const { type } = event.data;

            switch (type) {
                case 'progress':
                    setStatus('loading');
                    const p = event.data.progress;
                    if (p.status === 'progress') {
                        setProgress(p.progress);
                    }
                    break;

                case 'update':
                    setStatus('generating');
                    setGeneratedText((prev) => prev + event.data.text);
                    break;

                case 'complete':
                    setStatus('ready');
                    setProgress(0);
                    break;
            }
        });
    });

    onCleanup(() => {
        worker?.terminate();
    });

    const handleGenerate = () => {
        if (!worker) return;

        setGeneratedText('');
        setProgress(0);
        setStatus('loading');

        worker.postMessage({
            type: 'generate',
            text: inputText(),
            max_new_tokens: 128,
        });
    };

    return (
        <div class="min-h-screen bg-slate-800 text-white p-8 flex flex-col items-center">
            <h1 class="text-3xl font-bold mb-8 text-blue-400">
                WebGPU Text Generation with Streaming
            </h1>
            <div class="w-full max-w-2xl space-y-6">
                <div class="flex flex-col gap-2">
                    <label class="text-sm text-gray-400">Prompt</label>
                    <textarea
                        class="w-full p-4 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 outline-none resize-none h-32"
                        value={inputText()}
                        onInput={(e) => setInputText(e.currentTarget.value)}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={status() !== 'ready'}
                        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium transition-colors self-end"
                    >
                        {status() === 'ready' ? 'Generate' : 'Processing...'}
                    </button>
                </div>
                {status() === 'loading' && (
                    <div class="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                            class="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress()}%` }}
                        ></div>
                        <p class="text-xs text-slate-400 mt-1 text-center">
                            Loading Model: {Math.round(progress())}%
                        </p>
                    </div>
                )}
                {(generatedText() || status() === 'generating') && (
                    <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                        <h2 class="text-sm text-slate-400 mb-2">Output</h2>
                        <p class="whitespace-pre-wrap leading-relaxed text-slate-200">
                            {generatedText()}
                            {status() === 'generating' && (
                                <span class="inline-block w-2 h-2 ml-1 bg-blue-500 rounded-full animate-pulse" />
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
