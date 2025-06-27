use std::path::PathBuf;

use clap::Parser;

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    #[arg(short, long, help = "입력 파일 경로")]
    pub input_file_path: PathBuf,
    #[arg(short, long, help = "출력 디렉토리 경로")]
    pub output_dir_path: PathBuf,
}

#[test]
fn verify_cli() {
    use clap::CommandFactory;
    Cli::command().debug_assert();
}
