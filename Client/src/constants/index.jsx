import { Video, BriefcaseMedical, Scissors, House } from 'lucide-react';

export const navItems = [
  { label: "Home", path: '/' },
  {
    label: "Services",
    subItems: [
      {
        label: "Video Consultation",
        path: "/vets/video-consultation",
        icon: Video,
        description: "Chat with vets online via video call",
      },
      {
        label: "In-Clinic Visit",
        path: `/vets/in-clinic?city=${localStorage.getItem('userCity') || 'Islamabad'}`,
        icon: BriefcaseMedical,
        description: "Book in-person appointments near you",
      },
      {
        label: "Pet Grooming",
        path: `/groomers?city=${localStorage.getItem('userCity') || 'Islamabad'}`,
        icon: Scissors,
        description: "Professional grooming for your pet",
      },
      {
        label: "Pet Sitting",
        path:`/sitters?city=${localStorage.getItem('userCity') || 'Islamabad'}`,
        icon: House,
        description: "Trusted care for your pets while you’re away",
      },
    ],
  },
  { label: "Lost n Found", path: "lost" },
  { label: "Pet Emotion", path: "/predict-emotion" },
  { label: "Blogs", path: "/blogs" },
  { label: "Adopt a Pet", path: "/find-a-pet" },
];
