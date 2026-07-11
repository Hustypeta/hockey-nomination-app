-- Staff / admin announcement posts on community forum
ALTER TABLE "community_posts" ADD COLUMN "isStaffPost" BOOLEAN NOT NULL DEFAULT false;
