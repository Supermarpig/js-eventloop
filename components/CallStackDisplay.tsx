import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CallStackDisplayProps {
    stack: string[];
}

const CallStackDisplay: React.FC<CallStackDisplayProps> = ({ stack }) => (
    <Card>
        <CardHeader>
            <CardTitle>Call Stack</CardTitle>
        </CardHeader>
        <CardContent>
            {stack.map((item, index) => (
                <div key={index} className="bg-gray-700 p-2 mb-2 rounded text-white">{item}</div>
            ))}
        </CardContent>
    </Card>
);

export default CallStackDisplay;
