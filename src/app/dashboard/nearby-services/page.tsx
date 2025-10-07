"use client";

import { Building2, Pill, Phone, MapPin, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ClinicPharmacy {
  id: string;
  name: string;
  type: "clinic" | "pharmacy";
  address: string;
  distance: string;
  phone: string;
  rating: number;
  isOpen: boolean;
  specialties?: string[];
  services?: string[];
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
    specialties: ["Emergency Care", "Cardiology", "Orthopedics"],
    services: ["24/7 Emergency", "Lab Tests", "X-Ray"],
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
    specialties: ["General Medicine", "Pediatrics", "Dermatology"],
    services: ["Consultation", "Vaccination", "Health Checkup"],
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
    specialties: ["Emergency Care", "Trauma Care", "Surgery"],
    services: ["24/7 Emergency", "Surgery", "ICU"],
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
    services: [
      "Prescription",
      "OTC Medicines",
      "Health Products",
      "Consultation",
    ],
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
    services: ["Prescription", "Generic Medicines", "Medical Devices"],
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
    services: ["24/7 Service", "Home Delivery", "Emergency Medicines"],
  },
];

export default function NearbyServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleContact = (phone: string, name: string) => {
    // Dummy contact functionality
    alert(`Calling ${name} at ${phone}`);
  };

  const filteredData = nearbyData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "clinics" && item.type === "clinic") ||
      (activeTab === "pharmacies" && item.type === "pharmacy");

    return matchesSearch && matchesTab;
  });

  const clinics = filteredData.filter((item) => item.type === "clinic");
  const pharmacies = filteredData.filter((item) => item.type === "pharmacy");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nearby Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Find nearby clinics and pharmacies in your area
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clinics and pharmacies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({filteredData.length})</TabsTrigger>
            <TabsTrigger value="clinics">
              Clinics ({clinics.length})
            </TabsTrigger>
            <TabsTrigger value="pharmacies">
              Pharmacies ({pharmacies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Clinics */}
            {clinics.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-primary">
                    Clinics
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clinics.map((clinic) => (
                    <ServiceCard
                      key={clinic.id}
                      item={clinic}
                      onContact={handleContact}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pharmacies */}
            {pharmacies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="h-5 w-5 text-success" />
                  <h2 className="text-xl font-semibold text-success">
                    Pharmacies
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pharmacies.map((pharmacy) => (
                    <ServiceCard
                      key={pharmacy.id}
                      item={pharmacy}
                      onContact={handleContact}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="clinics">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clinics.map((clinic) => (
                <ServiceCard
                  key={clinic.id}
                  item={clinic}
                  onContact={handleContact}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pharmacies">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pharmacies.map((pharmacy) => (
                <ServiceCard
                  key={pharmacy.id}
                  item={pharmacy}
                  onContact={handleContact}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No services found matching your search.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  item,
  onContact,
}: {
  item: ClinicPharmacy;
  onContact: (phone: string, name: string) => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {item.type === "clinic" ? (
                <Building2 className="h-4 w-4 text-primary" />
              ) : (
                <Pill className="h-4 w-4 text-success" />
              )}
              <span className="text-sm text-muted-foreground capitalize">
                {item.type}
              </span>
            </div>
          </div>
          <Badge
            variant={item.isOpen ? "default" : "secondary"}
            className={`${
              item.isOpen
                ? "bg-success text-success-foreground hover:bg-success"
                : "bg-destructive text-destructive-foreground hover:bg-destructive"
            }`}
          >
            {item.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{item.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              {item.distance}
            </span>
            <span className="text-sm text-muted-foreground">
              ★ {item.rating}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContact(item.phone, item.name)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>

        {item.specialties && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Specialties:
            </p>
            <div className="flex flex-wrap gap-1">
              {item.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.services && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Services:
            </p>
            <div className="flex flex-wrap gap-1">
              {item.services.map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
