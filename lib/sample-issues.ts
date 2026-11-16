export type IssueItem = {
  id: number;
  author_name: string;
  author_phone: string | null;
  description: string;
  city: string;
  needs: string | null;
  images: string[];
  video: string | null;
  pdf: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_note?: string | null;
  created_at: string;
};

export const SAMPLE_ISSUES: IssueItem[] = [
  {
    id: 1,
    author_name: 'Dr. Manjunath Swamy',
    author_phone: '9448011223',
    description: 'We have compiled an all-in-one photo evidence dossier of the facility and site conditions into a single compressed PDF (under 15 MB). The attached PDF contains full-page photographic proofs of the location.',
    city: 'Channapatna',
    needs: 'Deputation of full-time Medical Officer, appointment of night-duty nursing staff, and stationing of a 108 Emergency Ambulance.',
    images: [],
    video: null,
    pdf: '/documents/complaint-petition-sample.pdf',
    status: 'open',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 2,
    author_name: 'Ramesh Kumar',
    author_phone: '9876543210',
    description: 'The main road connecting the market to the bus stand has developed severe potholes over the last 3 months. Vehicles are getting damaged daily and several two-wheeler riders have suffered injuries. During rainfall, the potholes fill up and become invisible death traps for riders.',
    city: 'Bengaluru',
    needs: 'Urgent asphalt patching and road resurfacing needed from BBMP / PWD.',
    images: ['/images/gallery/rally-crowd.jpg', '/images/gallery/rally-flags.jpg'],
    video: '/video/hero-mobile.mp4',
    pdf: null,
    status: 'open',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 3,
    author_name: 'Lakshmi Devi',
    author_phone: '9845012345',
    description: 'Our ward has been suffering from acute drinking water shortage for over 2 weeks. The main municipal supply pipeline broke near the junction and thousands of litres of water are getting wasted into the gutter while residents have to wait in queues for commercial tankers at exorbitant rates. Attached is the signed petition submitted to the Assistant Executive Engineer.',
    city: 'Mysuru',
    needs: 'Immediate pipeline repair by water board and deployment of free emergency drinking water tankers.',
    images: ['/images/gallery/mysore-palace.jpg', '/images/gallery/waterfall.jpg'],
    video: null,
    pdf: null,
    status: 'in_progress',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 4,
    author_name: 'Suresh Gowda',
    author_phone: '9901234567',
    description: 'Unregulated garbage dumping near the primary school premises has created a severe health hazard. Stray dogs and cattle congregate there, and the stench makes it impossible for children to attend classes. Corporation sanitation trucks have not visited this lane for 20 days.',
    city: 'Hubballi',
    needs: 'Clear accumulated waste, disinfect the surroundings with bleaching powder, and resume daily garbage collection.',
    images: ['/images/gallery/vidhana-soudha.jpg'],
    video: '/video/hero.mp4',
    pdf: null,
    status: 'open',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 5,
    author_name: 'Kavitha R',
    author_phone: '7766554433',
    description: 'The roof of the government high school building is leaking badly and structural cracks have appeared on the side walls. Two classrooms had to be closed down for safety reasons, forcing students to sit in the open corridor. 120 children study here.',
    city: 'Mandya',
    needs: 'Emergency civil repair works to waterproof the roof and reinforce structural columns.',
    images: ['/images/gallery/heritage-chariot.jpg', '/images/gallery/veerangane.jpg', '/images/gallery/hill-fort.jpg'],
    video: null,
    pdf: null,
    status: 'resolved',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];
