use crate::types::AvailableVersions;
use reqwest::header::HeaderMap;
use reqwest::Client;

const DATABASE_URL: &str = "https://raw.githubusercontent.com/LukasPAH/minecraft-windows-gdk-version-db/refs/heads/main/historical_versions.json";

pub async fn get_available_versions(
    client: &Client,
) -> Result<AvailableVersions, Box<dyn std::error::Error>> {
    println!("Getting database of versions...");

    let mut headers = HeaderMap::new();
    headers.insert("Accept", "application/json".parse().unwrap());
    let response = client.get(DATABASE_URL).headers(headers).send().await?;
    let response_text = response.text().await?;

    let parsed_response: AvailableVersions = serde_json::from_str(&response_text)?;
    println!("Received version database!");
    Ok(parsed_response)
}
