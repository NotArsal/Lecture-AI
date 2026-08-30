#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use napi::bindgen_prelude::*;
use std::fs::File;
use std::io::Read;
use std::process::Command;

#[napi(object)]
pub struct SignatureCheckResult {
    pub valid: bool,
    pub detected_type: Option<String>,
    pub detected_mime: Option<String>,
    pub error: Option<String>,
}

struct FileSignature {
    bytes: &'static [u8],
    offset: usize,
    extension: &'static str,
    mime_type: &'static str,
}

const FILE_SIGNATURES: &[FileSignature] = &[
    FileSignature { bytes: &[0xff, 0xfb], offset: 0, extension: "mp3", mime_type: "audio/mpeg" },
    FileSignature { bytes: &[0xff, 0xf3], offset: 0, extension: "mp3", mime_type: "audio/mpeg" },
    FileSignature { bytes: &[0xff, 0xf2], offset: 0, extension: "mp3", mime_type: "audio/mpeg" },
    FileSignature { bytes: &[0x49, 0x44, 0x33], offset: 0, extension: "mp3", mime_type: "audio/mpeg" },
    FileSignature { bytes: &[0x52, 0x49, 0x46, 0x46], offset: 0, extension: "wav", mime_type: "audio/wav" },
    FileSignature { bytes: &[0x66, 0x4c, 0x61, 0x43], offset: 0, extension: "flac", mime_type: "audio/flac" },
    FileSignature { bytes: &[0x4f, 0x67, 0x67, 0x53], offset: 0, extension: "ogg", mime_type: "audio/ogg" },
    FileSignature { bytes: &[0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41], offset: 4, extension: "m4a", mime_type: "audio/m4a" },
    FileSignature { bytes: &[0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], offset: 4, extension: "mp4", mime_type: "video/mp4" },
    FileSignature { bytes: &[0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32], offset: 4, extension: "mp4", mime_type: "video/mp4" },
    FileSignature { bytes: &[0x1a, 0x45, 0xdf, 0xa3], offset: 0, extension: "mkv", mime_type: "video/x-matroska" },
    FileSignature { bytes: &[0x66, 0x74, 0x79, 0x70, 0x71, 0x74], offset: 4, extension: "mov", mime_type: "video/quicktime" },
    FileSignature { bytes: &[0x52, 0x49, 0x46, 0x46], offset: 0, extension: "avi", mime_type: "video/x-msvideo" },
];

#[napi]
pub fn validate_file_signature(filepath: String) -> SignatureCheckResult {
    let mut file = match File::open(&filepath) {
        Ok(f) => f,
        Err(e) => return SignatureCheckResult {
            valid: false,
            detected_type: None,
            detected_mime: None,
            error: Some(format!("Failed to open file: {}", e)),
        },
    };

    let mut buffer = [0u8; 12];
    let bytes_read = match file.read(&mut buffer) {
        Ok(n) => n,
        Err(e) => return SignatureCheckResult {
            valid: false,
            detected_type: None,
            detected_mime: None,
            error: Some(format!("Failed to read file header: {}", e)),
        },
    };

    for sig in FILE_SIGNATURES {
        let end_idx = sig.offset + sig.bytes.len();
        if bytes_read >= end_idx {
            let slice = &buffer[sig.offset..end_idx];
            if slice == sig.bytes {
                return SignatureCheckResult {
                    valid: true,
                    detected_type: Some(sig.extension.to_string()),
                    detected_mime: Some(sig.mime_type.to_string()),
                    error: None,
                };
            }
        }
    }

    SignatureCheckResult {
        valid: false,
        detected_type: None,
        detected_mime: None,
        error: Some("Could not determine file type from magic bytes".to_string()),
    }
}

#[napi(object)]
pub struct ProcessMediaResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub error: Option<String>,
}

/// Uses standard ffmpeg subprocess wrapped safely in Rust to avoid Node.js memory overhead
#[napi]
pub async fn extract_and_compress_audio(input_path: String, output_path: String) -> Result<ProcessMediaResult> {
    // We execute ffmpeg natively via Rust, avoiding Node.js child_process entirely.
    // ffmpeg -i input.mp4 -vn -ar 16000 -ac 1 -b:a 48k output.mp3 -y
    let output = Command::new("ffmpeg")
        .args(&[
            "-i", &input_path,
            "-vn",
            "-ar", "16000",
            "-ac", "1",
            "-b:a", "48k",
            &output_path,
            "-y"
        ])
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(ProcessMediaResult {
                    success: true,
                    output_path: Some(output_path),
                    error: None,
                })
            } else {
                let err_str = String::from_utf8_lossy(&out.stderr);
                Ok(ProcessMediaResult {
                    success: false,
                    output_path: None,
                    error: Some(format!("ffmpeg error: {}", err_str)),
                })
            }
        },
        Err(e) => Ok(ProcessMediaResult {
            success: false,
            output_path: None,
            error: Some(format!("Failed to spawn ffmpeg: {}", e)),
        }),
    }
}
