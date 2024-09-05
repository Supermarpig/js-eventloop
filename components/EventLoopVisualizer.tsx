'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, ArrowBigRight, Play, Pause } from 'lucide-react';
import CodeEditor from './CodeEditor';
import LogDisplay from './LogDisplay';
import CallStackDisplay from './CallStackDisplay';
import WebApisDisplay from './WebApisDisplay';
import QueueDisplay from './QueueDisplay';
import EventLoopSpinner from './EventLoopSpinner';
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
        currentStep,
        steps,
        executeCode,
        nextStep,
        prevStep,
        togglePause
    } = useEventLoop();

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
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
            </div>
            <div className="flex h-full">
                <div className="w-1/3 pr-4 flex flex-col gap-4">
                    <CodeEditor code={code} setCode={setCode} />
                    <LogDisplay log={log} />
                </div>
                <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-4 overflow-auto">
                    <CallStackDisplay stack={stack} />
                    <WebApisDisplay webApis={webApis} />
                    <QueueDisplay title="Callback Queue (Macrotasks)" queue={queue} />
                    <QueueDisplay title="Microtask Queue" queue={microTaskQueue} />
                    <EventLoopSpinner isSpinning={isSpinning} />
                </div>
            </div>
        </div>
    );
};

export default EventLoopVisualizer;