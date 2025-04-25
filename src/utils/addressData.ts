// Sample data for address autocomplete
// In a real application, this would be fetched from an API

export interface AddressOption {
  id: string;
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export const commonAddresses: AddressOption[] = [
  {
    id: '1',
    fullAddress: '123 Main St, New York, NY 10001, USA',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  {
    id: '2',
    fullAddress: '456 Park Ave, Boston, MA 02108, USA',
    street: '456 Park Ave',
    city: 'Boston',
    state: 'MA',
    zipCode: '02108',
    country: 'USA'
  },
  {
    id: '3',
    fullAddress: '789 Oak Blvd, San Francisco, CA 94103, USA',
    street: '789 Oak Blvd',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    country: 'USA'
  },
  {
    id: '4',
    fullAddress: '101 Pine St, Seattle, WA 98101, USA',
    street: '101 Pine St',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'USA'
  },
  {
    id: '5',
    fullAddress: '202 Maple Dr, Chicago, IL 60601, USA',
    street: '202 Maple Dr',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA'
  }
];

// Function to search addresses (simulates API call)
export const searchAddresses = (query: string): Promise<AddressOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredAddresses = commonAddresses.filter(
        address => address.fullAddress.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filteredAddresses);
    }, 300); // Simulate network delay
  });
};