fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .compile_protos(
            &[
                "../../proto/ingestion.proto",
                "../../proto/exam.proto",
                "../../proto/history.proto",
            ],
            &["../../proto"],
        )?;
    Ok(())
}
