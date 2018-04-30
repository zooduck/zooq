function buildCustomerCreateFormServiceSelectOptions() {
  resetCustomerCreateForm();
  // ===========================================================
  // CUSTOMER CREATE FORM: BUILD SERVICE OPTIONS FOR <select>
  // ===========================================================
  const services = zooq.getCurrentQueue().serviceIds.map( (serviceId) => {
    return zooq.getService(serviceId);
  });

  for (let service of services) {
    if (!service.queuing_disabled) {
      buildServiceOption(service);
    }
  }
}
