import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';

interface EventLoopSpinnerProps {
    isSpinning: boolean;
}

const EventLoopSpinner: React.FC<EventLoopSpinnerProps> = ({ isSpinning }) => (
    <Card className="flex items-center justify-center">
        <Loader className={`w-16 h-16 ${isSpinning ? 'animate-spin' : ''}`} />
    </Card>
);

export default EventLoopSpinner;
