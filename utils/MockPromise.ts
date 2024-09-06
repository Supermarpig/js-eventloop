import { Step } from '../types/eventLoop';

export class MockPromise<T> {
    private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
    private value?: T;
    private reason?: any;
    private thenCallbacks: Array<(value: T) => void> = [];
    private catchCallbacks: Array<(reason: any) => void> = [];

    constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
        const error = new Error();
        const stackLine = error.stack?.split('\n')[2]; // 取得呼叫 Promise 的行數
        const match = stackLine?.match(/:(\d+):\d+/); // 匹配行數
        const lineNumber = match ? parseInt(match[1], 10) : 0; // 解析行數

        const resolve = (value: T) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
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
        const error = new Error();
        const stackLine = error.stack?.split('\n')[2]; // 取得呼叫 then 的行數
        const match = stackLine?.match(/:(\d+):\d+/); // 匹配行數
        const lineNumber = match ? parseInt(match[1], 10) : 0; // 解析行數

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
