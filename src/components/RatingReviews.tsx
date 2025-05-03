
import React, { useState } from 'react';
import { UserRating } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RatingReviewsProps {
  movieId: string;
  title: string;
  userRating?: UserRating;
  allRatings: UserRating[];
  onAddRating: (rating: number, review?: string) => Promise<void>;
  onUpdateRating: (id: string, rating: number, review?: string) => Promise<void>;
  onDeleteRating: (id: string) => Promise<void>;
}

const RatingReviews: React.FC<RatingReviewsProps> = ({
  movieId,
  title,
  userRating,
  allRatings,
  onAddRating,
  onUpdateRating,
  onDeleteRating
}) => {
  const [currentRating, setCurrentRating] = useState<number>(userRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>(userRating?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (currentRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (userRating) {
        await onUpdateRating(userRating.id, currentRating, review);
        toast({
          title: "Rating updated",
          description: "Your rating has been updated successfully",
        });
      } else {
        await onAddRating(currentRating, review);
        toast({
          title: "Rating submitted",
          description: "Your rating has been submitted successfully",
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your rating",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userRating) return;
    
    if (confirm("Are you sure you want to delete your rating?")) {
      setIsSubmitting(true);
      try {
        await onDeleteRating(userRating.id);
        setCurrentRating(0);
        setReview('');
        toast({
          title: "Rating deleted",
          description: "Your rating has been deleted successfully",
        });
        setDialogOpen(false);
      } catch (error) {
        console.error("Error deleting rating:", error);
        toast({
          title: "Error",
          description: "There was a problem deleting your rating",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const calculateAverageRating = () => {
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / allRatings.length) * 10) / 10;
  };

  const renderStars = (rating: number, onStarClick?: (index: number) => void, onStarHover?: (index: number) => void, onStarLeave?: () => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={cn(
              "h-6 w-6 cursor-pointer transition-colors",
              index <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
            )}
            onClick={() => onStarClick && onStarClick(index)}
            onMouseEnter={() => onStarHover && onStarHover(index)}
            onMouseLeave={() => onStarLeave && onStarLeave()}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Ratings & Reviews</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-hype-purple hover:bg-hype-purple/90">
              {userRating ? "Edit Your Rating" : "Add Rating"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{userRating ? "Edit Rating" : "Rate"} - {title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex justify-center mb-4">
                {renderStars(
                  hoverRating || currentRating,
                  (index) => setCurrentRating(index),
                  (index) => setHoverRating(index),
                  () => setHoverRating(0)
                )}
              </div>
              <Textarea
                placeholder="Write a review (optional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter className="sm:justify-between">
              <div>
                {userRating && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    Delete Rating
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || currentRating === 0}
                  className="bg-hype-purple hover:bg-hype-purple/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 bg-muted/30 rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">{calculateAverageRating()}</span>
            {renderStars(Math.round(calculateAverageRating()))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Based on {allRatings.length} rating{allRatings.length !== 1 ? 's' : ''}</p>
        </div>
        {userRating && (
          <div className="text-right">
            <p className="text-sm font-medium">Your rating</p>
            <div className="flex justify-end mt-1">
              {renderStars(userRating.rating)}
            </div>
          </div>
        )}
      </div>

      {allRatings.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Reviews</h4>
          {allRatings.filter(r => r.review && r.review.trim()).map((rating) => (
            <div key={rating.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between">
                <div className="flex">
                  {renderStars(rating.rating)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(rating.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2 text-sm">{rating.review}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingReviews;
