import React from 'react';

interface HeapObject {
    address: string;
    value: string;
}

interface HeapDisplayProps {
    heap: HeapObject[];
}

const HeapDisplay: React.FC<HeapDisplayProps> = ({ heap }) => {

    // console.log(heap,'=======heap😍😍😍')

    // address: "0x289"
    // name:"obj"
    // value: "{
    // name:"毛毛"
    // }"

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Heap</h2>
            <div className="overflow-y-auto max-h-[calc(100%-2rem)]">
                {heap.map((obj, index) => (
                    <div key={index} className="bg-gray-700 p-2 mb-2 rounded">
                        <span className="font-mono">{obj.address}: {obj.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeapDisplay;