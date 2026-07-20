ALTER TABLE "points_ledger" DROP CONSTRAINT "points_ledger_award_unique";--> statement-breakpoint
ALTER TABLE "points_ledger" ADD COLUMN "problem_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_ledger" ADD CONSTRAINT "points_ledger_award_unique" UNIQUE("user_id","problem_id","reason");