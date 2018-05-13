// ===================================================================
// NOTE: PURPOSE OF THIS FILE IS TO MOCK AN EXTERNAL THIRD-PARTY API
// THAT IS PROVIDING THE SERVICES AND STAFF FOR THE QUEUE
// ===================================================================
const mockApi = (function mockApi() {
  const mockData = {
    services: [
      {
        id: 1,
        company_id: 123456,
        name: 'Wash and Scrub',
        durations: [30],
        queuing_disabled: false,
        colour: 'D00C32',
      },
      {
        id: 2,
        company_id: 123456,
        name: 'Tire Fit',
        durations: [10],
        queuing_disabled: false,
        colour: 'FF49C0'
      },
      {
        id: 3,
        company_id: 123456,
        name: 'Wheel Balance',
        durations: [15],
        queuing_disabled: false,
        colour: '63BC1F',
      },
      {
        id: 4,
        company_id: 123456,
        name: 'MOT',
        durations: [60],
        queuing_disabled: false
      }
    ],
    staff: [
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
        name: 'Twilight Sparkle',
        queuing_disabled: false,
        attendance_status: 1,
        attendance_started: '2018-04-23T14:47:01Z',
        service_ids: [1, 3],
        _links: {
          images: {
            href: null
          }
        }
      },
      {
        id: 3,
        name: 'Hanazuki',
        queuing_disabled: false,
        attendance_status: 1,
        attendance_started: '2018-04-23T14:47:01Z',
        service_ids: [1, 4],
        _links: {
          images: {
            href: null
          }
        }
      },
      {
        id: 4,
        name: 'Daffy Duck',
        queuing_disabled: false,
        attendance_status: 1,
        attendance_started: '2018-04-23T14:47:01Z',
        service_ids: [4],
        _links: {
          images: {
            href: null
          }
        }
      }
    ]
  };
  return function () {
    return {
      staffAndServicesGet() {
        return new Promise( (resolve, reject) => {
          const promisesToResolve = new Array(2);
          zooqApi().servicesSet(JSON.stringify(mockData.services)).then( (results) => {
            promisesToResolve.pop();
            if (promisesToResolve.length == 0) return resolve(mockData);
          });
          zooqApi().staffSet(JSON.stringify(mockData.staff)).then( (results) => {
            promisesToResolve.pop();
            if (promisesToResolve.length == 0) return resolve(mockData);
          });
        });
      }
    }
  }
})();
