import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface LogDisplayProps {
    log: string[];
}

const LogDisplay: React.FC<LogDisplayProps> = ({ log }) => (
    <Card className="h-1/2 overflow-auto">
        <CardHeader>
            <CardTitle>Console Output</CardTitle>
        </CardHeader>
        <CardContent>
            {log.map((entry, index) => (
                <div key={index} className="text-green-600 text-2xl">{entry}</div>
            ))}
        </CardContent>
    </Card>
);

export default LogDisplay;
