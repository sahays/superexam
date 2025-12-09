mod db;

pub mod pb {
    pub mod ingestion {
        tonic::include_proto!("superexam.ingestion");
    }
    pub mod exam {
        tonic::include_proto!("superexam.exam");
    }
    pub mod history {
        tonic::include_proto!("superexam.history");
    }
}

use dotenv::dotenv;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    println!("Starting SuperExam Server...");

    let db = db::init_firestore().await;
    
    match db {
        Ok(_database) => {
            println!("Firestore connected successfully.");
        }
        Err(e) => {
            eprintln!("Failed to connect to Firestore: {}", e);
            eprintln!("Ensure GOOGLE_APPLICATION_CREDENTIALS is set and points to a valid service account JSON.");
        }
    }

    Ok(())
}