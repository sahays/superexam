use firestore::FirestoreDb;
use anyhow::Result;
use std::env;

pub async fn init_firestore() -> Result<FirestoreDb> {
    // Determine project_id:
    // 1. Try PROJECT_ID env var.
    // 2. Try GOOGLE_CLOUD_PROJECT env var.
    // 3. Fallback to letting FirestoreDb infer from Gcloud SDK or Metadata server (if applicable).
    
    let project_id = env::var("PROJECT_ID")
        .or_else(|_| env::var("GOOGLE_CLOUD_PROJECT"))
        .unwrap_or_else(|_| "superexam-dev".to_string()); // Fallback or expect error later if not found

    println!("Initializing Firestore for project: {}", project_id);

    let db = FirestoreDb::new(&project_id).await?;
    
    Ok(db)
}
