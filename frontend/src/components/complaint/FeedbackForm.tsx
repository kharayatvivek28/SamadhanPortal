import { useState } from "react";
import { Star, ImagePlus, X } from "lucide-react";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/context/AuthContext";

interface ExistingFeedback {
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

interface Props {
  complaintId: string;
  existingFeedback?: ExistingFeedback | null;
  onSubmit?: () => void;
}

const FeedbackForm = ({ complaintId, existingFeedback, onSubmit }: Props) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // If feedback already exists, show read-only view
  if (existingFeedback) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-status-resolved/10 text-foreground rounded-lg p-4">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Your feedback</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= existingFeedback.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          {existingFeedback.comment && (
            <p className="text-sm text-muted-foreground italic mb-3">
              "{existingFeedback.comment}"
            </p>
          )}
          {existingFeedback.images && existingFeedback.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {existingFeedback.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Feedback photo ${i + 1}`}
                  className="h-20 w-20 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Submitted on {new Date(existingFeedback.createdAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = images.length + files.length;
    if (totalFiles > 3) {
      setError("You can upload up to 3 images only");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Generate previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError("");
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("complaintId", complaintId);
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      images.forEach((img) => formData.append("images", img));

      const storedUser = localStorage.getItem("samadhan_user");
      const token = storedUser ? JSON.parse(storedUser).token : "";

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit feedback");
      }

      setSubmitted(true);
      // Cleanup preview URLs
      previews.forEach((p) => URL.revokeObjectURL(p));
      onSubmit?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="bg-status-resolved/10 text-foreground rounded-lg p-6 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <p className="font-semibold mb-1">Thank you for your feedback!</p>
        <p className="text-sm text-muted-foreground">Your rating helps us improve our services.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Rate your experience</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= (hover || rating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-1">Comment (optional)</label>
        <textarea
          rows={3}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          Add photos (optional, max 3)
        </label>
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {previews.map((preview, i) => (
              <div key={i} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${i + 1}`}
                  className="h-20 w-20 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 3 && (
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-foreground cursor-pointer transition-colors">
            <ImagePlus className="h-4 w-4" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              multiple
            />
          </label>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;
