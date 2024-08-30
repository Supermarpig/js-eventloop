import React from 'react';

interface WebApisDisplayProps {
    webApis: string[];
}

const WebApisDisplay: React.FC<WebApisDisplayProps> = ({ webApis }) => {
    return (
        <div className="p-4 border border-gray-700 row-span-2">
            <h3 className="text-center text-purple-500">Web APIs</h3>
            <div className="mt-2 space-y-1">
                {webApis.length === 0 ? (
                    <div className="text-center text-gray-400">Empty</div>
                ) : (
                    webApis.map((item, index) => (
                        <div key={index} className="text-center bg-gray-800 p-1 rounded">
                            {item}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WebApisDisplay;
