
import React from 'react';
import { PasswordStrength } from '@/types/auth';
import { getPasswordStrengthColor, getPasswordStrengthText } from '@/utils/passwordStrength';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrength;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  className = ''
}) => {
  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-semibold ${
            strength.score <= 2 ? 'text-red-600' : 
            strength.score <= 3 ? 'text-yellow-600' : 
            strength.score <= 4 ? 'text-blue-600' : 'text-green-600'
          }`}>
            {getPasswordStrengthText(strength.score)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Suggestions:</p>
          <ul className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                {feedback}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Requirements:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <RequirementItem 
            met={password.length >= 8} 
            text="At least 8 characters" 
          />
          <RequirementItem 
            met={/[a-z]/.test(password)} 
            text="Lowercase letter" 
          />
          <RequirementItem 
            met={/[A-Z]/.test(password)} 
            text="Uppercase letter" 
          />
          <RequirementItem 
            met={/[0-9]/.test(password)} 
            text="Number" 
          />
          <RequirementItem 
            met={/[^A-Za-z0-9]/.test(password)} 
            text="Special character" 
          />
          <RequirementItem 
            met={password.length >= 12} 
            text="12+ characters (recommended)" 
          />
        </div>
      </div>
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
  <div className="flex items-center gap-2 text-sm">
    {met ? (
      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
    ) : (
      <XCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
    )}
    <span className={met ? 'text-green-600' : 'text-gray-500'}>{text}</span>
  </div>
);
