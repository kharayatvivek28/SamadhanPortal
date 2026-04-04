import { useState, useEffect } from "react";
import { useAuth, getAuthHeaders } from "@/context/AuthContext";
import { Send, User, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  _id: string;
  text: string;
  isStaff: boolean;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

interface Props {
  complaintDbId: string;
  complaintStatus?: string;
  assignedOfficerId?: string;
}

const CommentsThread = ({ complaintDbId, complaintStatus, assignedOfficerId }: Props) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/complaints/${complaintDbId}/comments`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setFetching(false);
      }
    };
    if (complaintDbId) fetchComments();
  }, [complaintDbId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${complaintDbId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: newText }),
      });

      if (res.ok) {
        const data = await res.json();
        // Since populated user comes as ID in creation, we manually inject it for immediate UI update
        const newComment = {
          ...data,
          user: { _id: user?._id, name: user?.name, role: user?.role }
        };
        setComments([...comments, newComment]);
        setNewText("");
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-sm text-muted-foreground py-4">Loading conversation...</div>;

  return (
    <div className="bg-card border rounded-lg shadow-sm flex flex-col mt-6 overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30">
        <h3 className="font-semibold text-foreground">Conversation</h3>
        <p className="text-xs text-muted-foreground">Chat directly about this issue</p>
      </div>

      <div className="p-5 flex-1 max-h-[400px] overflow-y-auto flex flex-col gap-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment, i) => {
              const myMessage = comment.user._id === user?._id;
              const isStaff = comment.isStaff;

              return (
                <motion.div
                  key={comment._id || i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col max-w-[85%] ${myMessage ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-foreground">
                      {myMessage ? "You" : comment.user?.name || "User"}
                    </span>
                    {isStaff && !myMessage && (
                      <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Staff
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      myMessage
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : isStaff
                        ? "bg-muted border border-border rounded-bl-sm"
                        : "bg-background border border-border text-foreground rounded-bl-sm"
                    }`}
                  >
                    {comment.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {(() => {
        const isClosed = complaintStatus === 'Resolved' || complaintStatus === 'Revoked';
        const isUnassigned = !assignedOfficerId;
        const isIncorrectEmployee = user?.role === 'employee' && user?._id !== assignedOfficerId;

        if (isClosed) {
          return (
            <div className="border-t p-4 bg-muted/20 text-center text-sm text-muted-foreground italic z-10">
              Conversation is closed because the complaint is {complaintStatus}.
            </div>
          );
        }
        if (isUnassigned && user?.role !== 'admin') {
          return (
            <div className="border-t p-4 bg-muted/20 text-center text-sm text-muted-foreground italic z-10">
              Conversation unlocks once an officer is assigned.
            </div>
          );
        }
        if (isIncorrectEmployee) {
          return (
            <div className="border-t p-4 bg-muted/20 text-center text-sm text-muted-foreground italic z-10">
              Only the initially assigned officer can reply to this conversation.
            </div>
          );
        }

        return (
          <form onSubmit={handleSubmit} className="border-t p-3 bg-muted/10 flex items-center gap-2 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background border px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              disabled={loading}
            />
            <motion.button
              type="submit"
              disabled={!newText.trim() || loading}
              whileTap={{ scale: 0.9 }}
              className="bg-primary hover:bg-primary/90 text-white rounded-full p-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-5 h-5 ml-px" />
            </motion.button>
          </form>
        );
      })()}
    </div>
  );
};

export default CommentsThread;
