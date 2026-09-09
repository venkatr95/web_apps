import React from 'react';
import { format, addMonths, isSameDay } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface DateRangeCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onDatesChange: (start: Date | null, end: Date | null) => void;
}

const quickSelections = [
  { label: '1 day', days: 1 },
  { label: '2 days', days: 2 },
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
];

export const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onDatesChange,
}) => {
  const [view, setView] = React.useState<'dates' | 'months' | 'flexible'>('dates');
  const [baseMonth, setBaseMonth] = React.useState(new Date());

  if (!isOpen) return null;

  const renderCalendarHeader = (date: Date) => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm text-gray-500">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarDays = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days = [];
    const startOffset = firstDay.getDay();

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Add the days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      const isSelected = startDate && isSameDay(currentDate, startDate) || 
                        endDate && isSameDay(currentDate, endDate);
      const isInRange = startDate && endDate && 
                       currentDate > startDate && currentDate < endDate;

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!startDate || (startDate && endDate)) {
              onDatesChange(currentDate, null);
            } else {
              if (currentDate < startDate) {
                onDatesChange(currentDate, startDate);
              } else {
                onDatesChange(startDate, currentDate);
              }
            }
          }}
          className={`
            h-10 w-10 rounded-full flex items-center justify-center text-sm
            ${isSelected ? 'bg-black text-white' : ''}
            ${isInRange ? 'bg-gray-100' : ''}
            hover:border-2 hover:border-gray-200
          `}
        >
          {day}
        </button>
      );
    }

    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-3xl shadow-xl border mt-3 p-6 max-w-3xl mx-auto">
      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              view === 'dates' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setView('dates')}
          >
            Dates
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              view === 'months' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setView('months')}
          >
            Months
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              view === 'flexible' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setView('flexible')}
          >
            Flexible
          </button>
        </div>
      </div>

      {view === 'dates' && (
        <>
          {/* Calendar Grid */}
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {format(baseMonth, 'MMMM yyyy')}
                </h3>
              </div>
              {renderCalendarHeader(baseMonth)}
              {renderCalendarDays(baseMonth)}
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {format(addMonths(baseMonth, 1), 'MMMM yyyy')}
                </h3>
                <button
                  onClick={() => setBaseMonth(addMonths(baseMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              {renderCalendarHeader(addMonths(baseMonth, 1))}
              {renderCalendarDays(addMonths(baseMonth, 1))}
            </div>
          </div>

          {/* Quick Selections */}
          <div className="mt-6 flex items-center space-x-2">
            <button className="px-4 py-2 border rounded-full text-sm font-medium hover:border-black">
              Exact dates
            </button>
            {quickSelections.map(({ label, days }) => (
              <button
                key={label}
                className="px-4 py-2 border rounded-full text-sm hover:border-black"
                onClick={() => {
                  const start = new Date();
                  const end = new Date();
                  end.setDate(end.getDate() + days);
                  onDatesChange(start, end);
                }}
              >
                ± {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};