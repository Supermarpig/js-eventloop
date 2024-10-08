'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, ArrowBigRight, Play, Pause, Square } from 'lucide-react';
import CodeEditor from './CodeEditor';
import LogDisplay from './LogDisplay';
import CallStackDisplay from './CallStackDisplay';
import WebApisDisplay from './WebApisDisplay';
import QueueDisplay from './QueueDisplay';
import HeapDisplay from './HeapDisplay';
import { useEventLoop } from '../hooks/useEventLoop';

const EventLoopVisualizer: React.FC = () => {
    const {
        code,
        setCode,
        stack,
        queue,
        microTaskQueue,
        log,
        webApis,
        isRunning,
        isPaused,
        isSpinning,
        isComplete,
        currentStep,
        steps,
        currentLine,
        heap,
        executeCode,
        nextStep,
        prevStep,
        togglePause,
        stopExecution 
    } = useEventLoop();

    return (
        <div className="flex flex-col h-full p-4 bg-gray-900 text-white overflow-y-auto">
            <div className="flex mb-4">
                <Button onClick={executeCode} disabled={isRunning} className="mr-2">
                    <Play className="mr-2 h-4 w-4" /> Run Code
                </Button>
                <Button onClick={prevStep} disabled={!isRunning || currentStep === 0} className="mr-2">
                    <ArrowBigLeft className="mr-2 h-4 w-4" /> Previous Step
                </Button>
                <Button onClick={nextStep} disabled={!isRunning || currentStep === steps.length}>
                    <ArrowBigRight className="mr-2 h-4 w-4" /> Next Step
                </Button>
                <Button onClick={togglePause} disabled={!isRunning} className="mr-2">
                    {isPaused ? (
                        <>
                            <Play className="mr-2 h-4 w-4" /> Resume
                        </>
                    ) : (
                        <>
                            <Pause className="mr-2 h-4 w-4" /> Pause
                        </>
                    )}
                </Button>
                <Button onClick={stopExecution} disabled={!isRunning} className="mr-2">
                    <Square className="mr-2 h-4 w-4" /> Stop
                </Button>
            </div>
            <div className="flex h-[calc(100%_-_52px)]">
                <div className="w-1/3 pr-4 flex flex-col gap-4 h-full">
                    <CodeEditor code={code} setCode={setCode} currentLine={currentLine} isComplete={isComplete} />
                    <LogDisplay log={log} />
                </div>
                <div className="w-2/3 flex flex-wrap gap-4 h-full">
                    <div className="min-w-[calc(50%-8px)] flex-grow h-[calc(36%_-_32px)]">
                        <CallStackDisplay stack={stack} />
                    </div>
                    <div className="min-w-[calc(50%-8px)] flex-grow h-[calc(36%_-_32px)]">
                        <WebApisDisplay webApis={webApis} />
                    </div>
                    <div className="min-w-[calc(50%-8px)] flex-grow h-[calc(36%_-_32px)]">
                        <QueueDisplay title="Callback Queue (Macrotasks)" queue={queue} isSpinning={isSpinning} />
                    </div>
                    <div className="min-w-[calc(50%-8px)] flex-grow h-[calc(36%_-_32px)]">
                        <QueueDisplay title="Microtask Queue" queue={microTaskQueue} isSpinning={false} />
                    </div>
                    {/* <div className="min-w-[calc(50%-8px)] flex-grow h-[calc(34%_-_32px)]"> */}
                        {/* <EventLoopSpinner isSpinning={isSpinning} /> */}
                    {/* </div> */}
                    <div className="min-w-[calc(50%-8px)] flex-grow h-[calc(36%_-_32px)]">
                        <HeapDisplay heap={heap} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventLoopVisualizer;