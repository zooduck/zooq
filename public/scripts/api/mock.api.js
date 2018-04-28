const servicesMock = [
  {
    id: 1,
    company_id: 37001,
    name: 'Wash and Scrub MOCK',
    durations: [30],
    queuing_disabled: false,
    colour: 'D00C32',
  },
  {
    id: 2,
    company_id: 37001,
    name: 'Tire Fit MOCK',
    durations: [10],
    queuing_disabled: false,
    colour: 'FF49C0'
  },
  {
    id: 3,
    company_id: 37001,
    name: 'Wheel Balance MOCK',
    durations: [15],
    queuing_disabled: false,
    colour: '63BC1F',
  },
  {
    id: 4,
    company_id: 37001,
    name: 'MOT MOCK',
    durations: [60],
    queuing_disabled: false
  }
];

const staffMock = [
  {
    id: 1,
    name: 'Kermit the Frog',
    queuing_disabled: false,
    attendance_status: 1,
    attendance_started: '2018-04-23T14:47:01Z',
    service_ids: [1, 2, 3, 4],
    _links: {
      images: {
        href: null
      }
    }
  },
  {
    id: 2,
    name: 'Marty McFly',
    queuing_disabled: false,
    attendance_status: 1,
    attendance_started: '2018-04-23T14:47:01Z',
    service_ids: [2, 4],
    _links: {
      images: {
        href: null
      }
    }
  }
];

const mockApi = () => {
  return new Promise( (resolve, reject) => {
    resolve({
      services: servicesMock,
      staff: staffMock
    });
  });
}
