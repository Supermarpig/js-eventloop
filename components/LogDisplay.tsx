import React from 'react';

interface LogDisplayProps {
    log: string[];
}

const LogDisplay: React.FC<LogDisplayProps> = ({ log }) => {
    return (
        <div className="p-4 border border-gray-700 col-span-2 overflow-y-auto">
            <h3 className="text-center text-green-500">Console Log</h3>
            <div className="mt-2 space-y-1">
                {log.length === 0 ? (
                    <div className="text-center text-gray-400">Empty</div>
                ) : (
                    log.map((entry, index) => (
                        <div key={index} className="text-center bg-gray-800 p-1 rounded">
                            {entry}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LogDisplay;
