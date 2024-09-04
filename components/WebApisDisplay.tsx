import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WebApisDisplayProps {
    webApis: string[];
}

const WebApisDisplay: React.FC<WebApisDisplayProps> = ({ webApis }) => (
    <Card>
        <CardHeader>
            <CardTitle>Web APIs</CardTitle>
        </CardHeader>
        <CardContent>
            {webApis.map((api, index) => (
                <div key={index} className="bg-gray-700 p-2 mb-2 rounded text-white">{api}</div>
            ))}
        </CardContent>
    </Card>
);


export default WebApisDisplay;
