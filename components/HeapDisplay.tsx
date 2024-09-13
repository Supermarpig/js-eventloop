import React from 'react';

interface HeapObject {
    address: string;
    name: string[];
    value: string;
}

interface HeapDisplayProps {
    heap: HeapObject[];
}

const HeapDisplay: React.FC<HeapDisplayProps> = ({ heap }) => {

    console.log(heap,"===================heap😍😍😍")

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Heap</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {heap.map((obj, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md">
                        <div className="mb-2">
                            <span className="text-blue-400 font-mono">Address: </span>
                            <span className="text-green-400 font-mono">{obj.address}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-blue-400 font-mono">Variables: </span>
                            <span className="text-yellow-400 font-mono">{obj.name.join(', ')}</span>
                        </div>
                        <div>
                            <span className="text-blue-400 font-mono">Value: </span>
                            <span className="text-pink-400 font-mono">{obj.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeapDisplay;