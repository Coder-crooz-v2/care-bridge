import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const Disclaimer = () => {
  return (
    <Card className="border-red-500 bg-red-50">
      <CardHeader className="flex flex-row items-center gap-2 p-4 sm:p-6">
        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
        <CardTitle className="text-red-700 text-sm sm:text-base">
          Medical Disclaimer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className="text-red-600 text-xs sm:text-sm">
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
