export type LocationTree = Record<string, Record<string, string[]>>;

// State → District → Areas (30 per district)
export const LOCATIONS: LocationTree = {
  "Tamil Nadu": {
    Coimbatore: [
      "Vadavalli", "RS Puram", "Saibaba Colony", "Gandhipuram", "Peelamedu", "Singanallur",
      "Ukkadam", "Saravanampatti", "Thudiyalur", "Ganapathy", "Kalapatti", "Kovaipudur",
      "Sulur", "Podanur", "Race Course", "Ramanathapuram", "Selvapuram", "Kuniyamuthur",
      "Vellalore", "Madukkarai", "Kavundampalayam", "Kurichi", "Nanjundapuram", "Ondipudur",
      "Trichy Road", "Avinashi Road", "Mettupalayam Road", "Marudhamalai", "Karamadai", "Pollachi",
    ],
    Chennai: [
      "T Nagar", "Anna Nagar", "Velachery", "Adyar", "Tambaram", "Porur",
      "Koyambedu", "Kilpauk", "Nungambakkam", "Mylapore", "Guindy", "Chromepet",
      "Perambur", "Ambattur", "Avadi", "Pallavaram", "Mogappair", "Egmore",
      "Royapettah", "Vadapalani", "Ashok Nagar", "Saidapet", "Perungudi", "Thoraipakkam",
      "OMR", "Sholinganallur", "Medavakkam", "Madipakkam", "Besant Nagar", "Triplicane",
    ],
    Madurai: [
      "Anna Nagar", "KK Nagar", "Tallakulam", "Goripalayam", "Simmakkal", "Villapuram",
      "Thiruparankundram", "Thirumangalam", "Melur", "Usilampatti", "Sellur", "Arappalayam",
      "Mattuthavani", "Bypass Road", "Iyer Bungalow", "Vilangudi", "Avaniyapuram", "Othakadai",
      "Vandiyur", "Ponmeni", "Kochadai", "Alagar Kovil Road", "Chinna Chokkikulam", "Palanganatham",
      "Tirupparankundram", "Kalavasal", "Ellis Nagar", "Race Course", "Pasumalai", "Nagamalai",
    ],
    Salem: [
      "Hasthampatti", "Fairlands", "Suramangalam", "Ammapet", "Shevapet", "Alagapuram",
      "Kondalampatti", "Kannankurichi", "Yercaud Road", "Attur", "Omalur", "Mettur",
      "Sankari", "Edappadi", "Gugai", "Ponnammapet", "Kitchipalayam", "Karuppur",
      "Muthu Nagar", "Rasipuram Road", "New Bus Stand", "Old Bus Stand", "Junction", "Steel Plant",
      "Sarada College Road", "Five Roads", "Reddiyur", "Kandhampatti", "Chinnathirupathi", "Ayothiyapattinam",
    ],
  },
  Karnataka: {
    Bengaluru: [
      "Indiranagar", "Koramangala", "Whitefield", "Jayanagar", "HSR Layout", "Marathahalli",
      "BTM Layout", "Electronic City", "Malleshwaram", "Rajajinagar", "Hebbal", "Yelahanka",
      "JP Nagar", "Banashankari", "Basavanagudi", "Ulsoor", "Frazer Town", "MG Road",
      "Sarjapur Road", "Bellandur", "Bommanahalli", "KR Puram", "Hennur", "Kalyan Nagar",
      "RT Nagar", "Vijayanagar", "Yeshwanthpur", "Peenya", "Kengeri", "Nagarbhavi",
    ],
    Mysuru: [
      "Vijayanagar", "Kuvempunagar", "Jayalakshmipuram", "Gokulam", "Saraswathipuram", "Lakshmipuram",
      "Nazarbad", "Hebbal", "Bogadi", "Hootagalli", "Vidyaranyapuram", "Chamundipuram",
      "Yadavagiri", "Bannimantap", "Rajivnagar", "Siddarthanagar", "Metagalli", "Bannur Road",
      "Hunsur Road", "Nanjangud Road", "Bengaluru Road", "Ramakrishna Nagar", "Ashokpuram", "Krishnamurthy Puram",
      "Devaraja Mohalla", "Chamundi Hills", "Ittigegud", "Ballal Circle", "KRS Road", "Manasagangotri",
    ],
  },
  Kerala: {
    Kochi: [
      "Kakkanad", "Edappally", "Vyttila", "Fort Kochi", "Mattancherry", "Palarivattom",
      "Kaloor", "Panampilly Nagar", "Kadavanthra", "Thevara", "Ravipuram", "MG Road",
      "Aluva", "Angamaly", "Perumbavoor", "Tripunithura", "Thammanam", "Elamakkara",
      "Ernakulam South", "Ernakulam North", "Vennala", "Thrikkakara", "Chittethukara", "Infopark",
      "Kalamassery", "Cheranalloor", "Vypin", "Willingdon Island", "Marine Drive", "Panangad",
    ],
    Thiruvananthapuram: [
      "Kowdiar", "Pattom", "Technopark", "Kazhakkoottam", "Sasthamangalam", "Vellayambalam",
      "Peroorkada", "Nedumangad", "Attingal", "Neyyattinkara", "Kesavadasapuram", "Ulloor",
      "Medical College", "Palayam", "Vazhuthacaud", "Thampanoor", "Chalai", "Fort",
      "East Fort", "Manacaud", "Poojappura", "Karamana", "Killipalam", "Vellanad",
      "Sreekaryam", "Kariavattom", "Balaramapuram", "Vizhinjam", "Kovalam", "Varkala",
    ],
  },
};

export const STATES = Object.keys(LOCATIONS);
export function districtsOf(state: string) { return Object.keys(LOCATIONS[state] ?? {}); }
export function areasOf(state: string, district: string) { return LOCATIONS[state]?.[district] ?? []; }
