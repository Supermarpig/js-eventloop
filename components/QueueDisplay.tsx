import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Loader } from 'lucide-react';


interface QueueDisplayProps {
    title: string;
    queue: string[];
    isSpinning: boolean;
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ title, queue, isSpinning }) => (
    <Card>
        <Loader className={`w-16 h-16 absolute text-yellow-500 ${isSpinning ? 'block animate-spin ' : 'hidden'}`} />
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {queue.map((item, index) => (
                <div key={index} className="bg-gray-700 p-2 mb-2 rounded text-white">{item}</div>
            ))}
        </CardContent>
    </Card>
);

export default QueueDisplay;
