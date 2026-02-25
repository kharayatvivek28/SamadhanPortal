import ComplaintForm from "@/components/complaint/ComplaintForm";

const FileComplaint = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-1">File a Complaint</h1>
    <p className="text-muted-foreground text-sm mb-6">Submit a new complaint to the relevant department</p>
    <ComplaintForm />
  </div>
);

export default FileComplaint;
