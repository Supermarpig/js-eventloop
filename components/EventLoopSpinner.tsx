import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowBigLeft, ArrowBigRight, Loader, Play } from 'lucide-react';

interface EventLoopSpinnerProps {
    isSpinning: boolean;
}

const EventLoopSpinner: React.FC<EventLoopSpinnerProps> = ({ isSpinning }) => (
    <Card className="flex items-center justify-center">
        <Loader className={`w-16 h-16 ${isSpinning ? 'animate-spin' : ''}`} />
    </Card>
);

export default EventLoopSpinner;
