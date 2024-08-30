import React from 'react';

interface CallStackDisplayProps {
    stack: string[];
}

const CallStackDisplay: React.FC<CallStackDisplayProps> = ({ stack }) => {
    return (
        <div className="p-4 border border-gray-700 row-span-2 overflow-y-auto">
            <h3 className="text-center text-orange-500">Call Stack</h3>
            <div className="mt-2 space-y-1">
                {stack.length === 0 ? (
                    <div className="text-center text-gray-400">Empty</div>
                ) : (
                    stack.map((item, index) => (
                        <div key={index} className="text-center bg-gray-800 p-1 rounded">
                            {item}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CallStackDisplay;
