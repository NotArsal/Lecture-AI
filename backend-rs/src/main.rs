use axum::{
    routing::{get, post},
    Router,
    Json,
};
use serde_json::Value;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    // Build our application with a route
    let app = Router::new()
        .route("/", get(root))
        .route("/v1/audio/transcriptions", post(transcribe))
        .route("/v1/chat/completions", post(chat))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("Rust AI backend running on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "LectureAI Rust Backend is Running!"
}

async fn transcribe() -> Json<Value> {
    // TODO: Invoke whisper-ctranslate2 or whisper-rs locally here
    Json(serde_json::json!({
        "text": "This is a mocked transcription from the new Rust backend!"
    }))
}

async fn chat() -> Json<Value> {
    // TODO: Pipe to local Ollama instance here
    Json(serde_json::json!({
        "choices": [{
            "message": {
                "content": "This is a mocked summary from the new Rust backend!"
            }
        }]
    }))
}
