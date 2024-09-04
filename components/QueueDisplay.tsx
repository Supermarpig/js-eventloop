import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QueueDisplayProps {
    title: string;
    queue: string[];
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({ title, queue }) => (
    <Card>
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
