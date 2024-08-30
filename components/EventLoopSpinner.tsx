import React from 'react';

interface EventLoopSpinnerProps {
    loopRef: React.RefObject<HTMLSpanElement>;
}

const EventLoopSpinner: React.FC<EventLoopSpinnerProps> = ({ loopRef }) => {
    return (
        <div className="p-4 border border-gray-700 col-span-2">
            <h3 className="text-center text-blue-500">Event Loop</h3>
            <div className="flex items-center justify-center">
                <span ref={loopRef} className="text-center text-blue-500 text-4xl">
                    ↻
                </span>
            </div>
        </div>
    );
};

export default EventLoopSpinner;
