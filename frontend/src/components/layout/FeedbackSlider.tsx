import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, User, ImageIcon } from "lucide-react";

interface FeedbackItem {
  _id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  user: {
    _id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  };
  complaint: {
    _id: string;
    complaintId: string;
    title: string;
    description: string;
    attachments: string[];
    department?: {
      name: string;
    };
  };
}

const FeedbackSlider = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  // For image gallery within a single feedback
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await apiFetch("/api/feedback/public-feed");
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data.filter((f: any) => f.complaint));
        }
      } catch (err) {
        console.error("Failed to fetch public feedback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Auto-scroll every 6 seconds
  useEffect(() => {
    if (feedbacks.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
      setActiveImageIndex(0);
    }, 6000);
    return () => clearInterval(interval);
  }, [feedbacks.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    setActiveImageIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
    setActiveImageIndex(0);
  };

  if (loading || feedbacks.length === 0) {
    return null;
  }

  const current = feedbacks[currentIndex];

  // Priority: feedback images > complaint attachments > placeholder
  const feedbackImages = current.images && current.images.length > 0 ? current.images : [];
  const complaintPhotos = current.complaint.attachments && current.complaint.attachments.length > 0 ? current.complaint.attachments : [];
  const allImages = feedbackImages.length > 0 ? feedbackImages : complaintPhotos;
  const hasImages = allImages.length > 0;
  const isFeedbackImage = feedbackImages.length > 0;

  // Format the user name
  const displayName = current.user.firstName 
    ? `${current.user.firstName} ${current.user.lastName ? current.user.lastName.charAt(0) + '.' : ''}`
    : current.user.name.split(' ')[0];

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-xl bg-card border shadow-sm">
      <div className="flex flex-col md:flex-row min-h-[400px]">
        
        {/* Left Side: The Citizen's Feedback & Complaint details */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-muted/30">
          <div className="mb-6 flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              {current.complaint.department?.name || "General"}
            </span>
            <h3 className="text-2xl font-bold text-foreground leading-tight">
              "{current.complaint.title}"
            </h3>
          </div>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= current.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>

          <p className="text-muted-foreground italic mb-8 relative z-10">
            <span className="text-4xl text-primary/20 absolute -top-4 -left-2 -z-10">"</span>
            {current.comment || "Complaint resolved successfully by the department."}
            <span className="text-4xl text-primary/20 absolute -bottom-6 ml-2 -z-10">"</span>
          </p>

          <div className="flex items-center gap-3 mt-auto pt-6 border-t font-medium text-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground font-normal">Citizen</p>
            </div>
          </div>
        </div>

        {/* Right Side: Images (feedback images preferred, then complaint attachments) */}
        <div className="hidden md:block w-2/5 relative bg-secondary">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current._id}-${activeImageIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {hasImages ? (
                <div className="h-full w-full relative group">
                  <img 
                    src={allImages[activeImageIndex]} 
                    alt={current.complaint.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-sm font-semibold tracking-wide">
                        ISSUE RESOLVED
                      </span>
                      {isFeedbackImage && (
                        <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-sm font-semibold tracking-wide flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> CITIZEN PHOTO
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Thumbnail strip for multiple images */}
                  {allImages.length > 1 && (
                    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`h-10 w-10 rounded border-2 overflow-hidden transition-all ${
                            i === activeImageIndex ? "border-white scale-110" : "border-white/40 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-primary/5 text-primary p-6 text-center">
                   <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <Star className="h-12 w-12 text-emerald-600 fill-emerald-600" />
                   </div>
                   <h4 className="text-xl font-bold mb-2">Issue Resolved</h4>
                   <p className="text-sm opacity-80 max-w-[200px]">This complaint was successfully handled by our officers.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      {feedbacks.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 hover:bg-background border shadow-sm rounded-full flex items-center justify-center text-foreground transition-colors backdrop-blur-sm z-20"
            aria-label="Previous feedback"
          >
            <ChevronLeft className="h-5 w-5 pr-0.5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 hover:bg-background border shadow-sm rounded-full flex items-center justify-center text-foreground transition-colors backdrop-blur-sm z-20 md:right-[calc(40%+1rem)]"
            aria-label="Next feedback"
          >
            <ChevronRight className="h-5 w-5 pl-0.5" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 md:right-[40%] flex justify-center gap-2 z-20">
            {feedbacks.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setActiveImageIndex(0); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/30"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackSlider;
