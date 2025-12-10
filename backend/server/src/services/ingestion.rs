use crate::pb::ingestion::ingestion_service_server::IngestionService;
use crate::pb::ingestion::{
    ingestion_status, Document as ProtoDocument, IngestionStatus, ListDocumentsRequest,
    ListDocumentsResponse, ProcessRequest, UploadRequest,
};
use chrono::Utc;
use firestore::*;
use futures::stream::StreamExt;
use lopdf::Document;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status};
use uuid::Uuid;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct FirestoreDocument {
    id: String,
    filename: String,
    status: String,
    created_at: String,
}

pub struct IngestionServiceImpl {
    pub db: Arc<FirestoreDb>,
    pub gemini_api_key: String,
}

#[tonic::async_trait]
impl IngestionService for IngestionServiceImpl {
    type UploadPdfStream = ReceiverStream<Result<IngestionStatus, Status>>;

    async fn upload_pdf(
        &self,
        request: Request<UploadRequest>,
    ) -> Result<Response<Self::UploadPdfStream>, Status> {
        let req = request.into_inner();
        let (tx, rx) = mpsc::channel(4);
        let db = self.db.clone();
        let _api_key = self.gemini_api_key.clone();

        tokio::spawn(async move {
            let doc_id = Uuid::new_v4().to_string();
            let file_data = req.file_data;
            let metadata = req.metadata.unwrap_or_default();
            let user_prompt = metadata.user_prompt;
            let filename = metadata.filename;

            // 1. Save File to Disk
            let upload_dir = "storage/uploads";
            if let Err(e) = tokio::fs::create_dir_all(upload_dir).await {
                let _ = tx.send(Ok(IngestionStatus {
                    state: ingestion_status::State::Failed as i32,
                    message: format!("Failed to create storage directory: {}", e),
                    document_id: doc_id.clone(),
                    progress_percent: 0,
                })).await;
                return;
            }

            let file_path = format!("{}/{}_{}.pdf", upload_dir, doc_id, filename);
            if let Err(e) = tokio::fs::write(&file_path, &file_data).await {
                let _ = tx.send(Ok(IngestionStatus {
                    state: ingestion_status::State::Failed as i32,
                    message: format!("Failed to save file: {}", e),
                    document_id: doc_id.clone(),
                    progress_percent: 0,
                })).await;
                return;
            }

            // 2. Create Initial DB Record
            let firestore_doc = FirestoreDocument {
                id: doc_id.clone(),
                filename: filename.clone(),
                status: "Uploaded".to_string(),
                created_at: Utc::now().to_rfc3339(),
            };

            if let Err(e) = db
                .fluent()
                .insert()
                .into("superexam-documents")
                .document_id(&doc_id)
                .object(&firestore_doc)
                .execute::<()>()
                .await
            {
                let _ = tx.send(Ok(IngestionStatus {
                    state: ingestion_status::State::Failed as i32,
                    message: format!("Failed to create DB record: {}", e),
                    document_id: doc_id.clone(),
                    progress_percent: 0,
                })).await;
                return;
            }

            // Notify Client: Uploaded
            let _ = tx.send(Ok(IngestionStatus {
                state: ingestion_status::State::Queued as i32,
                message: "File uploaded and saved.".to_string(),
                document_id: doc_id.clone(),
                progress_percent: 10,
            })).await;

            // 3. Start Extraction Task
            run_extraction_task(doc_id, filename, user_prompt, file_data, db, tx).await;
        });

        Ok(Response::new(ReceiverStream::new(rx)))
    }

    type ProcessDocumentStream = ReceiverStream<Result<IngestionStatus, Status>>;

    async fn process_document(
        &self,
        request: Request<ProcessRequest>,
    ) -> Result<Response<Self::ProcessDocumentStream>, Status> {
        let req = request.into_inner();
        let doc_id = req.document_id;
        let prompt_override = req.prompt_override;
        
        let (tx, rx) = mpsc::channel(4);
        let db = self.db.clone();

        tokio::spawn(async move {
            // Fetch document
            let doc: Option<FirestoreDocument> = db
                .fluent()
                .select()
                .by_id_in("superexam-documents")
                .obj()
                .one(&doc_id)
                .await
                .unwrap_or(None);

            if let Some(doc) = doc {
                let filename = doc.filename.clone();
                let upload_dir = "storage/uploads";
                let file_path = format!("{}/{}_{}.pdf", upload_dir, doc_id, filename);

                // Read file
                match tokio::fs::read(&file_path).await {
                    Ok(file_data) => {
                        let prompt = if !prompt_override.is_empty() {
                             prompt_override
                        } else {
                            "".to_string() // Could fetch original prompt if stored
                        };
                        
                        run_extraction_task(doc_id, filename, prompt, file_data, db, tx).await;
                    },
                    Err(e) => {
                        let _ = tx.send(Ok(IngestionStatus {
                            state: ingestion_status::State::Failed as i32,
                            message: format!("File not found: {}", e),
                            document_id: doc_id,
                            progress_percent: 0,
                        })).await;
                    }
                }
            } else {
                let _ = tx.send(Ok(IngestionStatus {
                    state: ingestion_status::State::Failed as i32,
                    message: "Document not found".to_string(),
                    document_id: doc_id,
                    progress_percent: 0,
                })).await;
            }
        });

        Ok(Response::new(ReceiverStream::new(rx)))
    }

    async fn list_documents(
        &self,
        _request: Request<ListDocumentsRequest>,
    ) -> Result<Response<ListDocumentsResponse>, Status> {
        let documents_stream = self
            .db
            .fluent()
            .select()
            .from("superexam-documents")
            .obj::<FirestoreDocument>()
            .stream_query()
            .await
            .map_err(|e| Status::internal(format!("Database error: {}", e)))?;

        let documents: Vec<FirestoreDocument> = documents_stream.collect().await;

        let proto_documents = documents
            .into_iter()
            .map(|d| ProtoDocument {
                id: d.id,
                filename: d.filename,
                status: d.status,
                created_at: d.created_at,
            })
            .collect();

        Ok(Response::new(ListDocumentsResponse {
            documents: proto_documents,
            next_page_token: "".to_string(),
        }))
    }
}

async fn run_extraction_task(
    doc_id: String,
    _filename: String,
    user_prompt: String,
    file_data: Vec<u8>,
    db: Arc<FirestoreDb>,
    tx: mpsc::Sender<Result<IngestionStatus, Status>>,
) {
    // 3. Extract Text (PDF Parsing)
    let _ = tx.send(Ok(IngestionStatus {
        state: ingestion_status::State::ProcessingText as i32,
        message: "Parsing PDF text...".to_string(),
        document_id: doc_id.clone(),
        progress_percent: 20,
    })).await;

    // Retrieve current doc to update (or just update fields if possible, but firestore crate usually replaces or merges)
    // We'll just construct the struct. Wait, we need created_at.
    // For simplicity, we assume we just update status. 
    // `update` in firestore crate usually requires the full object or merge support.
    // If we use `update().merge(true)`, we might need a partial struct or map.
    // Let's try to fetch and update to be safe, or just use the struct if we had it.
    // Fetching again is safer.
    
    let mut firestore_doc: FirestoreDocument = match db.fluent().select().by_id_in("superexam-documents").obj().one(&doc_id).await {
        Ok(Some(d)) => d,
        _ => {
             // Should not happen if called correctly
             return;
        }
    };

    firestore_doc.status = "Processing".to_string();
    let _ = db.fluent().update().in_col("superexam-documents").document_id(&doc_id).object(&firestore_doc).execute::<()>().await;

    let text_content = match extract_text_from_pdf(&file_data) {
        Ok(text) => text,
        Err(e) => {
             let _ = tx.send(Ok(IngestionStatus {
                state: ingestion_status::State::Failed as i32,
                message: format!("Failed to parse PDF: {}", e),
                document_id: doc_id.clone(),
                progress_percent: 0,
            })).await;
            
            firestore_doc.status = "Failed".to_string();
            let _ = db.fluent().update().in_col("superexam-documents").document_id(&doc_id).object(&firestore_doc).execute::<()>().await;
            return;
        }
    };

    // 4. Call Gemini
    let _ = tx
        .send(Ok(IngestionStatus {
            state: ingestion_status::State::ProcessingText as i32,
            message: "Consulting Gemini AI...".to_string(),
            document_id: doc_id.clone(),
            progress_percent: 40,
        }))
        .await;

    // Prepare the prompt
    let system_prompt =
        "You are an expert Exam Parser. Extract questions, choices, and answers into JSON.";
    let _full_prompt = format!(
        "{}\n\nUser Instruction: {}\n\nDocument Text:\n{}",
        system_prompt, user_prompt, text_content
    );

    // Mocking the call
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    // 5. Save Extraction Result (Simulated)
    let _ = tx
        .send(Ok(IngestionStatus {
            state: ingestion_status::State::Saving as i32,
            message: "Saving extraction results...".to_string(),
            document_id: doc_id.clone(),
            progress_percent: 80,
        }))
        .await;

    // 6. Complete
    firestore_doc.status = "Succeeded".to_string();
    let _ = db.fluent().update().in_col("superexam-documents").document_id(&doc_id).object(&firestore_doc).execute::<()>().await;

    let _ = tx
        .send(Ok(IngestionStatus {
            state: ingestion_status::State::Completed as i32,
            message: "Extraction complete!".to_string(),
            document_id: doc_id.clone(),
            progress_percent: 100,
        }))
        .await;
}

fn extract_text_from_pdf(data: &[u8]) -> anyhow::Result<String> {
    let doc = Document::load_mem(data)?;
    let mut text = String::new();
    for (page_num, _) in doc.get_pages() {
        let content = doc.extract_text(&[page_num])?;
        text.push_str(&content);
        text.push('\n');
    }
    Ok(text)
}
