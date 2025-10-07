"use client";

import { Building2, Pill, Phone, MapPin } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClinicPharmacy {
  id: string;
  name: string;
  type: "clinic" | "pharmacy";
  address: string;
  distance: string;
  phone: string;
  rating: number;
  isOpen: boolean;
}

const nearbyData: ClinicPharmacy[] = [
  {
    id: "1",
    name: "City General Hospital",
    type: "clinic",
    address: "123 Main St, Downtown",
    distance: "0.8 km",
    phone: "+1 (555) 123-4567",
    rating: 4.5,
    isOpen: true,
  },
  {
    id: "2",
    name: "Family Care Clinic",
    type: "clinic",
    address: "456 Oak Ave, Midtown",
    distance: "1.2 km",
    phone: "+1 (555) 234-5678",
    rating: 4.2,
    isOpen: true,
  },
  {
    id: "3",
    name: "Emergency Medical Center",
    type: "clinic",
    address: "789 Pine St, Uptown",
    distance: "2.1 km",
    phone: "+1 (555) 345-6789",
    rating: 4.7,
    isOpen: false,
  },
  {
    id: "4",
    name: "HealthMart Pharmacy",
    type: "pharmacy",
    address: "321 Cedar Blvd, Central",
    distance: "0.5 km",
    phone: "+1 (555) 456-7890",
    rating: 4.3,
    isOpen: true,
  },
  {
    id: "5",
    name: "MediCare Pharmacy",
    type: "pharmacy",
    address: "654 Elm St, Westside",
    distance: "1.5 km",
    phone: "+1 (555) 567-8901",
    rating: 4.1,
    isOpen: true,
  },
  {
    id: "6",
    name: "QuickMeds 24/7",
    type: "pharmacy",
    address: "987 Maple Dr, Eastside",
    distance: "1.8 km",
    phone: "+1 (555) 678-9012",
    rating: 4.4,
    isOpen: true,
  },
];

export function NavNearbyClinics() {
  const handleContact = (phone: string, name: string) => {
    // Dummy contact functionality
    alert(`Calling ${name} at ${phone}`);
  };

  const clinics = nearbyData.filter((item) => item.type === "clinic");
  const pharmacies = nearbyData.filter((item) => item.type === "pharmacy");

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold">
        Nearby Services
      </SidebarGroupLabel>

      {/* Clinics Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Clinics</span>
        </div>
        <SidebarMenu>
          {clinics.map((clinic) => (
            <SidebarMenuItem key={clinic.id} className="mb-2">
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium leading-tight">
                    {clinic.name}
                  </h4>
                  <Badge
                    variant={clinic.isOpen ? "default" : "secondary"}
                    className={`text-xs ${
                      clinic.isOpen
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {clinic.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {clinic.address}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">
                      {clinic.distance}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ★ {clinic.rating}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleContact(clinic.phone, clinic.name)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>

      {/* Pharmacies Section */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-2">
          <Pill className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">Pharmacies</span>
        </div>
        <SidebarMenu>
          {pharmacies.map((pharmacy) => (
            <SidebarMenuItem key={pharmacy.id} className="mb-2">
              <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium leading-tight">
                    {pharmacy.name}
                  </h4>
                  <Badge
                    variant={pharmacy.isOpen ? "default" : "secondary"}
                    className={`text-xs ${
                      pharmacy.isOpen
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {pharmacy.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {pharmacy.address}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">
                      {pharmacy.distance}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ★ {pharmacy.rating}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleContact(pharmacy.phone, pharmacy.name)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </SidebarGroup>
  );
}
