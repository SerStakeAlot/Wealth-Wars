'use client';

import { useState } from 'react';
import { useGame } from '../app/lib/store';

interface UsernameInputProps {
  onClose?: () => void;
}

export function UsernameInput({ onClose }: UsernameInputProps) {
  const { username, setUsername } = useGame();
  const [inputValue, setInputValue] = useState(username);
  const [isEditing, setIsEditing] = useState(!username);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || inputValue === username) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await setUsername(inputValue.trim());
    
    if (result.success) {
      setIsEditing(false);
      onClose?.();
    } else {
      setError(result.error || 'Failed to set username');
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    setInputValue(username);
    setIsEditing(false);
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  return (
    <div className="usernameSection">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="usernameForm">
          <div className="inputGroup">
            <label htmlFor="username" className="inputLabel">Username</label>
            <input
              id="username"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your username"
              className="usernameInput"
              disabled={isLoading}
              autoFocus
              maxLength={20}
            />
            {error && <div className="errorMsg">{error}</div>}
          </div>
          <div className="buttonGroup">
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="btn primary"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={isLoading}
              className="btn secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="usernameDisplay">
          <div className="usernameRow">
            <span className="usernameLabel">Username</span>
            <span className="usernameValue">{username || 'Not set'}</span>
            <button onClick={handleEdit} className="editBtn">
              ✏️
            </button>
          </div>
          {!username && (
            <div className="usernameHint">
              Set a unique username to identify yourself in the game
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .usernameSection {
          margin: 12px 0;
        }

        .usernameForm {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .inputGroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inputLabel {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .usernameInput {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: #fff;
          color: #0f172a;
          transition: border-color 0.2s;
        }

        .usernameInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .usernameInput:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .errorMsg {
          font-size: 12px;
          color: #ef4444;
          margin-top: 4px;
        }

        .buttonGroup {
          display: flex;
          gap: 8px;
        }

        .btn {
          flex: 1;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid;
        }

        .btn.primary {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
        }

        .btn.primary:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
        }

        .btn.primary:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
        }

        .btn.secondary {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .btn.secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .usernameDisplay {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .usernameRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .usernameLabel {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .usernameValue {
          font-weight: 700;
          color: ${username ? '#0f172a' : '#9ca3af'};
          flex: 1;
          text-align: right;
          margin-right: 8px;
        }

        .editBtn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .editBtn:hover {
          background: #f3f4f6;
        }

        .usernameHint {
          font-size: 11px;
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}