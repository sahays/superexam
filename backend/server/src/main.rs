mod db;
mod services;

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
use tonic::transport::Server;
use std::sync::Arc;
use crate::services::ingestion::IngestionServiceImpl;
use crate::pb::ingestion::ingestion_service_server::IngestionServiceServer;
use std::env;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    println!("Starting SuperExam Server...");

    let db = db::init_firestore().await;
    
    let database = match db {
        Ok(db) => {
            println!("Firestore connected successfully.");
            Arc::new(db)
        }
        Err(e) => {
            eprintln!("Failed to connect to Firestore: {}", e);
            eprintln!("Continuing without DB for testing (or exit)...");
            // In a real app, we might exit. For now, we return/panic.
            return Err(e);
        }
    };

    let addr = "0.0.0.0:50051".parse()?;
    let gemini_key = env::var("GEMINI_API_KEY").unwrap_or_default();

    let ingestion_service = IngestionServiceImpl {
        db: database.clone(),
        gemini_api_key: gemini_key,
    };

    println!("gRPC Server listening on {}", addr);

    Server::builder()
        .accept_http1(true) // Support for gRPC-Web if using a proxy, or general robustness
        .add_service(IngestionServiceServer::new(ingestion_service))
        .serve(addr)
        .await?;

    Ok(())
}