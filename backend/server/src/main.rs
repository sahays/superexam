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

use crate::pb::ingestion::ingestion_service_server::IngestionServiceServer;
use crate::services::ingestion::IngestionServiceImpl;
use anyhow::Result;
use dotenv::dotenv;
use std::env;
use std::sync::Arc;
use tonic::transport::Server;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() -> Result<()> {
    // Explicitly set the CryptoProvider to ring to avoid ambiguity between ring and aws-lc-rs
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install rustls crypto provider");

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

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_headers(Any)
        .allow_methods(Any);

    Server::builder()
        .accept_http1(true) // Support for gRPC-Web
        .layer(cors)
        .add_service(tonic_web::enable(IngestionServiceServer::new(
            ingestion_service,
        )))
        .serve(addr)
        .await?;

    Ok(())
}
