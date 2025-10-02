/**
 * User Feedback Collection Component
 * Simple feedback system for continuous improvement
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAnalytics } from '@/services/analyticsService';
import { toast } from 'sonner';

interface FeedbackData {
  type: 'satisfaction' | 'feature_request' | 'bug_report' | 'general';
  rating: number; // 1-5 stars
  easeOfUse: number; // 1-5
  usefulness: number; // 1-5
  comments: string;
  feature?: string;
  timestamp: Date;
}

interface FeedbackCollectionProps {
  feature?: string;
  onFeedbackSubmitted?: (feedback: FeedbackData) => void;
}

export const FeedbackCollection: React.FC<FeedbackCollectionProps> = ({
  feature,
  onFeedbackSubmitted
}) => {
  const { trackEvent } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    type: 'general',
    rating: 0,
    easeOfUse: 0,
    usefulness: 0,
    comments: '',
    feature: feature || 'general'
  });

  const handleSubmit = async () => {
    if (!feedback.rating || !feedback.easeOfUse || !feedback.usefulness) {
      toast.error('Please fill in all rating fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        ...feedback as FeedbackData,
        timestamp: new Date()
      };

      // Track the feedback event
      trackEvent({
        eventType: 'feedback',
        feature: feedback.feature || 'general',
        action: 'submit',
        metadata: {
          type: feedback.type,
          rating: feedback.rating,
          easeOfUse: feedback.easeOfUse,
          usefulness: feedback.usefulness,
          hasComments: !!feedback.comments
        }
      });

      // In a real app, this would send to backend
      console.log('Feedback submitted:', feedbackData);

      // Call external handler if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedbackData);
      }

      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');

      // Close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setFeedback({
          type: 'general',
          rating: 0,
          easeOfUse: 0,
          usefulness: 0,
          comments: '',
          feature: feature || 'general'
        });
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className={`p-1 h-8 w-8 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onChange(star)}
          >
            <Star className="h-4 w-4 fill-current" />
          </Button>
        ))}
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Feedback Submitted!</p>
              <p className="text-sm text-green-600">Thank you for helping us improve</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Share Your Feedback
        </CardTitle>
        <CardDescription>
          Help us improve Anand Saathi for better farming experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={isOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            {isOpen ? 'Close Feedback' : 'Give Feedback'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trackEvent({
                eventType: 'feedback',
                feature: feature || 'general',
                action: 'quick_positive'
              });
              toast.success('Thank you! 👍');
            }}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Good
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trackEvent({
                eventType: 'feedback',
                feature: feature || 'general',
                action: 'quick_negative'
              });
              toast.error('Sorry to hear that! We\'ll improve.');
            }}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            Needs Work
          </Button>
        </div>

        {isOpen && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StarRating
                value={feedback.rating || 0}
                onChange={(value) => setFeedback(prev => ({ ...prev, rating: value }))}
                label="Overall Rating"
              />

              <StarRating
                value={feedback.easeOfUse || 0}
                onChange={(value) => setFeedback(prev => ({ ...prev, easeOfUse: value }))}
                label="Ease of Use"
              />

              <StarRating
                value={feedback.usefulness || 0}
                onChange={(value) => setFeedback(prev => ({ ...prev, usefulness: value }))}
                label="Usefulness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <Select
                value={feedback.type}
                onValueChange={(value: any) => setFeedback(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Share your thoughts, suggestions, or report issues..."
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !feedback.rating || !feedback.easeOfUse || !feedback.usefulness}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <AlertCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackCollection;
