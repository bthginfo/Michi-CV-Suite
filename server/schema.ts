// Additive, repeatable migrations for this application's dedicated Neon database.
export const migrations=[
  `CREATE TABLE IF NOT EXISTS cv_documents (
    id text PRIMARY KEY,
    document jsonb NOT NULL,
    etag uuid NOT NULL,
    saved_at timestamptz NOT NULL DEFAULT now(),
    pristine boolean NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS cv_shares (
    id uuid PRIMARY KEY,
    source_id text NOT NULL REFERENCES cv_documents(id),
    document jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];
