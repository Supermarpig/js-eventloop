'use client';
import React, { useState, useCallback, useRef } from 'react';
import CodeEditor from './CodeEditor';
import LogDisplay from './LogDisplay';
import CallStackDisplay from './CallStackDisplay';
import WebApisDisplay from './WebApisDisplay';
import QueueDisplay from './QueueDisplay';
import EventLoopSpinner from './EventLoopSpinner';

const EventLoopVisualizer: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [stack, setStack] = useState<string[]>([]);
    const [queue, setQueue] = useState<string[]>([]);
    const [microTaskQueue, setMicroTaskQueue] = useState<string[]>([]);
    const [log, setLog] = useState<string[]>([]);
    const [webApis, setWebApis] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const loopRef = useRef<HTMLSpanElement>(null);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const spinLoop = async () => {
        if (loopRef.current) {
            loopRef.current.style.transition = 'transform 0.5s ease-in-out';
            loopRef.current.style.transform = 'rotate(360deg)';
            await sleep(500);
            loopRef.current.style.transition = 'none';
            loopRef.current.style.transform = 'rotate(0deg)';
        }
    };

    const updateUI = async () => {
        await sleep(1000);
    };

    const executeCode = useCallback(async () => {
        setIsRunning(true);
        setStack([]);
        setQueue([]);
        setMicroTaskQueue([]);
        setLog([]);
        setWebApis([]);

        const mockConsoleLog = async (...args: any[]) => {
            const message = args.join(' ');
            setStack(prev => [...prev, `console.log("${message}")`]);
            await updateUI();
            await sleep(1000);
            setLog(prev => [...prev, message]);
            setStack(prev => prev.filter(item => !item.startsWith('console.log')));
            await updateUI();
        };

        const mockSetTimeout = (callback: Function, delay: number) => {
            const timeoutId = `setTimeout(${delay}ms)`;
            setWebApis(prev => [...prev, timeoutId]);

            setTimeout(async () => {
                setWebApis(prev => prev.filter(item => item !== timeoutId));
                setQueue(prev => [...prev, 'setTimeout callback']);
                await updateUI();

                // 確保微任務執行完後再執行宏任務
                await spinLoop();
                await updateUI();
                callback(); // 在此處執行回調
                setQueue(prev => prev.filter(item => item !== 'setTimeout callback'));
                await updateUI();
            }, delay);
        };

        class MockPromise<T> {
            private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
            private value: T | undefined;
            private reason: any;
            private thenCallbacks: Array<(value: T) => void> = [];
            private catchCallbacks: Array<(reason: any) => void> = [];

            constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
                const resolve = async (value: T) => {
                    if (this.state === 'pending') {
                        this.state = 'fulfilled';
                        this.value = value;
                        setMicroTaskQueue(prev => [...prev, 'Promise resolved']);
                        queueMicrotask(async () => {
                            this.thenCallbacks.forEach(callback => callback(value));
                            setMicroTaskQueue(prev => prev.filter(item => item !== 'Promise resolved'));
                            await updateUI();
                            await spinLoop(); // 將事件循環動畫放在微任務隊列處理之後
                            await updateUI();
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
                    if (onFulfilled) {
                        this.thenCallbacks.push(async (result) => {
                            try {
                                await sleep(300);
                                const value = await onFulfilled(result);
                                resolve(value);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }

                    if (onRejected) {
                        this.catchCallbacks.push(async (reason) => {
                            try {
                                await sleep(300);
                                const value = await onRejected(reason);
                                resolve(value);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }

                    if (this.state === 'fulfilled') {
                        queueMicrotask(() => this.thenCallbacks.forEach(callback => callback(this.value!)));
                    } else if (this.state === 'rejected') {
                        queueMicrotask(() => this.catchCallbacks.forEach(callback => callback(this.reason)));
                    }
                });
            }

            catch<U>(onRejected: (reason: any) => U | PromiseLike<U>): MockPromise<U> {
                return this.then(undefined, onRejected);
            }

            static resolve<T>(value: T): MockPromise<T> {
                return new MockPromise<T>((resolve) => {
                    queueMicrotask(async () => {
                        setMicroTaskQueue(prev => [...prev, 'Promise.resolve']);
                        await sleep(300); // 在resolve時也引入延遲
                        resolve(value);
                        setMicroTaskQueue(prev => prev.filter(item => item !== 'Promise.resolve'));
                        await updateUI();
                        await spinLoop(); // 將事件循環動畫放在微任務隊列處理之後
                        await updateUI();
                    });
                });
            }

            static reject<T>(reason: any): MockPromise<T> {
                return new MockPromise<T>((_, reject) => {
                    queueMicrotask(() => reject(reason));
                });
            }
        }

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
            await runInSandbox(...Object.values(sandbox));

        } catch (error) {
            setLog(prev => [...prev, `Error: ${(error as Error).message}`]);
        }
        setIsRunning(false);
    }, [code]);

    return (
        <div className="flex h-screen text-white">
            <div className="w-1/3 p-4 border-r border-gray-700 h-full flex flex-col justify-between gap-4">
                <CodeEditor code={code} setCode={setCode} isRunning={isRunning} executeCode={executeCode} />
                <LogDisplay log={log} />
            </div>

            <div className="flex-1 grid grid-rows-3 grid-cols-2 gap-4 p-4">
                <CallStackDisplay stack={stack} />
                <WebApisDisplay webApis={webApis} />
                <QueueDisplay title="Callback Queue (Macrotasks)" queue={queue} />
                <QueueDisplay title="Microtask Queue" queue={microTaskQueue} />
                <EventLoopSpinner loopRef={loopRef} />
            </div>
        </div>
    );
};

export default EventLoopVisualizer;
