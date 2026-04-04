import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Star } from "lucide-react";

interface PendingFeedbackDialogProps {
  complaints: any[];
  onOpenChange: (open: boolean) => void;
}

const PendingFeedbackDialog = ({ complaints, onOpenChange }: PendingFeedbackDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange(isOpen);
  };

  if (!complaints || complaints.length === 0) return null;

  const complaint = complaints[0]; // Just prompt for the most recent one

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            {t("feedbackPrompt.title", "Complaint Resolved")}
          </DialogTitle>
          <DialogDescription>
            {t("feedbackPrompt.desc", "A recent complaint of yours has been marked as resolved by our team.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted p-4 rounded-md my-4">
          <p className="text-xs text-muted-foreground font-mono mb-1">{complaint.complaintId}</p>
          <h4 className="font-medium">{complaint.title}</h4>
        </div>

        <p className="text-sm text-center font-medium bg-primary/10 text-primary py-2 rounded">
          {t("feedbackPrompt.rateAsk", "We value your opinion. Please rate your experience.")}
        </p>

        <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
          <button
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 text-sm max-sm:w-full border rounded-md hover:bg-muted font-medium"
          >
            {t("feedbackPrompt.later", "Maybe Later")}
          </button>
          <Link
            to={`/user/complaint/${complaint.complaintId}`}
            onClick={() => handleOpenChange(false)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm max-sm:w-full bg-primary text-primary-foreground rounded-md hover:opacity-90 font-medium"
          >
            <Star className="h-4 w-4 fill-current" />
            {t("feedbackPrompt.giveFeedback", "Provide Feedback")}
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PendingFeedbackDialog;
