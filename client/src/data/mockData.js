const mockStats = {
  totalVotes: 1247,
  totalElections: 8,
  totalCandidates: 24,
  activeElections: 3
};
const mockElections = [
  {
    id: "1",
    name: "Student Council President",
    description: "Vote for the next Student Council President for the academic year 2024-25.",
    startDate: "2024-03-01",
    endDate: "2024-03-15",
    status: "active",
    candidateCount: 4,
    totalVotes: 342,
    resultsPublished: false
  },
  {
    id: "2",
    name: "Cultural Secretary",
    description: "Election for the Cultural Secretary who will lead all cultural events.",
    startDate: "2024-03-05",
    endDate: "2024-03-20",
    status: "active",
    candidateCount: 3,
    totalVotes: 218,
    resultsPublished: false
  },
  {
    id: "3",
    name: "Sports Captain",
    description: "Choose the Sports Captain to represent the college in inter-college events.",
    startDate: "2024-03-10",
    endDate: "2024-03-25",
    status: "active",
    candidateCount: 5,
    totalVotes: 156,
    resultsPublished: false
  },
  {
    id: "4",
    name: "Tech Club Lead",
    description: "Election for the Technical Club Lead for 2024-25.",
    startDate: "2024-04-01",
    endDate: "2024-04-15",
    status: "upcoming",
    candidateCount: 3,
    totalVotes: 0,
    resultsPublished: false
  },
  {
    id: "5",
    name: "Class Representative - CS",
    description: "Computer Science department Class Representative election.",
    startDate: "2024-01-15",
    endDate: "2024-01-30",
    status: "closed",
    candidateCount: 4,
    totalVotes: 187,
    resultsPublished: true
  },
  {
    id: "6",
    name: "Library Committee Head",
    description: "Elect the Library Committee Head for better library management.",
    startDate: "2024-02-01",
    endDate: "2024-02-14",
    status: "closed",
    candidateCount: 2,
    totalVotes: 134,
    resultsPublished: true
  }
];
const mockCandidates = [
  { id: "1", name: "Rahul Verma", department: "Computer Science", year: "3rd Year", photo: "", electionId: "1", votes: 120 },
  { id: "2", name: "Priya Patel", department: "Electronics", year: "3rd Year", photo: "", electionId: "1", votes: 98 },
  { id: "3", name: "Amit Singh", department: "Mechanical", year: "4th Year", photo: "", electionId: "1", votes: 67 },
  { id: "4", name: "Sneha Gupta", department: "Computer Science", year: "2nd Year", photo: "", electionId: "1", votes: 57 },
  { id: "5", name: "Vikram Desai", department: "Civil", year: "3rd Year", photo: "", electionId: "2", votes: 102 },
  { id: "6", name: "Neha Joshi", department: "IT", year: "3rd Year", photo: "", electionId: "2", votes: 78 },
  { id: "7", name: "Arjun Reddy", department: "Electronics", year: "2nd Year", photo: "", electionId: "2", votes: 38 },
  { id: "8", name: "Kavya Nair", department: "Computer Science", year: "4th Year", photo: "", electionId: "3", votes: 56 },
  { id: "9", name: "Rohan Mehta", department: "Mechanical", year: "3rd Year", photo: "", electionId: "3", votes: 44 },
  { id: "10", name: "Divya Sharma", department: "IT", year: "2nd Year", photo: "", electionId: "3", votes: 33 },
  { id: "11", name: "Karan Kapoor", department: "Civil", year: "3rd Year", photo: "", electionId: "3", votes: 15 },
  { id: "12", name: "Anita Roy", department: "Computer Science", year: "3rd Year", photo: "", electionId: "3", votes: 8 },
  { id: "13", name: "Suresh Kumar", department: "Computer Science", year: "3rd Year", photo: "", electionId: "5", votes: 89 },
  { id: "14", name: "Meera Iyer", department: "Computer Science", year: "2nd Year", photo: "", electionId: "5", votes: 62 },
  { id: "15", name: "Deepak Shah", department: "Computer Science", year: "3rd Year", photo: "", electionId: "5", votes: 22 },
  { id: "16", name: "Pooja Rao", department: "Computer Science", year: "4th Year", photo: "", electionId: "5", votes: 14 }
];
const votesPerElection = [
  { name: "Student Council", votes: 342 },
  { name: "Cultural Sec.", votes: 218 },
  { name: "Sports Captain", votes: 156 },
  { name: "Class Rep CS", votes: 187 },
  { name: "Library Head", votes: 134 }
];
const electionStatusData = [
  { name: "Active", value: 3, fill: "hsl(152, 69%, 40%)" },
  { name: "Upcoming", value: 1, fill: "hsl(210, 92%, 55%)" },
  { name: "Closed", value: 2, fill: "hsl(215, 16%, 47%)" }
];
const candidatesPerElection = [
  { name: "Student Council", candidates: 4 },
  { name: "Cultural Sec.", candidates: 3 },
  { name: "Sports Captain", candidates: 5 },
  { name: "Tech Club", candidates: 3 },
  { name: "Class Rep CS", candidates: 4 },
  { name: "Library Head", candidates: 2 }
];
export {
  candidatesPerElection,
  electionStatusData,
  mockCandidates,
  mockElections,
  mockStats,
  votesPerElection
};
