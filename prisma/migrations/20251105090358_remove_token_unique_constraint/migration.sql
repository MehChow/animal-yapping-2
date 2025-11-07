-- DropIndex
DROP INDEX "public"."Verification_identifier_token_key";

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
