import React from 'react';
import { RecurrencePattern } from '../types/Task';
import { useLanguage } from '../contexts/LanguageContext';

interface RecurrenceSettingsProps {
  isRecurring: boolean;
  setIsRecurring: (recurring: boolean) => void;
  pattern: RecurrencePattern | null;
  setPattern: (pattern: RecurrencePattern | null) => void;
}

const RecurrenceSettings: React.FC<RecurrenceSettingsProps> = ({
  isRecurring,
  setIsRecurring,
  pattern,
  setPattern
}) => {
  const { t } = useLanguage();

  const handlePatternChange = (field: keyof RecurrencePattern, value: any) => {
    if (!pattern) {
      setPattern({
        type: 'weekly',
        interval: 1,
        [field]: value
      });
    } else {
      setPattern({
        ...pattern,
        [field]: value
      });
    }
  };

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <div className="space-y-4">
      {/* Recurring Toggle */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsRecurring(!isRecurring);
            if (!isRecurring) {
              setPattern({
                type: 'weekly',
                interval: 1
              });
            } else {
              setPattern(null);
            }
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isRecurring ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isRecurring ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <label className="text-sm font-medium text-gray-300">
          Recurring Task
        </label>
      </div>

      {isRecurring && pattern && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          {/* Recurrence Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Repeat
            </label>
            <select
              value={pattern.type}
              onChange={(e) => handlePatternChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Every
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="365"
                value={pattern.interval}
                onChange={(e) => handlePatternChange('interval', parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-gray-300">
                {pattern.type === 'daily' && (pattern.interval === 1 ? 'day' : 'days')}
                {pattern.type === 'weekly' && (pattern.interval === 1 ? 'week' : 'weeks')}
                {pattern.type === 'monthly' && (pattern.interval === 1 ? 'month' : 'months')}
                {pattern.type === 'yearly' && (pattern.interval === 1 ? 'year' : 'years')}
              </span>
            </div>
          </div>

          {/* Weekly specific settings */}
          {pattern.type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                On days
              </label>
              <div className="grid grid-cols-4 gap-2">
                {weekDays.map(day => (
                  <label key={day.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pattern.daysOfWeek?.includes(day.value) || false}
                      onChange={(e) => {
                        const currentDays = pattern.daysOfWeek || [];
                        if (e.target.checked) {
                          handlePatternChange('daysOfWeek', [...currentDays, day.value]);
                        } else {
                          handlePatternChange('daysOfWeek', currentDays.filter(d => d !== day.value));
                        }
                      }}
                      className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Monthly specific settings */}
          {pattern.type === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                On day of month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={pattern.dayOfMonth || 1}
                onChange={(e) => handlePatternChange('dayOfMonth', parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End date (optional)
            </label>
            <input
              type="date"
              value={pattern.endDate ? new Date(pattern.endDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handlePatternChange('endDate', e.target.value ? e.target.value : undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceSettings;
