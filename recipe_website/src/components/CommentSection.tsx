"use client";

import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import Button from "./ui/Button";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  recipeId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  recipeId,
  initialComments,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        router.refresh();
        // Refetch comments
        const commentsResponse = await fetch(
          `/api/comments?recipeId=${recipeId}`
        );
        if (commentsResponse.ok) {
          const data = await commentsResponse.json();
          setComments(data);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          content: replyContent,
          parentId,
        }),
      });

      if (response.ok) {
        setReplyContent("");
        setReplyTo(null);
        router.refresh();
        // Refetch comments
        const commentsResponse = await fetch(
          `/api/comments?recipeId=${recipeId}`
        );
        if (commentsResponse.ok) {
          const data = await commentsResponse.json();
          setComments(data);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${
        isReply ? "ml-12 mt-4" : "mt-6"
      } pb-4 border-b border-gray-200 last:border-0`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
          {comment.user.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {comment.user.name}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(new Date(comment.createdAt))}
            </span>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

          {!isReply && session && (
            <button
              onClick={() =>
                setReplyTo(replyTo === comment.id ? null : comment.id)
              }
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <FiMessageCircle className="h-4 w-4" />
              Reply
            </button>
          )}

          {/* Reply form */}
          {replyTo === comment.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReply(comment.id);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
              >
                <FiSend className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12 comment-section">
      <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* New comment form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8 comment-form">
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
          <p className="text-gray-600">
            Please{" "}
            <Link
              href="/auth/signin"
              className="text-primary-600 hover:text-primary-700"
            >
              sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-0">
          {comments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
}
