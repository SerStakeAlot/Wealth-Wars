'use client';

import { useState } from 'react';
import { useGame } from '../app/lib/store';
import { ENHANCED_BUSINESSES } from '../app/lib/businesses';
import { MAINTENANCE_ACTIONS } from '../app/lib/maintenance';

export default function MaintenanceCenter() {
  const {
    businessConditions,
    enhancedBusinesses,
    creditBalance,
    maintenanceBudget,
    performBusinessMaintenance,
    processDegradationCheck,
    getMaintenanceNotifications,
    dismissMaintenanceNotification,
    getMaintenanceRecommendations,
    setMaintenanceBudget
  } = useGame();

  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState(maintenanceBudget.toString());

  // Process degradation on component mount/refresh
  const handleRefresh = () => {
    processDegradationCheck();
  };

  const handleMaintenance = (businessId: string, actionType: keyof typeof MAINTENANCE_ACTIONS) => {
    const result = performBusinessMaintenance(businessId, actionType);
    if (result.success) {
      setSelectedBusiness(null);
    }
    return result;
  };

  const notifications = getMaintenanceNotifications();
  const recommendations = getMaintenanceRecommendations();

  const getConditionColor = (condition: number) => {
    if (condition >= 80) return '#10b981'; // green
    if (condition >= 60) return '#f59e0b'; // yellow
    if (condition >= 40) return '#f97316'; // orange
    if (condition > 0) return '#ef4444'; // red
    return '#6b7280'; // gray (broken)
  };

  const getConditionText = (condition: number) => {
    if (condition >= 80) return 'Excellent';
    if (condition >= 60) return 'Good';
    if (condition >= 40) return 'Fair';
    if (condition > 0) return 'Poor';
    return 'Broken';
  };

  return (
    <div className="maintenanceCenter">
      {/* Header */}
      <div className="maintenanceHeader">
        <div className="title">
          <h2>🔧 Business Maintenance Center</h2>
          <p>Keep your empire running at peak efficiency</p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="label">Available Credits</span>
            <span className="value">{creditBalance.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Maintenance Budget</span>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onBlur={() => setMaintenanceBudget(parseInt(budgetInput) || 0)}
              className="budgetInput"
            />
          </div>
          <button onClick={handleRefresh} className="refreshBtn">
            🔄 Refresh Status
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          <h3>⚠️ Maintenance Alerts</h3>
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <div className="notificationContent">
                <div className="message">{notification.message}</div>
                <div className="action">{notification.action}</div>
              </div>
              <button 
                onClick={() => dismissMaintenanceNotification(notification.id)}
                className="dismissBtn"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>💡 Maintenance Recommendations</h3>
          <div className="recommendationGrid">
            {recommendations.map(rec => (
              <div key={rec.businessId} className="recommendation">
                <div className="recHeader">
                  <span className="businessName">{rec.businessName}</span>
                  <span className="priority">Priority: {rec.priority}</span>
                </div>
                <div className="recAction">
                  <span className="actionName">{rec.action.name}</span>
                  <span className="cost">{rec.cost} credits</span>
                </div>
                <button 
                  onClick={() => handleMaintenance(rec.businessId, rec.action.type)}
                  className="performBtn"
                  disabled={creditBalance < rec.cost}
                >
                  Perform Maintenance
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Status Grid */}
      <div className="businessGrid">
        <h3>🏢 Business Portfolio Status</h3>
        <div className="grid">
          {enhancedBusinesses.map(businessId => {
            const business = ENHANCED_BUSINESSES.find(b => b.id === businessId);
            const condition = businessConditions[businessId];
            
            if (!business || !condition) return null;

            return (
              <div 
                key={businessId} 
                className={`businessCard ${selectedBusiness === businessId ? 'selected' : ''}`}
                onClick={() => setSelectedBusiness(businessId)}
              >
                <div className="businessHeader">
                  <span className="businessName">{business.name}</span>
                  <span className="businessCategory">{business.category}</span>
                </div>
                
                <div className="conditionBar">
                  <div className="conditionLabel">
                    <span>Condition: {Math.floor(condition.condition)}%</span>
                    <span className="conditionText" style={{ color: getConditionColor(condition.condition) }}>
                      {getConditionText(condition.condition)}
                    </span>
                  </div>
                  <div className="conditionProgress">
                    <div 
                      className="conditionFill"
                      style={{ 
                        width: `${condition.condition}%`,
                        backgroundColor: getConditionColor(condition.condition)
                      }}
                    />
                  </div>
                </div>

                <div className="businessStats">
                  <div className="stat">
                    <span className="label">Efficiency</span>
                    <span className="value">{Math.floor(condition.efficiencyMultiplier * 100)}%</span>
                  </div>
                  <div className="stat">
                    <span className="label">Upgrade Bonus</span>
                    <span className="value">+{Math.floor(condition.upgradeBonus * 100)}%</span>
                  </div>
                </div>

                {condition.isOffline && (
                  <div className="offlineStatus">
                    🔧 Under Maintenance
                    {condition.offlineUntil && (
                      <div className="offlineTime">
                        Resumes: {new Date(condition.offlineUntil).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance Actions Modal */}
      {selectedBusiness && (
        <div className="maintenanceModal">
          <div className="modalOverlay" onClick={() => setSelectedBusiness(null)} />
          <div className="modalContent">
            {(() => {
              const business = ENHANCED_BUSINESSES.find(b => b.id === selectedBusiness);
              const condition = businessConditions[selectedBusiness];
              
              if (!business || !condition) return null;

              return (
                <>
                  <div className="modalHeader">
                    <h3>🔧 Maintenance Options: {business.name}</h3>
                    <button onClick={() => setSelectedBusiness(null)}>✕</button>
                  </div>

                  <div className="currentStatus">
                    <div className="statusRow">
                      <span>Current Condition:</span>
                      <span style={{ color: getConditionColor(condition.condition) }}>
                        {Math.floor(condition.condition)}% ({getConditionText(condition.condition)})
                      </span>
                    </div>
                    <div className="statusRow">
                      <span>Efficiency:</span>
                      <span>{Math.floor(condition.efficiencyMultiplier * 100)}%</span>
                    </div>
                    <div className="statusRow">
                      <span>Last Maintained:</span>
                      <span>{new Date(condition.lastMaintained).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="maintenanceOptions">
                    {Object.entries(MAINTENANCE_ACTIONS).map(([actionKey, action]) => {
                      const cost = Math.floor(business.cost * action.costMultiplier);
                      const canAfford = creditBalance >= cost;
                      const wouldComplete = condition.condition + action.conditionRestored >= 100;
                      
                      return (
                        <div key={actionKey} className={`maintenanceOption ${!canAfford ? 'disabled' : ''}`}>
                          <div className="optionHeader">
                            <span className="optionName">{action.name}</span>
                            <span className="optionCost">{cost.toLocaleString()} credits</span>
                          </div>
                          
                          <div className="optionDetails">
                            <p>{action.description}</p>
                            <div className="optionStats">
                              <div>🔧 Restores: +{action.conditionRestored} condition</div>
                              <div>⏱️ Downtime: {action.duration}h</div>
                              <div>🛡️ Protection: {action.preventsDegradation} days</div>
                              {action.upgradeBonus && (
                                <div>⚡ Bonus: +{Math.floor(action.upgradeBonus * 100)}% permanent efficiency</div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleMaintenance(selectedBusiness, actionKey as keyof typeof MAINTENANCE_ACTIONS)}
                            disabled={!canAfford || condition.isOffline}
                            className="performMaintenanceBtn"
                          >
                            {condition.isOffline ? 'Under Maintenance' : 
                             !canAfford ? 'Insufficient Credits' : 
                             `Perform ${action.name}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Maintenance History */}
                  {condition.maintenanceHistory.length > 0 && (
                    <div className="maintenanceHistory">
                      <h4>📊 Maintenance History</h4>
                      <div className="historyList">
                        {condition.maintenanceHistory.slice(-5).reverse().map(record => (
                          <div key={record.id} className="historyItem">
                            <div className="historyHeader">
                              <span className="historyType">{record.type}</span>
                              <span className="historyDate">{new Date(record.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="historyDetails">
                              <span>Cost: {record.cost} credits</span>
                              <span>Condition: {record.conditionBefore}% → {record.conditionAfter}%</span>
                              {record.downtime > 0 && <span>Downtime: {record.downtime}h</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      <style jsx>{`
        .maintenanceCenter {
          padding: 20px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          color: white;
        }

        .maintenanceHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .title h2 {
          margin: 0;
          font-size: 24px;
          color: #3b82f6;
        }

        .title p {
          margin: 5px 0 0 0;
          color: #9aa7bd;
        }

        .stats {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .stat {
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .stat .label {
          font-size: 12px;
          color: #9aa7bd;
          margin-bottom: 4px;
        }

        .stat .value {
          font-size: 16px;
          font-weight: 600;
          color: #10b981;
        }

        .budgetInput {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          padding: 8px;
          color: white;
          text-align: center;
          width: 100px;
        }

        .refreshBtn {
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          padding: 10px 16px;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .refreshBtn:hover {
          background: #2563eb;
        }

        .notifications {
          margin-bottom: 30px;
        }

        .notifications h3 {
          margin: 0 0 15px 0;
          color: #f59e0b;
        }

        .notification {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .notification.warning {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: #f59e0b;
        }

        .notification.critical {
          background: rgba(239, 68, 68, 0.1);
          border-left-color: #ef4444;
        }

        .notification.broken {
          background: rgba(107, 114, 128, 0.1);
          border-left-color: #6b7280;
        }

        .notificationContent .message {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .notificationContent .action {
          font-size: 14px;
          color: #9aa7bd;
        }

        .dismissBtn {
          background: none;
          border: none;
          color: #9aa7bd;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
        }

        .recommendations {
          margin-bottom: 30px;
        }

        .recommendations h3 {
          margin: 0 0 15px 0;
          color: #10b981;
        }

        .recommendationGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }

        .recommendation {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          padding: 15px;
        }

        .recHeader {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .businessName {
          font-weight: 600;
          color: white;
        }

        .priority {
          font-size: 12px;
          color: #10b981;
        }

        .recAction {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .actionName {
          color: #9aa7bd;
        }

        .cost {
          color: #f59e0b;
          font-weight: 600;
        }

        .performBtn {
          width: 100%;
          background: #10b981;
          border: none;
          border-radius: 6px;
          padding: 10px;
          color: white;
          cursor: pointer;
        }

        .performBtn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .businessGrid h3 {
          margin: 0 0 20px 0;
          color: #3b82f6;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .businessCard {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .businessCard:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .businessCard.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .businessHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .businessName {
          font-weight: 600;
          font-size: 16px;
        }

        .businessCategory {
          font-size: 12px;
          color: #9aa7bd;
          text-transform: uppercase;
        }

        .conditionBar {
          margin-bottom: 15px;
        }

        .conditionLabel {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .conditionProgress {
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .conditionFill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .businessStats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .businessStats .stat {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .businessStats .label {
          font-size: 12px;
          color: #9aa7bd;
        }

        .businessStats .value {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .offlineStatus {
          margin-top: 15px;
          padding: 10px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 6px;
          text-align: center;
          color: #f59e0b;
        }

        .offlineTime {
          font-size: 12px;
          margin-top: 4px;
        }

        .maintenanceModal {
          position: fixed;
          inset: 0;
          z-index: 1000;
        }

        .modalOverlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.8);
        }

        .modalContent {
          position: relative;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          margin: 5vh auto;
          background: #1e293b;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          overflow-y: auto;
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .modalHeader h3 {
          margin: 0;
          color: #3b82f6;
        }

        .modalHeader button {
          background: none;
          border: none;
          color: #9aa7bd;
          cursor: pointer;
          font-size: 20px;
        }

        .currentStatus {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .statusRow {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .maintenanceOptions {
          padding: 20px;
        }

        .maintenanceOption {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
        }

        .maintenanceOption.disabled {
          opacity: 0.5;
        }

        .optionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .optionName {
          font-weight: 600;
          font-size: 16px;
        }

        .optionCost {
          color: #f59e0b;
          font-weight: 600;
        }

        .optionDetails p {
          color: #9aa7bd;
          margin-bottom: 10px;
        }

        .optionStats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .performMaintenanceBtn {
          width: 100%;
          background: #10b981;
          border: none;
          border-radius: 6px;
          padding: 12px;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .performMaintenanceBtn:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .maintenanceHistory {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .maintenanceHistory h4 {
          margin: 0 0 15px 0;
          color: #9aa7bd;
        }

        .historyList {
          max-height: 200px;
          overflow-y: auto;
        }

        .historyItem {
          background: rgba(255,255,255,0.03);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
        }

        .historyHeader {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .historyType {
          font-weight: 600;
          text-transform: capitalize;
        }

        .historyDate {
          color: #9aa7bd;
          font-size: 12px;
        }

        .historyDetails {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #9aa7bd;
        }

        @media (max-width: 768px) {
          .maintenanceHeader {
            flex-direction: column;
            gap: 15px;
          }

          .stats {
            flex-wrap: wrap;
            justify-content: center;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .modalContent {
            width: 95%;
            margin: 2.5vh auto;
          }
        }
      `}</style>
    </div>
  );
}
