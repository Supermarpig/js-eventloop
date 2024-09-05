'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, ArrowBigRight, Play, Pause } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import LogDisplay from '@/components/LogDisplay';
import CallStackDisplay from '@/components/CallStackDisplay';
import WebApisDisplay from '@/components/WebApisDisplay';
import QueueDisplay from '@/components/QueueDisplay';
import EventLoopSpinner from '@/components/EventLoopSpinner';

// Type definitions
type StepType = 'stack' | 'removeFromStack' | 'queue' | 'removeFromQueue' | 'microTaskQueue' | 'removeFromMicroTaskQueue' | 'webApi' | 'removeFromWebApi' | 'log' | 'spin';

interface Step {
    type: StepType;
    data?: string;
}

const EventLoopVisualizer: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [stack, setStack] = useState<string[]>([]);
    const [queue, setQueue] = useState<string[]>([]);
    const [microTaskQueue, setMicroTaskQueue] = useState<string[]>([]);
    const [log, setLog] = useState<string[]>([]);
    const [webApis, setWebApis] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isSpinning, setIsSpinning] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [steps, setSteps] = useState<Step[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const stepsRef = useRef<Step[]>([]);
    const currentStepRef = useRef<number>(0);

    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    useEffect(() => {
        console.log('Current step updated:', currentStep); // 確認 currentStep 是否正確更新
    }, [currentStep]);

    const createStep = (type: StepType, data?: string): Step => ({ type, data });

    const startInterval = () => {
        if (!intervalRef.current) {
            console.log('Starting interval'); // Debugging log
            intervalRef.current = setInterval(() => {
                console.log('Next step triggered by interval'); // Debugging log
                nextStep();
            }, 500);
        }
    };

    const stopInterval = useCallback(() => {
        console.log('Stopping interval'); // Debugging log
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const togglePause = () => {
        if (intervalRef.current) {
            stopInterval(); // 停止interval，並立即暫停
            setIsPaused(true); // 更新狀態為暫停
        } else {
            startInterval(); // 恢復interval，並開始執行
            setIsPaused(false); // 更新狀態為恢復
        }
    };
    const mockConsoleLog = (...args: any[]): void => {
        const message = args.join(' ');
        setSteps(prev => [
            ...prev,
            createStep('stack', `console.log("${message}")`),
            createStep('log', message),
            createStep('removeFromStack', `console.log("${message}")`)
        ]);
    };

    const mockSetTimeout = (callback: () => void, delay: number): void => {
        const timeoutId = `setTimeout(${delay}ms)`;
        setSteps(prev => [
            ...prev,
            createStep('webApi', timeoutId),
            createStep('removeFromWebApi', timeoutId),
            createStep('queue', 'setTimeout callback'),
            createStep('spin'),
            createStep('removeFromQueue', 'setTimeout callback')
        ]);
        setTimeout(() => {
            callback();
        }, delay);
    };

    class MockPromise<T> {
        private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
        private value?: T;
        private reason?: any;
        private thenCallbacks: Array<(value: T) => void> = [];
        private catchCallbacks: Array<(reason: any) => void> = [];

        constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
            const resolve = (value: T) => {
                if (this.state === 'pending') {
                    this.state = 'fulfilled';
                    this.value = value;
                    setSteps(prev => [
                        ...prev,
                        createStep('microTaskQueue', 'Promise resolved'),
                        createStep('spin'),
                        createStep('removeFromMicroTaskQueue', 'Promise resolved')
                    ]);
                    queueMicrotask(() => {
                        this.thenCallbacks.forEach(callback => callback(value));
                    });
                }
            };

            const reject = (reason: any) => {
                if (this.state === 'pending') {
                    this.state = 'rejected';
                    this.reason = reason;
                    queueMicrotask(() => {
                        this.catchCallbacks.forEach(callback => callback(reason));
                    });
                }
            };

            try {
                executor(resolve, reject);
            } catch (error) {
                reject(error);
            }
        }

        then<U>(onFulfilled?: (value: T) => U | PromiseLike<U>, onRejected?: (reason: any) => U | PromiseLike<U>): MockPromise<U> {
            return new MockPromise<U>((resolve, reject) => {
                if (onFulfilled && this.state === 'fulfilled') {
                    queueMicrotask(() => {
                        try {
                            const value = onFulfilled(this.value!);
                            resolve(value as U);
                        } catch (error) {
                            reject(error);
                        }
                    });
                }

                if (onRejected && this.state === 'rejected') {
                    queueMicrotask(() => {
                        try {
                            const value = onRejected(this.reason);
                            resolve(value as U);
                        } catch (error) {
                            reject(error);
                        }
                    });
                }

                if (this.state === 'pending') {
                    if (onFulfilled) {
                        this.thenCallbacks.push((result) => {
                            try {
                                const value = onFulfilled(result);
                                resolve(value as U);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }

                    if (onRejected) {
                        this.catchCallbacks.push((reason) => {
                            try {
                                const value = onRejected(reason);
                                resolve(value as U);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }
                }
            });
        }


        catch<U>(onRejected: (reason: any) => U | PromiseLike<U>): MockPromise<U> {
            return this.then(undefined, onRejected);
        }

        static resolve<T>(value: T): MockPromise<T> {
            return new MockPromise<T>((resolve) => {
                queueMicrotask(() => resolve(value));
            });
        }

        static reject<T>(reason: any): MockPromise<T> {
            return new MockPromise<T>((_, reject) => {
                queueMicrotask(() => reject(reason));
            });
        }
    }

    const executeCode = useCallback(() => {
        setIsRunning(true);
        setSteps([]);
        setCurrentStep(0);
        setStack([]);
        setQueue([]);
        setMicroTaskQueue([]);
        setLog([]);
        setWebApis([]);

        const sandbox = {
            setTimeout: mockSetTimeout,
            console: { log: mockConsoleLog },
            Promise: MockPromise,
        };

        try {
            const wrappedCode = `
        async function runCode() {
          ${code}
        }
        runCode();
      `;

            const runInSandbox = new Function(...Object.keys(sandbox), wrappedCode);
            runInSandbox(...Object.values(sandbox));
            startInterval(); // Start automatic step through
        } catch (error) {
            setLog(prev => [...prev, `Error: ${(error as Error).message}`]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    const applyStep = useCallback((step: Step) => {
        switch (step.type) {
            case 'stack':
                setStack(prev => [...prev, step.data!]);
                break;
            case 'removeFromStack':
                setStack(prev => prev.filter(item => item !== step.data));
                break;
            case 'queue':
                setQueue(prev => [...prev, step.data!]);
                break;
            case 'removeFromQueue':
                setQueue(prev => prev.filter(item => item !== step.data));
                break;
            case 'microTaskQueue':
                setMicroTaskQueue(prev => [...prev, step.data!]);
                break;
            case 'removeFromMicroTaskQueue':
                setMicroTaskQueue(prev => prev.filter(item => item !== step.data));
                break;
            case 'webApi':
                setWebApis(prev => [...prev, step.data!]);
                break;
            case 'removeFromWebApi':
                setWebApis(prev => prev.filter(item => item !== step.data));
                break;
            case 'log':
                setLog(prev => [...prev, step.data!]);
                break;
            case 'spin':
                setIsSpinning(true);
                setTimeout(() => setIsSpinning(false), 500);
                break;
        }
    }, []);

    const nextStep = useCallback(() => {
        console.log(currentStepRef.current, "===========currentStep😍😍😍");
        console.log(stepsRef.current.length, "===========steps.length");

        if (currentStepRef.current < stepsRef.current.length) {
            applyStep(stepsRef.current[currentStepRef.current]);

            setCurrentStep(prev => {
                const newStep = prev + 1;
                console.log('New currentStep:', newStep);
                return newStep;
            });
            currentStepRef.current += 1;
        }

        if (currentStepRef.current === stepsRef.current.length) {
            setIsRunning(false);
            stopInterval();
        }
    }, [applyStep, stopInterval]);

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            // Reset the state and reapply all steps up to the new current step
            setStack([]);
            setQueue([]);
            setMicroTaskQueue([]);
            setLog([]);
            setWebApis([]);
            for (let i = 0; i < currentStep - 1; i++) {
                applyStep(steps[i]);
            }
        }
    };

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
