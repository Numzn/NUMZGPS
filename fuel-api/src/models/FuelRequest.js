import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const FuelRequest = sequelize.define('FuelRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Traccar device ID'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Traccar user ID (driver)'
    },
    currentFuelLevel: {
      type: DataTypes.DOUBLE,
      comment: 'Current fuel level percentage or liters'
    },
    requestedAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Requested fuel amount in liters'
    },
    fuelUnit: {
      type: DataTypes.STRING(10),
      defaultValue: 'L',
      comment: 'Unit: L (liters) or gal (gallons)'
    },
    reason: {
      type: DataTypes.STRING,
      comment: 'Reason for fuel request'
    },
    urgency: {
      type: DataTypes.ENUM('normal', 'urgent', 'emergency'),
      defaultValue: 'normal',
      comment: 'Request urgency level'
    },
    latitude: {
      type: DataTypes.DOUBLE,
      comment: 'Request location latitude'
    },
    longitude: {
      type: DataTypes.DOUBLE,
      comment: 'Request location longitude'
    },
    address: {
      type: DataTypes.STRING(512),
      comment: 'Formatted address'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'fulfilled', 'cancelled'),
      defaultValue: 'pending',
      comment: 'Current request status'
    },
    requestTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'When request was created'
    },
    reviewTime: {
      type: DataTypes.DATE,
      comment: 'When manager reviewed the request'
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      comment: 'Traccar user ID of manager who reviewed'
    },
    fulfillmentTime: {
      type: DataTypes.DATE,
      comment: 'When request was fulfilled'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Manager notes or rejection reason'
    },
    estimatedCost: {
      type: DataTypes.DOUBLE,
      comment: 'Estimated cost in local currency'
    },
    approvedAmount: {
      type: DataTypes.DOUBLE,
      comment: 'Manager approved amount (can differ from requested)'
    },
    validationWarnings: {
      type: DataTypes.JSON,
      comment: 'Validation warnings and issues'
    },
    managerSuggestion: {
      type: DataTypes.DOUBLE,
      comment: 'System-calculated optimal amount'
    },
    overrideReason: {
      type: DataTypes.TEXT,
      comment: 'Reason for overriding validation warnings'
    }
  }, {
    tableName: 'fuel_requests',
    timestamps: true,
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['requestTime'] }
    ]
  });

  return FuelRequest;
};





















