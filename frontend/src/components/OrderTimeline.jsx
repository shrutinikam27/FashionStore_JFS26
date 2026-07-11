import React from 'react';

const OrderTimeline = ({ order }) => {
  const { status, paymentStatus, trackingNumber } = order;

  const isCod = order.paymentMethod === 'CASH_ON_DELIVERY';

  // Determine status weight
  // Cancelled = -1
  // Placed = 1
  // Shipped / Payment (depends on method) = 2 or 3
  // Delivered = 4
  const getStatusWeight = () => {
    if (status === 'CANCELLED') return -1;
    if (status === 'DELIVERED') return 4;
    
    if (isCod) {
      // COD Timeline order: Placed(1) -> Shipped(2) -> Payment Confirmed(3) -> Delivered(4)
      if (paymentStatus === 'PAID' || paymentStatus === 'SUCCESS') return 3;
      if (status === 'SHIPPED') return 2;
      return 1;
    } else {
      // Card Timeline order: Placed(1) -> Payment Confirmed(2) -> Shipped(3) -> Delivered(4)
      if (status === 'SHIPPED') return 3;
      if (paymentStatus === 'PAID' || paymentStatus === 'SUCCESS') return 2;
      return 1;
    }
  };

  const statusWeight = getStatusWeight();

  // Conditionally construct steps sequence based on payment method
  const steps = isCod ? [
    { weight: 1, label: 'Order Placed', desc: 'Your order has been registered and is pending approval.', icon: 'bi-journal-check' },
    { weight: 2, label: 'Shipped', desc: trackingNumber ? `Package in transit. Carrier Tracking: ${trackingNumber}` : 'Preparing package for carrier shipment.', icon: 'bi-truck' },
    { weight: 3, label: 'Payment Confirmed', desc: paymentStatus === 'PAID' ? 'Payment processed successfully on delivery.' : 'Payment will be collected on delivery.', icon: 'bi-cash-coin' },
    { weight: 4, label: 'Delivered', desc: 'Package delivered at your shipping destination.', icon: 'bi-house-check' },
  ] : [
    { weight: 1, label: 'Order Placed', desc: 'Your order has been registered and is pending approval.', icon: 'bi-journal-check' },
    { weight: 2, label: 'Payment Confirmed', desc: 'Payment processed successfully.', icon: 'bi-credit-card-2-front' },
    { weight: 3, label: 'Shipped', desc: trackingNumber ? `Package in transit. Carrier Tracking: ${trackingNumber}` : 'Preparing package for carrier shipment.', icon: 'bi-truck' },
    { weight: 4, label: 'Delivered', desc: 'Package delivered at your shipping destination.', icon: 'bi-house-check' },
  ];

  if (status === 'CANCELLED') {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-3 py-3 border-0 rounded-lg shadow-sm mb-4">
        <i className="bi bi-x-circle-fill fs-3"></i>
        <div>
          <h6 className="fw-bold mb-1">Order Cancelled</h6>
          <span className="small text-secondary">This order has been cancelled. If any payment was captured, refund processing will initiate automatically.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {steps.map((step) => {
        const isCompleted = statusWeight >= step.weight;
        const isActive = statusWeight === step.weight;
        
        let stateClass = '';
        if (isCompleted) stateClass = 'completed';
        if (isActive) stateClass = 'active';

        return (
          <div key={step.weight} className={`timeline-item ${stateClass}`}>
            <div className="timeline-marker">
              {isCompleted ? (
                <i className="bi bi-check-lg text-white"></i>
              ) : (
                <i className={`bi ${step.icon}`}></i>
              )}
            </div>
            <div className="timeline-content">
              <h6 className="fw-bold mb-1 d-flex align-items-center justify-content-between">
                <span>{step.label}</span>
                {isActive && (
                  <span className="badge bg-primary text-white badge-premium px-2 py-1 fs-xs">
                    Current Stage
                  </span>
                )}
              </h6>
              <p className="text-secondary small mb-0">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
