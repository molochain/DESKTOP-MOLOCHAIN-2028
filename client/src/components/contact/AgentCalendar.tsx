import { useState } from 'react';
import { Calendar as CalendarIcon, Check, Clock } from 'lucide-react';
import { format, addDays, isWithinInterval, setHours, setMinutes, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
// Agent Status interface
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
  phone?: string;
  timezone?: string;
  languages?: string[];
  profileImage?: string;
  experience?: number;
  rating?: number;
  projects?: number;
  customFields?: Record<string, any>;
}
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface AgentCalendarProps {
  agent: AgentStatus;
  onClose?: () => void;
}

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

const AgentCalendar: React.FC<AgentCalendarProps> = ({ agent, onClose }) => {
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [meetingDuration, setMeetingDuration] = useState<string>("30min");
  const [step, setStep] = useState<'date' | 'time' | 'confirmation'>('date');
  
  // Generate available office hours (9 AM to 5 PM)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          id: `time-${hour}-${minute}`,
          time,
          available: isAvailable(date!, time)
        });
      }
    }
    
    return slots;
  };
  
  // Check if a specific time slot is available
  const isAvailable = (date: Date, time: string): boolean => {
    // This is a simplified implementation; in a real app, you'd check against the agent's calendar
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = setMinutes(setHours(new Date(date), hours), minutes);
    
    // Let's assume all agents are available on weekdays between 9 AM and 5 PM
    // except for lunch hour (12-1 PM)
    const dayOfWeek = dateTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isLunchHour = hours === 12;
    
    // Agent specific availability (simplified)
    const isAgentAvailable = agent.status !== 'offline';
    
    return !isWeekend && !isLunchHour && isAgentAvailable;
  };
  
  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setStep('time');
    }
  };
  
  const handlePrevStep = () => {
    if (step === 'time') {
      setStep('date');
    } else if (step === 'confirmation') {
      setStep('time');
    }
  };
  
  const handleScheduleMeeting = () => {
    if (!date || !selectedTimeSlot) return;
    
    // In a real app, this would send the request to the server
    toast({
      title: 'Meeting Scheduled',
      description: `Your meeting with ${agent.name} has been scheduled for ${format(date, 'MMMM do, yyyy')} at ${selectedTimeSlot}.`,
    });
    
    if (onClose) {
      onClose();
    }
  };
  
  const handleNextStep = () => {
    if (step === 'time' && selectedTimeSlot) {
      setStep('confirmation');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Step 1: Select Date */}
      {step === 'date' && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium">Select a Date</h3>
            <p className="text-sm text-gray-500">Choose a date to meet with {agent.name}</p>
          </div>
          
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => 
                date < new Date() || // Can't select dates in the past
                isWithinInterval(date, {
                  start: new Date(),
                  end: addDays(new Date(), 1)
                }) // Require at least 24h notice
              }
              className="rounded-md border"
            />
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => date && setStep('time')}
              disabled={!date}
            >
              Next
            </Button>
          </div>
        </>
      )}
      
      {/* Step 2: Select Time */}
      {step === 'time' && date && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevStep}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-medium">
              {format(date, 'MMMM do, yyyy')}
            </h3>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Duration</h4>
            <RadioGroup 
              value={meetingDuration} 
              onValueChange={setMeetingDuration}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="15min" id="15min" />
                <Label htmlFor="15min">15min</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="30min" id="30min" />
                <Label htmlFor="30min">30min</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="60min" id="60min" />
                <Label htmlFor="60min">1hr</Label>
              </div>
            </RadioGroup>
          </div>
          
          <h4 className="text-sm font-medium mb-2">Available Time Slots</h4>
          <div className="grid grid-cols-3 gap-2">
            {generateTimeSlots().map((slot) => (
              <Button
                key={slot.id}
                variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                className="text-sm"
                onClick={() => handleTimeSelect(slot.time)}
                disabled={!slot.available}
              >
                {slot.time}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={!selectedTimeSlot}
            >
              Next
            </Button>
          </div>
        </>
      )}
      
      {/* Step 3: Confirmation */}
      {step === 'confirmation' && date && selectedTimeSlot && (
        <>
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">Confirm Your Meeting</h3>
            <p className="text-sm text-gray-500">Please review your meeting details</p>
          </div>
          
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{format(date, 'EEEE, MMMM do, yyyy')}</p>
                <p className="text-sm text-gray-500">{selectedTimeSlot} • {meetingDuration}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg
                  ${agent.status === 'online' ? 'bg-green-500' : 
                  agent.status === 'busy' ? 'bg-yellow-500' : 
                  'bg-gray-400'}`}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-gray-500">{agent.role || 'Logistics Agent'}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {agent.specialty?.join(', ') || 'Logistics'}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="text-sm text-gray-500">
              <p>Meeting notes (optional)</p>
              <p className="italic text-xs">This meeting will be conducted via video call. You will receive a link via email.</p>
            </div>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
            <Button onClick={handleScheduleMeeting}>
              Schedule Meeting
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentCalendar;