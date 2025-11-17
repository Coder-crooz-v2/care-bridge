import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const Disclaimer = () => {
  return (
    <Card className="border-red-500 bg-red-50">
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <CardTitle className="text-red-700">Medical Disclaimer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600">
          This prescription information is AI-generated and may contain errors.
          Always consult with a qualified healthcare professional before taking
          any medication. Do not rely solely on this information for medical
          decisions.
        </p>
      </CardContent>
    </Card>
  );
};

export default Disclaimer;
