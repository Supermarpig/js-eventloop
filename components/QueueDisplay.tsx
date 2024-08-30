import React from 'react';

interface QueueDisplayProps {
    title: string;
    queue: string[];
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ title, queue }) => {
    return (
        <div className="p-4 border border-gray-700">
            <h3 className={`text-center ${title.includes('Microtask') ? 'text-green-500' : 'text-red-500'}`}>{title}</h3>
            <div className="mt-2 space-y-1">
                {queue.length === 0 ? (
                    <div className="text-center text-gray-400">Empty</div>
                ) : (
                    queue.map((item, index) => (
                        <div key={index} className="text-center bg-gray-800 p-1 rounded">
                            {item}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QueueDisplay;
