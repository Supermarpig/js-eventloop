import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface LogDisplayProps {
    log: string[];
}

const LogDisplay: React.FC<LogDisplayProps> = ({ log }) => (
    <Card className="h-1/2  overflow-hidden">
        <CardHeader>
            <CardTitle>Console Output</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col overflow-y-scroll">
            {log.map((entry, index) => (
                <span key={index} className="text-green-600 text-2xl">{entry}</span>
            ))}
        </CardContent>
    </Card>
);

export default LogDisplay;
