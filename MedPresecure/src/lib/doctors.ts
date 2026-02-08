export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  location: string;
  rating: number;
  experience: number;
  gender: 'Male' | 'Female' | 'Other';
  isAvailableToday: boolean;
  acceptingNewPatients: boolean;
};


// This is mock data. In a real application, you would fetch this from your database.
export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. John Doe',
    specialty: 'Cardiology',
    avatar: 'https://i.pravatar.cc/150?img=1',
    location: 'New York, NY',
    rating: 4.8,
    experience: 15,
    gender: 'Male',
    isAvailableToday: true,
    acceptingNewPatients: true,
  },
  {
    id: '2',
    name: 'Dr. Jane Smith',
    specialty: 'Dermatology',
    avatar: 'https://i.pravatar.cc/150?img=2',
    location: 'Los Angeles, CA',
    rating: 4.9,
    experience: 12,
    gender: 'Female',
    isAvailableToday: false,
    acceptingNewPatients: true,
  },
  {
    id: '3',
    name: 'Dr. Mike Williams',
    specialty: 'Pediatrics',
    avatar: 'https://i.pravatar.cc/150?img=3',
    location: 'Chicago, IL',
    rating: 4.7,
    experience: 10,
    gender: 'Male',
    isAvailableToday: true,
    acceptingNewPatients: false,
  },
  {
    id: '4',
    name: 'Dr. Emily Jones',
    specialty: 'Neurology',
    avatar: 'https://i.pravatar.cc/150?img=4',
    location: 'Houston, TX',
    rating: 4.6,
    experience: 8,
    gender: 'Female',
    isAvailableToday: true,
    acceptingNewPatients: true,
  },
    {
    id: '5',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    avatar: 'https://i.pravatar.cc/150?img=5',
    location: 'New York, NY',
    rating: 4.9,
    experience: 20,
    gender: 'Female',
    isAvailableToday: false,
    acceptingNewPatients: true,
  },
  {
    id: '6',
    name: 'Dr. David Lee',
    specialty: 'Dermatology',
    avatar: 'https://i.pravatar.cc/150?img=6',
    location: 'Los Angeles, CA',
    rating: 4.5,
    experience: 7,
    gender: 'Male',
    isAvailableToday: true,
    acceptingNewPatients: false,
  },
  {
    id: '7',
    name: 'Dr. Maria Garcia',
    specialty: 'Pediatrics',
    avatar: 'https://i.pravatar.cc/150?img=7',
    location: 'Chicago, IL',
    rating: 4.8,
    experience: 14,
    gender: 'Female',
    isAvailableToday: false,
    acceptingNewPatients: true,
  },
  {
    id: '8',
    name: 'Dr. James Brown',
    specialty: 'Neurology',
    avatar: 'https://i.pravatar.cc/150?img=8',
    location: 'Houston, TX',
    rating: 4.7,
    experience: 18,
    gender: 'Male',
    isAvailableToday: true,
    acceptingNewPatients: true,
  },
];

    