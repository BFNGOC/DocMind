DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "knowledge_bases" AS kb
        LEFT JOIN "knowledge_base_members" AS member
            ON member."knowledge_base_id" = kb."id"
            AND member."role" = 'OWNER'
        GROUP BY kb."id"
        HAVING COUNT(member."id") <> 1
    ) THEN
        RAISE EXCEPTION
            'Cannot enforce Knowledge Base ownership: every existing Knowledge Base must have exactly one OWNER';
    END IF;
END
$$;

ALTER TYPE "kb_member_role" ADD VALUE 'ADMIN';

CREATE UNIQUE INDEX "knowledge_base_members_one_owner_per_kb"
    ON "knowledge_base_members" ("knowledge_base_id")
    WHERE "role" = 'OWNER';

CREATE FUNCTION "assert_knowledge_base_has_one_owner"("target_id" UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    "owner_count" BIGINT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM "knowledge_bases"
        WHERE "id" = "target_id"
    ) THEN
        RETURN;
    END IF;

    SELECT COUNT(*)
    INTO "owner_count"
    FROM "knowledge_base_members"
    WHERE "knowledge_base_id" = "target_id"
        AND "role" = 'OWNER';

    IF "owner_count" <> 1 THEN
        RAISE EXCEPTION
            'Knowledge Base % must have exactly one OWNER', "target_id"
            USING ERRCODE = '23514';
    END IF;
END
$$;

CREATE FUNCTION "check_member_owner_invariant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM "assert_knowledge_base_has_one_owner"(OLD."knowledge_base_id");
        RETURN NULL;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD."knowledge_base_id" <> NEW."knowledge_base_id" THEN
            PERFORM "assert_knowledge_base_has_one_owner"(OLD."knowledge_base_id");
        END IF;
    END IF;

    PERFORM "assert_knowledge_base_has_one_owner"(NEW."knowledge_base_id");
    RETURN NULL;
END
$$;

CREATE FUNCTION "check_new_knowledge_base_owner_invariant"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM "assert_knowledge_base_has_one_owner"(NEW."id");
    RETURN NULL;
END
$$;

CREATE CONSTRAINT TRIGGER "knowledge_base_members_owner_invariant"
    AFTER INSERT OR UPDATE OR DELETE ON "knowledge_base_members"
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION "check_member_owner_invariant"();

CREATE CONSTRAINT TRIGGER "knowledge_bases_owner_invariant"
    AFTER INSERT ON "knowledge_bases"
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION "check_new_knowledge_base_owner_invariant"();
