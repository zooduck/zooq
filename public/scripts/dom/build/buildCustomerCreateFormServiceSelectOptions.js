function buildCustomerCreateFormServiceSelectOptions() {
  resetCustomerCreateForm();
  // ===========================================================
  // CUSTOMER CREATE FORM: BUILD SERVICE OPTIONS FOR <select>
  // ===========================================================
  const services = zooqueue.getCurrentQueue().serviceIds.map( (serviceId) => {
    return zooqueue.getService(serviceId);
  });

  for (let service of services) {
    console.log("service", service);
    if (!service.queuing_disabled) {
      buildServiceOption(service);
    }
  }
}
