'use client';

import { useState } from 'react';
import { useGame } from '../app/lib/store';

interface UsernameInputProps {
  onClose?: () => void;
}

export function UsernameInput({ onClose }: UsernameInputProps) {
  const { username, setUsername, walletAddress } = useGame();
  const [inputValue, setInputValue] = useState(username);
  const [isEditing, setIsEditing] = useState(!username);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWalletConnected = !!walletAddress;

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
      {!isWalletConnected ? (
        <div className="walletRequired">
          <div className="walletMessage">
            Connect your wallet to set a username
          </div>
        </div>
      ) : isEditing ? (
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
          color: #9aa7bd;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .usernameInput {
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 14px;
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          transition: border-color 0.2s;
        }

        .usernameInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .usernameInput:disabled {
          background: rgba(255,255,255,0.03);
          color: #9aa7bd;
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
          background: #6b7280;
          border-color: #6b7280;
          cursor: not-allowed;
        }

        .btn.secondary {
          background: rgba(255,255,255,0.06);
          color: #e6edf5;
          border-color: rgba(255,255,255,0.12);
        }

        .btn.secondary:hover:not(:disabled) {
          background: rgba(255,255,255,0.12);
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
          color: #9aa7bd;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .usernameValue {
          font-weight: 700;
          color: ${username ? '#e6edf5' : '#9aa7bd'};
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
          background: rgba(255,255,255,0.06);
        }

        .usernameHint {
          font-size: 11px;
          color: #9aa7bd;
          font-style: italic;
        }

        .walletRequired {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
        }

        .walletMessage {
          font-size: 14px;
          color: #9aa7bd;
          text-align: center;
        }
      `}</style>
    </div>
  );
}