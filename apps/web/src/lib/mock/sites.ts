import { Site } from "@/types";

export const initialMockSites: Site[] = [
    {
        id: "site-1",
        name: "Damosa Gateway Phase 2",
        location: "Lanang, Davao City",
        coordinates: {
            lat: 7.1, // approximate
            lng: 125.645,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "site-2",
        name: "SM Davao Expansion Block C",
        location: "Ecoland, Davao City",
        coordinates: {
            lat: 7.0543,
            lng: 125.5947,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "site-3",
        name: "Samal Island Resort Development",
        location: "Samal Island",
        coordinates: {
            lat: 7.0766,
            lng: 125.6881,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "site-4",
        name: "Davao River Bridge Rehab",
        location: "Davao River",
        coordinates: {
            lat: 7.07,
            lng: 125.6,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: "site-5",
        name: "Samal Road Project",
        location: "Samal Island",
        coordinates: {
            lat: 7.08,
            lng: 125.69,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
    },
];
