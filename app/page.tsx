'use client'
import React, { useState, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

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
        await spinLoop();
        await callback();
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
            await updateUI();
            await spinLoop();
            this.thenCallbacks.forEach(callback => queueMicrotask(() => callback(value)));
            setMicroTaskQueue(prev => prev.filter(item => item !== 'Promise resolved'));
            await updateUI();
          }
        };

        const reject = (reason: any) => {
          if (this.state === 'pending') {
            this.state = 'rejected';
            this.reason = reason;
            this.catchCallbacks.forEach(callback => queueMicrotask(() => callback(reason)));
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
                await spinLoop();
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
                await spinLoop();
                const value = await onRejected(reason);
                resolve(value);
              } catch (error) {
                reject(error);
              }
            });
          }

          if (this.state === 'fulfilled') {
            this.thenCallbacks.forEach(callback => queueMicrotask(() => callback(this.value!)));
          } else if (this.state === 'rejected') {
            this.catchCallbacks.forEach(callback => queueMicrotask(() => callback(this.reason)));
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
            await updateUI();
            await spinLoop();
            resolve(value);
            setMicroTaskQueue(prev => prev.filter(item => item !== 'Promise.resolve'));
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
        <CodeMirror
          value={code}
          height="calc(70vh - 8rem)"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
          theme="dark"
        />
        <button
          onClick={executeCode}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-500"
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <div className="p-4 border border-gray-700 col-span-2 overflow-y-auto">
          <h3 className="text-center text-green-500">Console Log</h3>
          <div className="mt-2 space-y-1">
            {log.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              log.map((entry, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{entry}</div>)}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-rows-3 grid-cols-2 gap-4 p-4">
        <div className="p-4 border border-gray-700 row-span-2">
          <h3 className="text-center text-orange-500">Call Stack</h3>
          <div className="mt-2 space-y-1">
            {stack.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              stack.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700 row-span-2">
          <h3 className="text-center text-purple-500">Web APIs</h3>
          <div className="mt-2 space-y-1">
            {webApis.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              webApis.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700">
          <h3 className="text-center text-red-500">Callback Queue (Macrotasks)</h3>
          <div className="mt-2 space-y-1">
            {queue.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              queue.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700">
          <h3 className="text-center text-green-500">Microtask Queue</h3>
          <div className="mt-2 space-y-1">
            {microTaskQueue.length === 0 ? <div className="text-center text-gray-400">Empty</div> :
              microTaskQueue.map((item, index) => <div key={index} className="text-center bg-gray-800 p-1 rounded">{item}</div>)}
          </div>
        </div>
        <div className="p-4 border border-gray-700 col-span-2">
          <h3 className="text-center text-blue-500">Event Loop</h3>
          <div className='flex items-center justify-center'>
            <span ref={loopRef} className="text-center text-blue-500 text-4xl">↻</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLoopVisualizer;