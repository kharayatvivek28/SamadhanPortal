import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArchiveX, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  complaintId: string;
  onRevoked?: () => void;
}

const RevokeComplaintModal = ({ complaintId, onRevoked }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRevoke = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for revoking this complaint.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/revoke`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        toast({
          title: "Complaint Revoked",
          description: "Your complaint has been successfully revoked.",
        });
        setOpen(false);
        if (onRevoked) onRevoked();
        navigate("/user/my-complaints");
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to revoke complaint");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white transition-colors h-7 text-xs px-3">
          <ArchiveX className="w-3.5 h-3.5 mr-1.5" />
          Revoke
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Revoke Complaint</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this complaint? This action cannot be undone and will remove it from the active processing queue.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-medium mb-2">Reason for revocation <span className="text-destructive">*</span></p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., The issue resolved itself, I filed it by mistake..."
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRevoke} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArchiveX className="w-4 h-4 mr-2" />}
            Confirm Revoke
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevokeComplaintModal;
